import * as ts from 'typescript';
interface TransformEnv {
    program: ts.Program;
    checker: ts.TypeChecker;
    compilerOptions: ts.CompilerOptions;
    printer: ts.Printer;
}
export declare function processSourceFile(sourceFile: ts.SourceFile, env: TransformEnv, tsContext: ts.TransformationContext): ts.SourceFile;
export {};
//# sourceMappingURL=visitor.d.ts.map