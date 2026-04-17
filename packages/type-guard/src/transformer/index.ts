// reference from https://github.com/woutervh-/typescript-is/blob/master/src/transform-inline/transformer.ts
import * as ts from 'typescript';
import {TransformError} from './TransformError.js';
import {transformNode} from './TransformNode.js';
import * as tjs from './TypescriptJsonSchema.js';
import type {PartialVisitorContext} from './VisitorContext.js';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const schemaGenerator = tjs.buildGenerator(program, {
    required: true,
    strictNullChecks: true,
  });
  const visitorContext: PartialVisitorContext = {
    program,
    schemaGenerator,
    checker: program.getTypeChecker(),
    compilerOptions: program.getCompilerOptions(),
    typeMapperStack: [],
    previousTypeReference: null,
  };
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => transformNodeAndChildren(file, program, context, visitorContext);
}

function transformNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext, visitorContext: PartialVisitorContext): ts.SourceFile;
function transformNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext, visitorContext: PartialVisitorContext): ts.Node;
function transformNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext, visitorContext: PartialVisitorContext): ts.Node {
  let transformedNode: ts.Node;
  try {
    transformedNode = transformNode(node, visitorContext);
  } catch (err) {
    const sourceFile = node.getSourceFile();
    if (!sourceFile) {
      throw err;
    }
    const {line, character} = sourceFile.getLineAndCharacterOfPosition(node.pos);
    throw new TransformError(`Failed to transform node at: ${sourceFile.fileName}:${line + 1}:${character + 1}, message=${(err as Error).message}`);
  }
  return ts.visitEachChild(transformedNode, (childNode) => transformNodeAndChildren(childNode, program, context, visitorContext), context);
}
