"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSourceFile = processSourceFile;
const core_1 = require("@typia/core");
const ts = __importStar(require("typescript"));
const guardDeclarationFile = 'runtime/index.d.ts';
function isGuardFromRuntime(declaration) {
    const sourceFile = declaration.getSourceFile();
    const fileName = sourceFile.fileName.replace(/\\/g, '/');
    return fileName.endsWith(guardDeclarationFile);
}
function resolveGuardSymbol(decorator, checker) {
    const expr = decorator.expression;
    let identifier;
    if (ts.isCallExpression(expr)) {
        identifier = expr.expression;
    }
    else {
        identifier = expr;
    }
    if (!ts.isIdentifier(identifier))
        return false;
    let symbol = checker.getSymbolAtLocation(identifier);
    if (!symbol)
        return false;
    if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = checker.getAliasedSymbol(symbol);
    }
    const declarations = symbol.getDeclarations();
    if (!declarations || declarations.length === 0)
        return false;
    for (const decl of declarations) {
        if (isGuardFromRuntime(decl))
            return true;
    }
    return false;
}
function getParamDecorators(param) {
    return ts.getDecorators(param) ?? [];
}
function findGuardedParams(method, checker) {
    const parameters = method.parameters;
    if (!parameters || parameters.length === 0)
        return [];
    const guardedParams = [];
    for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        if (!ts.isIdentifier(param.name))
            continue;
        if (!param.type)
            continue;
        const decorators = getParamDecorators(param);
        for (const dec of decorators) {
            if (resolveGuardSymbol(dec, checker)) {
                const type = checker.getTypeFromTypeNode(param.type);
                guardedParams.push({
                    paramIndex: i,
                    paramName: param.name.text,
                    typeNode: param.type,
                    type,
                    guardDecorator: dec,
                });
                break;
            }
        }
    }
    return guardedParams;
}
function buildTypiaContext(env, tsContext, importer) {
    return {
        program: env.program,
        compilerOptions: env.compilerOptions,
        checker: env.checker,
        printer: env.printer,
        options: {},
        transformer: tsContext,
        importer,
        extras: {
            addDiagnostic: (_) => 0,
        },
    };
}
function collectGuardedMethods(node, checker) {
    const results = new Map();
    function visit(n) {
        if (ts.isMethodDeclaration(n)) {
            const guardedParams = findGuardedParams(n, checker);
            if (guardedParams.length > 0) {
                results.set(n, guardedParams);
            }
        }
        ts.forEachChild(n, visit);
    }
    visit(node);
    return results;
}
function processSourceFile(sourceFile, env, tsContext) {
    const { checker } = env;
    const guardedMethods = collectGuardedMethods(sourceFile, checker);
    if (guardedMethods.size === 0)
        return sourceFile;
    const importer = new core_1.ImportProgrammer({
        internalPrefix: 'typia_transform_',
    });
    const typiaCtx = buildTypiaContext(env, tsContext, importer);
    const modulo = ts.factory.createIdentifier('typia');
    modulo.getText = () => 'typia';
    const assertStatementMap = new Map();
    for (const [methodNode, guardedParams] of guardedMethods) {
        const statements = [];
        for (const gp of guardedParams) {
            const typeName = gp.typeNode.getFullText().trim();
            const assertFn = core_1.AssertProgrammer.write({
                context: typiaCtx,
                modulo,
                type: gp.type,
                name: typeName,
                config: { equals: false, guard: false },
            });
            const callWithArg = ts.factory.createCallExpression(assertFn, undefined, [ts.factory.createIdentifier(gp.paramName)]);
            statements.push(ts.factory.createExpressionStatement(callWithArg));
        }
        assertStatementMap.set(methodNode, statements);
    }
    function visitNode(node) {
        if (ts.isMethodDeclaration(node) && guardedMethods.has(node)) {
            const assertStatements = assertStatementMap.get(node) ?? [];
            const guardDecoratorSet = new Set((guardedMethods.get(node) ?? []).map((gp) => gp.guardDecorator));
            const newParameters = ts.factory.createNodeArray(node.parameters.map((param) => {
                const decorators = getParamDecorators(param);
                const hasGuardDecorator = decorators.some((d) => guardDecoratorSet.has(d));
                if (!hasGuardDecorator)
                    return param;
                const allModifiers = ts.getModifiers(param) ?? [];
                const filteredModifiers = allModifiers.length > 0 ? allModifiers : undefined;
                return ts.factory.updateParameterDeclaration(param, filteredModifiers, param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
            }));
            const existingBody = node.body ?? ts.factory.createBlock([], true);
            const newBody = ts.factory.updateBlock(existingBody, ts.factory.createNodeArray([...assertStatements, ...existingBody.statements]));
            const methodModifiers = ts.factory.createNodeArray([
                ...(ts.getDecorators(node) ?? []),
                ...(ts.getModifiers(node) ?? []),
            ]);
            return ts.factory.updateMethodDeclaration(node, methodModifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, newParameters, node.type, newBody);
        }
        return node;
    }
    function visitDeep(node) {
        const visited = visitNode(node);
        return ts.visitEachChild(visited, visitDeep, tsContext);
    }
    const transformed = ts.visitEachChild(sourceFile, visitDeep, tsContext);
    const importStatements = importer.toStatements();
    if (importStatements.length > 0) {
        return ts.factory.updateSourceFile(transformed, ts.factory.createNodeArray([...importStatements, ...transformed.statements]));
    }
    return transformed;
}
//# sourceMappingURL=visitor.js.map