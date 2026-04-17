import * as ts from 'typescript';
import * as tjs from './TypescriptJsonSchema.js';

export interface VisitorContext extends PartialVisitorContext {
    functionNames: Set<string>;
    functionMap: Map<string, ts.FunctionDeclaration>;
    typeIdMap: Map<string, string>;
    overrideDisallowSuperfluousObjectProperies?: boolean;
}

export interface PartialVisitorContext {
    program: ts.Program;
    schemaGenerator: tjs.JsonSchemaGenerator;
    checker: ts.TypeChecker;
    compilerOptions: ts.CompilerOptions;
    typeMapperStack: Map<ts.Type, ts.Type>[];
    previousTypeReference: ts.Type | null;
}
