import * as ts from 'typescript';

import {AnnotationReader} from '../exporter/annotation-reader';
import {type DocRouteInfo} from './doc-collector';

const FRAMEWORK_MODULE = '@sora-soft/framework';

const VALID_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

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

function getNodeDecorators(node: ts.Node): ts.Decorator[] {
  if (ts.canHaveDecorators(node)) {
    const decs = ts.getDecorators(node);
    if (decs && decs.length > 0) return [...decs];
  }

  const nodeAny = node as any;
  if (nodeAny.modifiers) {
    const decs: ts.Decorator[] = [];
    for (const mod of nodeAny.modifiers as readonly ts.Node[]) {
      if (mod.kind === ts.SyntaxKind.Decorator) {
        decs.push(mod as ts.Decorator);
      }
    }
    if (decs.length > 0) return decs;
  }

  return [];
}

class DocTransformer {
  transform(
    program: ts.Program,
    routes: DocRouteInfo[],
    targets: string[] | undefined,
  ): DocTransformResult {
    const checker = program.getTypeChecker();
    const pathItems: OpenAPIPathItem[] = [];

    for (const routeInfo of routes) {
      const sourceFile = program.getSourceFile(routeInfo.filePath);
      if (!sourceFile) continue;

      const classDecl = this.findClassDeclaration(sourceFile, routeInfo.className);
      if (!classDecl) continue;

      const routeMethodImportMap = this.buildRouteMethodImportMap(sourceFile);

      for (const member of classDecl.members) {
        if (!ts.isMethodDeclaration(member) || !member.name) continue;

        if (!this.isRouteMethod(member, routeMethodImportMap)) continue;
        if (this.isRouteNotify(member, routeMethodImportMap)) continue;

        const ignoreModes = AnnotationReader.readMemberIgnore(member);
        if (ignoreModes !== null && this.shouldIgnoreMember(ignoreModes, targets)) continue;

        const methodName = member.name.getText(sourceFile);
        const summary = this.readSummary(member);
        const description = this.readDescription(member);
        const httpMethod = this.readAndValidateHttpMethod(member, routeInfo.className, methodName);

        const paramType = this.getFirstParamType(member, checker);
        const returnType = this.getReturnType(member, checker);

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
    if (!VALID_HTTP_METHODS.includes(upper)) {
      throw new Error(`${className}.${methodName}: Invalid @method "${raw}". Valid values: ${VALID_HTTP_METHODS.join(', ')}`);
    }
    return upper;
  }

  private getFirstParamType(member: ts.MethodDeclaration, checker: ts.TypeChecker): any | null {
    if (member.parameters.length === 0) return null;

    const firstParam = member.parameters[0];
    const type = checker.getTypeAtLocation(firstParam);

    if (type.flags & ts.TypeFlags.Void) return null;

    const schema = this.typeToJsonSchema(type, checker);
    return {
      content: {
        'application/json': {schema},
      },
    };
  }

  private getReturnType(member: ts.MethodDeclaration, checker: ts.TypeChecker): any | null {
    const signature = checker.getSignatureFromDeclaration(member);
    if (!signature) return null;

    let returnType = signature.getReturnType();

    returnType = this.unwrapPromise(returnType, checker);

    if (returnType.flags & ts.TypeFlags.Void) {
      return {'200': {description: ''}};
    }

    const schema = this.typeToJsonSchema(returnType, checker);
    return {
      '200': {
        description: '',
        content: {
          'application/json': {schema},
        },
      },
    };
  }

  private unwrapPromise(type: ts.Type, checker: ts.TypeChecker): ts.Type {
    if ((type as any).typeArguments && (type as any).target) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol && symbol.name === 'Promise') {
        const args = (type as any).typeArguments as ts.Type[];
        if (args && args.length > 0) return args[0];
      }
    }
    return type;
  }

