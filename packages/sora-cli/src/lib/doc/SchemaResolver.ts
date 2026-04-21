import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';

class SchemaResolver {
  private checker_: ts.TypeChecker;
  private schemas_: Record<string, any> = {};
  private visited_: Set<string> = new Set();
  private diagnostics_: DiagnosticCollector | null;

  constructor(checker: ts.TypeChecker, diagnostics?: DiagnosticCollector) {
    this.checker_ = checker;
    this.diagnostics_ = diagnostics || null;
  }

  resolveType(type: ts.Type): any {
    if (this.isExternalType(type)) {
      this.warnExternalType(type);
      return {};
    }
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
        const schema = this.resolveType(nonNull[0]);
        return {...schema, nullable: true};
      }
      return {oneOf: type.types.map(t => this.resolveType(t)).filter(s => s !== null)};
    }

    if (type.isIntersection()) {
      return {allOf: type.types.map(t => this.resolveType(t)).filter(s => s !== null)};
    }

    const typeName = this.getTypeName(type);
    if (typeName && this.isNamedType(type) && !this.isBuiltInGeneric(type)) {
      this.ensureSchemaCollected(type);
      return {'$ref': `#/components/schemas/${typeName}`};
    }

    return this.resolveInline(type);
  }

  unwrapPromise(type: ts.Type): ts.Type {
    if ((type as any).typeArguments && (type as any).target) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol && symbol.name === 'Promise') {
        const args = (type as any).typeArguments as ts.Type[];
        if (args && args.length > 0) return args[0];
      }
    }
    return type;
  }

  getSchemas(): Record<string, any> {
    return this.schemas_;
  }

  collectFromType(type: ts.Type): void {
    const name = this.getTypeName(type);
    if (!name || !this.isNamedType(type) || this.visited_.has(name)) return;
    if (this.isBuiltInGeneric(type)) return;

    this.visited_.add(name);
    this.schemas_[name] = this.resolveInline(type);

    this.collectNestedFromInline(type);
  }

  private resolveInline(type: ts.Type): any {
    if (type.flags & ts.TypeFlags.String) return {type: 'string'};
    if (type.flags & ts.TypeFlags.Number) return {type: 'number'};
    if (type.flags & ts.TypeFlags.Boolean) return {type: 'boolean'};
    if (type.flags & ts.TypeFlags.Null) return {type: 'null'};
    if (type.flags & ts.TypeFlags.Undefined) return {};
    if (type.flags & ts.TypeFlags.Any) return {};
    if (type.flags & ts.TypeFlags.Void) return null;

    if (type.isStringLiteral()) return {type: 'string', enum: [type.value]};
    if (type.isNumberLiteral()) return {type: 'number', enum: [type.value]};

    if ((type as any).isEnum?.()) {
      const enumTypes = (type as any).types as Array<{value: string | number}> | undefined;
      if (enumTypes) {
        if (enumTypes.every((m: {value: string | number}) => typeof m.value === 'string')) {
          return {type: 'string', enum: enumTypes.map((m: {value: string | number}) => m.value as string)};
        }
        return {type: 'number', enum: enumTypes.map((m: {value: string | number}) => m.value as number).filter((v: number | undefined) => v !== undefined)};
      }
      return {type: 'string'};
    }

    if (type.isUnion()) {
      const nonNull = type.types.filter(t => !(t.flags & ts.TypeFlags.Null) && !(t.flags & ts.TypeFlags.Undefined));
      if (nonNull.length === 1 && type.types.length === 2) {
        const schema = this.resolveInline(nonNull[0]);
        return {...schema, nullable: true};
      }
      return {oneOf: type.types.map(t => this.resolveInline(t)).filter(s => s !== null)};
    }

    if (type.isIntersection()) {
      return {allOf: type.types.map(t => this.resolveInline(t)).filter(s => s !== null)};
    }

    if ((type as any).typeArguments) {
      const symbol = type.getSymbol?.() || (type as any).symbol;
      if (symbol) {
        const name = symbol.name;
        const args = (type as any).typeArguments as ts.Type[];

        if (name === 'Array' && args && args.length === 1) {
          return {type: 'array', items: this.resolveType(args[0])};
        }
        if (name === 'Record' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.resolveType(args[1])};
        }
        if (name === 'Map' && args && args.length === 2) {
          return {type: 'object', additionalProperties: this.resolveType(args[1])};
        }
        if (name === 'Set' && args && args.length === 1) {
          return {type: 'array', items: this.resolveType(args[0])};
        }
        if (name === 'Promise' && args && args.length >= 1) {
          return this.resolveInline(args[0]);
        }
      }
    }

    if (type.getFlags() & ts.TypeFlags.Object) {
      const objectType = type as ts.ObjectType;

      const stringIndexType = objectType.getStringIndexType?.();
      if (stringIndexType) {
        return {type: 'object', additionalProperties: this.resolveType(stringIndexType)};
      }

      const numberIndexType = objectType.getNumberIndexType?.();
      if (numberIndexType) {
        return {type: 'array', items: this.resolveType(numberIndexType)};
      }

      const properties = type.getProperties();
      if (properties && properties.length > 0) {
        const props: Record<string, any> = {};
        const required: string[] = [];

        for (const prop of properties) {
          const propName = prop.name;
          const propDecl = prop.valueDeclaration;
          let isOptional = false;

          if (propDecl && ts.isPropertySignature(propDecl)) {
            isOptional = !!propDecl.questionToken;
          } else if (propDecl && ts.isPropertyDeclaration(propDecl)) {
            isOptional = !!propDecl.questionToken || propDecl.initializer !== undefined;
          }

          const propType = this.checker_.getTypeOfSymbolAtLocation(prop, propDecl || {} as ts.Node);
          props[propName] = this.resolveType(propType);
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

  private ensureSchemaCollected(type: ts.Type): void {
    const name = this.getTypeName(type);
    if (!name || this.visited_.has(name)) return;
    this.collectFromType(type);
  }

  private collectNestedFromInline(type: ts.Type): void {
    const properties = type.getProperties?.();
    if (properties) {
      for (const prop of properties) {
        const propDecl = prop.valueDeclaration;
        const propType = this.checker_.getTypeOfSymbolAtLocation(prop, propDecl || {} as ts.Node);
        this.collectNested(propType);
      }
    }

    if ((type as any).typeArguments) {
      for (const arg of (type as any).typeArguments as ts.Type[]) {
        this.collectNested(arg);
      }
    }

    if (type.isUnion && type.isUnion()) {
      for (const t of type.types) {
        this.collectNested(t);
      }
    }

    if (type.isIntersection && type.isIntersection()) {
      for (const t of type.types) {
        this.collectNested(t);
      }
    }
  }

  private collectNested(type: ts.Type): void {
    const name = this.getTypeName(type);
    if (name && this.isNamedType(type) && !this.visited_.has(name) && !this.isBuiltInGeneric(type)) {
      this.collectFromType(type);
      return;
    }

    if ((type as any).typeArguments) {
      for (const arg of (type as any).typeArguments as ts.Type[]) {
        this.collectNested(arg);
      }
    }

    if (type.isUnion && type.isUnion()) {
      for (const t of type.types) {
        this.collectNested(t);
      }
    }
  }

  private getTypeName(type: ts.Type): string | null {
    if (type.symbol) return type.symbol.name;
    if ((type as any).aliasSymbol) return (type as any).aliasSymbol.name;
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
    if ((type as any).aliasSymbol) return true;
    return false;
  }

  private isBuiltInGeneric(type: ts.Type): boolean {
    const symbol = type.getSymbol?.() || (type as any).symbol;
    if (!symbol) return false;
    const name = symbol.name;
    return ['Array', 'Promise', 'Record', 'Map', 'Set'].includes(name);
  }

  private isExternalType(type: ts.Type): boolean {
    const symbol = type.getSymbol?.() || (type as any).symbol || type.symbol;
    if (!symbol) return false;
    const decls = symbol.getDeclarations();
    if (!decls || decls.length === 0) return false;
    const fileName = decls[0].getSourceFile().fileName;
    return fileName.includes('node_modules');
  }

  private warnExternalType(type: ts.Type): void {
    if (!this.diagnostics_) return;
    const name = this.getTypeName(type);
    if (name) {
      this.diagnostics_.addWarning(
        `External package type '${name}' referenced. This type cannot be fully resolved and will be exported as an empty schema.`
      );
    }
  }
}

export {SchemaResolver};
