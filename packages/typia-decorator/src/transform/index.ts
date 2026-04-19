import * as ts from 'typescript';
import {processSourceFile} from './visitor.js';

interface TransformEnv {
  program: ts.Program;
  checker: ts.TypeChecker;
  compilerOptions: ts.CompilerOptions;
  printer: ts.Printer;
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const env: TransformEnv = {
    program,
    checker: program.getTypeChecker(),
    compilerOptions: program.getCompilerOptions(),
    printer: ts.createPrinter(),
  };

  return (tsContext: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      return processSourceFile(sourceFile, env, tsContext);
    };
  };
}