  private typeToJsonSchema(type: ts.Type, checker: ts.TypeChecker): any {
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
        const schema = this.typeToJsonSchema(nonNull[0], checker);
        return {...schema, nullable: true};
      }
      return {oneOf: type.types.map(t => this.typeToJsonSchema(t, checker)).filter(s => s !== null)};
    }

    if (type.isIntersection()) {
      return {allOf: type.types.map(t => this.typeToJsonSchema(t, checker)).filter(s => s !== null)};
    }

    if ((type as any).typeArguments) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol) {
        const typeName = symbol.name;
        const args = (type as any).typeArguments as ts.Type[];

        if (typeName === 'Array' && args && args.length === 1) {
          return {type: 'array', items: this.typeToJsonSchema(args[0], checker)};
        }

        if (typeName === 'Record' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.typeToJsonSchema(args[1], checker)};
        }

        if (typeName === 'Map' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.typeToJsonSchema(args[1], checker)};
        }

        if (typeName === 'Set' && args && args.length === 1) {
          return {type: 'array', items: this.typeToJsonSchema(args[0], checker)};
        }

        if (typeName === 'Promise' && args && args.length >= 1) {
          return this.typeToJsonSchema(args[0], checker);
        }
      }
    }

    if (type.symbol) {
      const name = this.getTypeName(type);
      if (name && this.isNamedType(type) && !this.isBuiltInGeneric(type)) {
        return {'$ref': `#/components/schemas/${name}`};
      }
    }

    if (type.getFlags() & ts.TypeFlags.Object) {
      const objectType = type as ts.ObjectType;

      const stringIndexType = objectType.getStringIndexType?.();
      if (stringIndexType) {
        return {type: 'object', additionalProperties: this.typeToJsonSchema(stringIndexType, checker)};
      }

      const numberIndexType = objectType.getNumberIndexType?.();
      if (numberIndexType) {
        return {type: 'array', items: this.typeToJsonSchema(numberIndexType, checker)};
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

          props[propName] = this.typeToJsonSchema(propType, checker);
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

  private getTypeName(type: ts.Type): string | null {
    if (type.symbol) {
      return type.symbol.name;
    }
    if ((type as any).aliasSymbol) {
      return (type as any).aliasSymbol.name;
    }
    return null;
  }

  private isNamedType(type: ts.Type): boolean {
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
    if ((type as any).aliasSymbol) {
      return true;
    }
    return false;
  }

  collectNamedSchemas(program: ts.Program, routes: DocRouteInfo[], targets: string[] | undefined): Record<string, any> {
    const checker = program.getTypeChecker();
    const schemas: Record<string, any> = {};
    const visited = new Set<string>();

    const collectFromType = (type: ts.Type) => {
      const name = this.getTypeName(type);
      if (!name || visited.has(name)) return;
      if (!this.isNamedType(type)) return;

      visited.add(name);
      schemas[name] = this.typeToJsonSchema(type, checker);

      const properties = type.getProperties?.();
      if (properties) {
        for (const prop of properties) {
          const propType = checker.getTypeOfSymbolAtLocation(prop, prop.declarations?.[0] || {} as ts.Node);
          this.collectNestedTypes(propType, checker, visited, schemas);
        }
      }

      if ((type as any).typeArguments) {
        for (const arg of (type as any).typeArguments as ts.Type[]) {
          this.collectNestedTypes(arg, checker, visited, schemas);
        }
      }

      if (type.isUnion && type.isUnion()) {
        for (const t of type.types) {
          this.collectNestedTypes(t, checker, visited, schemas);
        }
      }
    };

    for (const routeInfo of routes) {
      const sourceFile = program.getSourceFile(routeInfo.filePath);
      if (!sourceFile) continue;

      const classDecl = this.findClassDeclaration(sourceFile, routeInfo.className);
      if (!classDecl) continue;

      const routeMethodImportMap = this.buildRouteMethodImportMap(sourceFile);

      for (const member of classDecl.members) {
        if (!ts.isMethodDeclaration(member) || !member.name) continue;
        if (!this.isRouteMethod(member, routeMethodImportMap)) continue;
        if (this.isRouteNotify(member, routeMethodImportMap)) continue;

        const ignoreModes = AnnotationReader.readMemberIgnore(member);
        if (ignoreModes !== null && this.shouldIgnoreMember(ignoreModes, targets)) continue;

        if (member.parameters.length > 0) {
          const firstParam = member.parameters[0];
          const paramType = checker.getTypeAtLocation(firstParam);
          if (!(paramType.flags & ts.TypeFlags.Void)) {
            collectFromType(paramType);
          }
        }

        const signature = checker.getSignatureFromDeclaration(member);
        if (signature) {
          let returnType = signature.getReturnType();
          returnType = this.unwrapPromise(returnType, checker);
          if (!(returnType.flags & ts.TypeFlags.Void)) {
            collectFromType(returnType);
          }
        }
      }
    }

    return schemas;
  }

  private collectNestedTypes(type: ts.Type, checker: ts.TypeChecker, visited: Set<string>, schemas: Record<string, any>) {
    const name = this.getTypeName(type);
    if (name && this.isNamedType(type) && !visited.has(name)) {
      visited.add(name);
      schemas[name] = this.typeToJsonSchema(type, checker);

      const properties = type.getProperties?.();
      if (properties) {
        for (const prop of properties) {
          const propType = checker.getTypeOfSymbolAtLocation(prop, prop.declarations?.[0] || {} as ts.Node);
          this.collectNestedTypes(propType, checker, visited, schemas);
        }
      }
    }

    if ((type as any).typeArguments) {
      for (const arg of (type as any).typeArguments as ts.Type[]) {
        this.collectNestedTypes(arg, checker, visited, schemas);
      }
    }

    if (type.isUnion && type.isUnion()) {
      for (const t of type.types) {
        this.collectNestedTypes(t, checker, visited, schemas);
      }
    }
  }

  private buildPath(prefix: string, methodName: string): string {
    const p = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    return `${p}/${methodName}`;
  }

  private isRouteMethod(member: ts.MethodDeclaration, routeMethodImportMap: Map<string, Set<string>>): boolean {
    const decorators = getNodeDecorators(member);

    for (const decorator of decorators) {
      const expr = decorator.expression;

      if (ts.isPropertyAccessExpression(expr)) {
        const objectName = expr.expression.getText();
        const methodName = expr.name.text;
        const routeMethods = routeMethodImportMap.get(objectName);
        if (routeMethods && routeMethods.has(methodName)) {
          return true;
        }
      }

      if (ts.isCallExpression(expr)) {
        const callee = expr.expression;
        if (ts.isPropertyAccessExpression(callee)) {
          const objectName = callee.expression.getText();
          const methodName = callee.name.text;
          const routeMethods = routeMethodImportMap.get(objectName);
          if (routeMethods && routeMethods.has(methodName)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private isRouteNotify(member: ts.MethodDeclaration, routeMethodImportMap: Map<string, Set<string>>): boolean {
    const decorators = getNodeDecorators(member);

    for (const decorator of decorators) {
      const expr = decorator.expression;

      if (ts.isPropertyAccessExpression(expr)) {
        const objectName = expr.expression.getText();
        const methodName = expr.name.text;
        if (methodName === 'notify') {
          const routeMethods = routeMethodImportMap.get(objectName);
          if (routeMethods && routeMethods.has('notify')) {
            return true;
          }
        }
      }

      if (ts.isCallExpression(expr)) {
        const callee = expr.expression;
        if (ts.isPropertyAccessExpression(callee)) {
          const objectName = callee.expression.getText();
          const methodName = callee.name.text;
          if (methodName === 'notify') {
            const routeMethods = routeMethodImportMap.get(objectName);
            if (routeMethods && routeMethods.has('notify')) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private buildRouteMethodImportMap(sourceFile: ts.SourceFile): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) continue;

      const moduleSpecifier = (statement.moduleSpecifier as ts.StringLiteral).text;
      const isFramework = moduleSpecifier === FRAMEWORK_MODULE ||
        moduleSpecifier.startsWith('@sora-soft/framework/');

      if (!isFramework) continue;

      const importClause = statement.importClause;
      if (!importClause?.namedBindings || !ts.isNamedImports(importClause.namedBindings)) continue;

      for (const element of importClause.namedBindings.elements) {
        const localName = element.name.text;
        const importedName = element.propertyName?.text || localName;
        if (importedName === 'Route') {
          const methods = map.get(localName) || new Set<string>();
          methods.add('method');
          methods.add('notify');
          map.set(localName, methods);
        }
      }
    }

    return map;
  }

  private findClassDeclaration(sourceFile: ts.SourceFile, className: string): ts.ClassDeclaration | null {
    for (const statement of sourceFile.statements) {
      if (ts.isClassDeclaration(statement) && statement.name?.text === className) {
        return statement;
      }
    }
    return null;
  }

  private shouldIgnoreMember(memberIgnoreModes: string[] | null, targets?: string[]): boolean {
    if (memberIgnoreModes === null) return false;
    if (memberIgnoreModes.length === 0) return true;
    if (!targets || targets.length === 0) return false;
    return targets.some(t => memberIgnoreModes.includes(t));
  }

  private isBuiltInGeneric(type: ts.Type): boolean {
    const symbol = type.getSymbol?.() || (type as any).symbol;
    if (!symbol) return false;
    const name = symbol.name;
    return ['Array', 'Promise', 'Record', 'Map', 'Set'].includes(name);
  }
}

export {DocTransformer};
