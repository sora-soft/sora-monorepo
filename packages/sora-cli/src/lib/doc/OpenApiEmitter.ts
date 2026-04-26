import * as fs from 'node:fs';
import yaml from 'js-yaml';
import * as path from 'node:path';
import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';
import {AnnotationReader} from '../exporter/AnnotationReader';
import {buildRouteMethodImportMap, findClassDeclaration, isRouteMethod, isRouteNotify, shouldIgnoreMember} from '../exporter/RouteUtils';
import {type DocRouteInfo} from './DocCollector';
import {type OpenAPIPathItem} from './DocTransformer';
import {type SchemaResolver} from './SchemaResolver';

interface OpenAPIDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

class OpenApiEmitter {
  private outputBasePath: string;
  private configDir: string;
  private diagnostics_: DiagnosticCollector | null;

  constructor(
    outputBasePath: string,
    configDir: string,
    diagnostics?: DiagnosticCollector
  ) {
    this.outputBasePath = outputBasePath;
    this.configDir = configDir;
    this.diagnostics_ = diagnostics || null;
  }

  emit(
    pathItems: OpenAPIPathItem[],
    resolver: SchemaResolver,
    program: ts.Program,
    routes: DocRouteInfo[],
    targets: string[] | undefined,
    format: 'yaml' | 'json' = 'yaml'
  ): void {
    this.collectAllSchemas(program, routes, targets, resolver);

    const doc: OpenAPIDocument = {
      openapi: '3.0.0',
      info: this.readInfo(),
      paths: this.buildPaths(pathItems),
    };

    const schemas = resolver.getSchemas();
    if (Object.keys(schemas).length > 0) {
      doc.components = {schemas};
    }

    this.ensureDirectory(this.getOutputPath(format));

    try {
      if (format === 'yaml') {
        fs.writeFileSync(this.getOutputPath('yaml'), yaml.dump(doc, {lineWidth: -1, noRefs: true}), 'utf-8');
      } else {
        fs.writeFileSync(this.getOutputPath('json'), JSON.stringify(doc, null, 2), 'utf-8');
      }
    } catch (err: any) {
      const outputPath = this.getOutputPath(format);
      throw new Error(`Failed to write output file '${outputPath}': ${err.message}`);
    }
  }

  private readInfo(): {title: string; version: string} {
    const pkg = this.findPackageJson();
    if (pkg) {
      return {
        title: pkg.name || 'Sora API',
        version: pkg.version || '1.0.0',
      };
    }
    return {title: 'Sora API', version: '1.0.0'};
  }

  private findPackageJson(): {name?: string; version?: string} | null {
    let dir = this.configDir;
    for (let i = 0; i < 10; i++) {
      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        } catch {
          return null;
        }
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }

  private buildPaths(pathItems: OpenAPIPathItem[]): Record<string, any> {
    const paths: Record<string, any> = {};

    for (const item of pathItems) {
      if (!paths[item.path]) {
        paths[item.path] = {};
      }
      paths[item.path][item.method] = item.operation;
    }

    return paths;
  }

  private collectAllSchemas(
    program: ts.Program,
    routes: DocRouteInfo[],
    targets: string[] | undefined,
    resolver: SchemaResolver
  ): void {
    const checker = program.getTypeChecker();

    for (const routeInfo of routes) {
      const sourceFile = program.getSourceFile(routeInfo.filePath);
      if (!sourceFile) continue;

      const classDecl = findClassDeclaration(sourceFile, routeInfo.className);
      if (!classDecl) continue;

      const routeMethodImportMap = buildRouteMethodImportMap(sourceFile);

      for (const member of classDecl.members) {
        if (!ts.isMethodDeclaration(member) || !member.name) continue;

        if (!isRouteMethod(member, routeMethodImportMap)) continue;
        if (isRouteNotify(member, routeMethodImportMap)) continue;

        const ignoreModes = AnnotationReader.readMemberIgnore(member, sourceFile, this.diagnostics_ || undefined);
        if (ignoreModes !== null && shouldIgnoreMember(ignoreModes, targets)) continue;

        if (member.parameters.length > 0) {
          const firstParam = member.parameters[0];
          const paramType = checker.getTypeAtLocation(firstParam);
          if (!(paramType.flags & ts.TypeFlags.Void)) {
            resolver.collectFromType(paramType);
          }
        }

        const signature = checker.getSignatureFromDeclaration(member);
        if (signature) {
          let returnType = signature.getReturnType();
          returnType = resolver.unwrapPromise(returnType);
          if (!(returnType.flags & ts.TypeFlags.Void)) {
            resolver.collectFromType(returnType);
          }
        }
      }
    }
  }

  private getOutputPath(format: 'yaml' | 'json'): string {
    const ext = format === 'yaml' ? '.yml' : '.json';
    return this.outputBasePath + ext;
  }

  private ensureDirectory(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
  }
}

export {OpenApiEmitter};
