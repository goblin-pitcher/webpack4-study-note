const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const source = fs.readFileSync(
  path.resolve(__dirname, "./template.js"),
  "utf8"
);

const genWebpackModuleTypes = (info) => {
  const properties = Object.entries(info).reduce((arr, entry) => {
    const [entryPath, { args, body }] = entry;
    const key = t.stringLiteral(entryPath);
    const expression = t.expressionStatement(
      t.callExpression(t.identifier("eval"), [t.stringLiteral(body)])
    );
    const value = t.arrowFunctionExpression(
      args.map((arg) => t.identifier(arg)),
      t.blockStatement([expression])
    );
    const property = t.objectProperty(key, value);
    return arr.concat(property);
  }, []);
  return t.objectExpression(properties);
};

module.exports = function (rootEntry, webpackModules) {
  const ast = parse(source);
  const objAst = genWebpackModuleTypes(webpackModules);
  traverse(ast, {
    VariableDeclarator(path) {
      const { name } = path.node.id;
      if (name === "__webpack_modules__") {
        path.node.init = objAst;
      }
      if (name === "__webpack_exports__") {
        path.node.init.arguments = [t.stringLiteral(rootEntry)];
      }
    },
  });
  const { code } = generate(
    ast,
    {
      jsescOption: {
        minimal: true,
      },
    },
    source
  );
  return code;
};
