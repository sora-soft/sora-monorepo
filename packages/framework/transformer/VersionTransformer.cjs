const ts = require('typescript');
const fs = require('fs');
const path = require('path');

module.exports = function (program, pluginOptions) {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version;

  return (ctx) => {
    return (sourceFile) => {
      function visitor(node) {
        // 命中标识符 __VERSION__
        if (ts.isIdentifier(node) && node.text === '__VERSION__') {

          // 核心防御：判断它的上下文。如果是作为“名字”而不是“值”，则跳过替换
          if (node.parent) {
            // 1. 防止破坏变量声明 (如 const __VERSION__ = ...)
            if (ts.isVariableDeclaration(node.parent) && node.parent.name === node) return node;

            // 2. 防止破坏属性访问的右侧 (如 window.__VERSION__)
            if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) return node;

            // 3. 防止破坏对象字面量的键 (如 { __VERSION__: "1.0" })
            if (ts.isPropertyAssignment(node.parent) && node.parent.name === node) return node;
          }

          // 安全通过，执行替换！
          return ts.factory.createStringLiteral(version);
        }

        return ts.visitEachChild(node, visitor, ctx);
      }
      return ts.visitNode(sourceFile, visitor);
    };
  };
};
