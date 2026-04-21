import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';
import {AnnotationReader} from '../exporter/AnnotationReader';
import {buildRouteMethodImportMap, findClassDeclaration, isRouteMethod, isRouteNotify, shouldIgnoreMember} from '../exporter/RouteUtils';
import {type DocRouteInfo} from './DocCollector';
import {type SchemaResolver} from './SchemaResolver';

const validHttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export interface OpenAPIOperation {
  summary: string;
  description?: string;
  tags: string[];
  requestBody?: any;
  responses: any;
}

export interface OpenAPIPathItem {
  path: string;
  method: string;
  operation: OpenAPIOperation;
}

export interface DocTransformResult {
  pathItems: OpenAPIPathItem[];
}

class DocTransformer {
  private diagnostics_: DiagnosticCollector | null;

  constructor(diagnostics?: DiagnosticCollector) {
    this.diagnostics_ = diagnostics || null;
  }

  transform(
    program: ts.Program,
    routes: DocRouteInfo[],
    targets: string[] | undefined,
    resolver?: SchemaResolver
  ): DocTransformResult {
    const checker = program.getTypeChecker();
    const pathItems: OpenAPIPathItem[] = [];

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

        const methodName = member.name.getText(sourceFile);
        const summary = this.readSummary(member);
        const description = this.readDescription(member);
        const httpMethod = this.readAndValidateHttpMethod(member, routeInfo.className, methodName);

        const paramType = resolver
          ? this.getFirstParamType(member, resolver)
          : this.getFirstParamTypeLegacy(member, checker);
        const returnType = resolver
          ? this.getReturnType(member, resolver)
          : this.getReturnTypeLegacy(member, checker);

        const requestBody = paramType ? {requestBody: paramType} : {};
        const response = returnType ? {responses: returnType} : {responses: {'200': {description: ''}}};
        const descriptionField = description ? {description} : {};

        for (const prefix of routeInfo.prefixes) {
          const path = this.buildPath(prefix, methodName);
          pathItems.push({
            path,
            method: httpMethod.toLowerCase(),
            operation: {
              summary,
              ...descriptionField,
              tags: [routeInfo.className],
              ...requestBody,
              ...response,
            },
          });
        }
      }
    }

    return {pathItems};
  }

  private readSummary(member: ts.MethodDeclaration): string {
    const jsDocs = (member as any).jsDoc as Array<{tags?: ts.JSDocTag[]; comment?: string | ts.NodeArray<ts.JSDocComment>}> | undefined;
    if (!jsDocs || jsDocs.length === 0) return '';

    for (const jsDoc of jsDocs) {
      if (typeof jsDoc.comment === 'string' && jsDoc.comment.trim()) {
        return jsDoc.comment.trim();
      }
      if (Array.isArray(jsDoc.comment)) {
        const text = jsDoc.comment.map(part => typeof part === 'string' ? part : (part as any).text || '').join('').trim();
        if (text) return text;
      }
    }

    return '';
  }

  private readDescription(member: ts.MethodDeclaration): string {
    const jsDocs = (member as any).jsDoc as Array<{tags?: ts.JSDocTag[]}> | undefined;
    if (!jsDocs || jsDocs.length === 0) return '';

    for (const jsDoc of jsDocs) {
      if (jsDoc.tags) {
        for (const tag of jsDoc.tags) {
          if (tag.tagName.text === 'description') {
            return AnnotationReader.extractTagComment(tag);
          }
        }
      }
    }

    return '';
  }

  private readAndValidateHttpMethod(member: ts.MethodDeclaration, className: string, methodName: string): string {
    const raw = AnnotationReader.readHttpMethod(member);
    if (!raw) return 'POST';

    const upper = raw.toUpperCase();
    if (!validHttpMethods.includes(upper)) {
      throw new Error(`${className}.${methodName}: Invalid @method "${raw}". Valid values: ${validHttpMethods.join(', ')}`);
    }
    return upper;
  }

  private getFirstParamType(member: ts.MethodDeclaration, resolver: SchemaResolver): any | null {
    if (member.parameters.length === 0) return null;

    const firstParam = member.parameters[0];
    const checker = (resolver as any).checker_ as ts.TypeChecker;
    const resolvedType = checker.getTypeAtLocation(firstParam);
    if (resolvedType.flags & ts.TypeFlags.Void) return null;

    const schema = resolver.resolveType(resolvedType);
    return {
      content: {
        'application/json': {schema},
      },
    };
  }

  private getReturnType(member: ts.MethodDeclaration, resolver: SchemaResolver): any | null {
    const checker = (resolver as any).checker_ as ts.TypeChecker;
    const signature = checker.getSignatureFromDeclaration(member);
    if (!signature) return null;

    let returnType = signature.getReturnType();
    returnType = resolver.unwrapPromise(returnType);

    if (returnType.flags & ts.TypeFlags.Void) {
      return {'200': {description: ''}};
    }

    const schema = resolver.resolveType(returnType);
    return {
      '200': {
        description: '',
        content: {
          'application/json': {schema},
        },
      },
    };
  }

  private getFirstParamTypeLegacy(member: ts.MethodDeclaration, checker: ts.TypeChecker): any | null {
    if (member.parameters.length === 0) return null;

    const firstParam = member.parameters[0];
    const type = checker.getTypeAtLocation(firstParam);

    if (type.flags & ts.TypeFlags.Void) return null;

    const schema = this.typeToJsonSchemaLegacy(type, checker);
    return {
      content: {
        'application/json': {schema},
      },
    };
  }

  private getReturnTypeLegacy(member: ts.MethodDeclaration, checker: ts.TypeChecker): any | null {
    const signature = checker.getSignatureFromDeclaration(member);
    if (!signature) return null;

    let returnType = signature.getReturnType();

    returnType = this.unwrapPromiseLegacy(returnType);

    if (returnType.flags & ts.TypeFlags.Void) {
      return {'200': {description: ''}};
    }

    const schema = this.typeToJsonSchemaLegacy(returnType, checker);
    return {
      '200': {
        description: '',
        content: {
          'application/json': {schema},
        },
      },
    };
  }

  private unwrapPromiseLegacy(type: ts.Type): ts.Type {
    if ((type as any).typeArguments && (type as any).target) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol && symbol.name === 'Promise') {
        const args = (type as any).typeArguments as ts.Type[];
        if (args && args.length > 0) return args[0];
      }
    }
    return type;
  }

  private typeToJsonSchemaLegacy(type: ts.Type, checker: ts.TypeChecker): any {
    if (type.flags & ts.TypeFlags.String) return {type: 'string'};
    if (type.flags & ts.TypeFlags.Number) return {type: 'number'};
    if (type.flags & ts.TypeFlags.Boolean) return {type: 'boolean'};
    if (type.flags & ts.TypeFlags.Null) return {type: 'null'};
    if (type.flags & ts.TypeFlags.Undefined) return {};
    if (type.flags & ts.TypeFlags.Any) return {};
    if (type.flags & ts.TypeFlags.Void) return null;

    if (type.isStringLiteral()) return {type: 'string', enum: [type.value]};
    if (type.isNumberLiteral()) return {type: 'number', enum: [type.value]};

    if (type.isUnion()) {
      const nonNull = type.types.filter(t => !(t.flags & ts.TypeFlags.Null) && !(t.flags & ts.TypeFlags.Undefined));
      if (nonNull.length === 1 && type.types.length === 2) {
        const schema = this.typeToJsonSchemaLegacy(nonNull[0], checker);
        return {...schema, nullable: true};
      }
      return {oneOf: type.types.map(t => this.typeToJsonSchemaLegacy(t, checker)).filter(s => s !== null)};
    }

    if (type.isIntersection()) {
      return {allOf: type.types.map(t => this.typeToJsonSchemaLegacy(t, checker)).filter(s => s !== null)};
    }

    if ((type as any).typeArguments) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol) {
        const typeName = symbol.name;
        const args = (type as any).typeArguments as ts.Type[];

        if (typeName === 'Array' && args && args.length === 1) {
          return {type: 'array', items: this.typeToJsonSchemaLegacy(args[0], checker)};
        }
        if (typeName === 'Record' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.typeToJsonSchemaLegacy(args[1], checker)};
        }
        if (typeName === 'Map' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.typeToJsonSchemaLegacy(args[1], checker)};
        }
        if (typeName === 'Set' && args && args.length === 1) {
          return {type: 'array', items: this.typeToJsonSchemaLegacy(args[0], checker)};
        }
        if (typeName === 'Promise' && args && args.length >= 1) {
          return this.typeToJsonSchemaLegacy(args[0], checker);
        }
      }
    }

    if (type.symbol) {
      const name = this.getTypeNameLegacy(type);
      if (name && this.isNamedTypeLegacy(type) && !this.isBuiltInGenericLegacy(type)) {
        return {'$ref': `#/components/schemas/${name}`};
      }
    }

    if (type.getFlags() & ts.TypeFlags.Object) {
      const objectType = type as ts.ObjectType;

      const stringIndexType = objectType.getStringIndexType?.();
      if (stringIndexType) {
        return {type: 'object', additionalProperties: this.typeToJsonSchemaLegacy(stringIndexType, checker)};
      }

      const numberIndexType = objectType.getNumberIndexType?.();
      if (numberIndexType) {
        return {type: 'array', items: this.typeToJsonSchemaLegacy(numberIndexType, checker)};
      }

      const properties = type.getProperties();
      if (properties && properties.length > 0) {
        const props: Record<string, any> = {};
        const required: string[] = [];

        for (const prop of properties) {
          const propName = prop.name;
          const propType = checker.getTypeOfSymbolAtLocation(prop, prop.declarations?.[0] || {} as ts.Node);
          const propDecl = prop.valueDeclaration as ts.Node | undefined;

          let isOptional = false;
          if (propDecl && ts.isPropertySignature(propDecl)) {
            isOptional = !!propDecl.questionToken;
          } else if (propDecl && ts.isPropertyDeclaration(propDecl)) {
            isOptional = !!propDecl.questionToken;
          }

          props[propName] = this.typeToJsonSchemaLegacy(propType, checker);
          if (!isOptional) {
            required.push(propName);
          }
        }

        const schema: any = {type: 'object', properties: props};
        if (required.length > 0) schema.required = required;
        return schema;
      }
    }

    return {};
  }

  private getTypeNameLegacy(type: ts.Type): string | null {
    if (type.symbol) return type.symbol.name;
    if ((type as any).aliasSymbol) return (type as any).aliasSymbol.name;
    return null;
  }

  private isNamedTypeLegacy(type: ts.Type): boolean {
    if (type.symbol) {
      const decls = type.symbol.getDeclarations();
      if (decls && decls.length > 0) {
        const decl = decls[0];
        return ts.isInterfaceDeclaration(decl) ||
               ts.isTypeAliasDeclaration(decl) ||
               ts.isEnumDeclaration(decl) ||
               ts.isClassDeclaration(decl);
      }
    }
    if ((type as any).aliasSymbol) return true;
    return false;
  }

  private isBuiltInGenericLegacy(type: ts.Type): boolean {
    const symbol = type.getSymbol?.() || (type as any).symbol;
    if (!symbol) return false;
    const name = symbol.name;
    return ['Array', 'Promise', 'Record', 'Map', 'Set'].includes(name);
  }

  private buildPath(prefix: string, methodName: string): string {
    const p = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    return `${p}/${methodName}`;
  }
}

export {DocTransformer};
