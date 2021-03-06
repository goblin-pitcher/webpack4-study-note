const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const genTemplate = require("./gen-template.js");

const rootPath = process.cwd();
const getRootToFilePath = (filePath) => {
  const pathToRoot = path.join(path.relative(rootPath, filePath));
  return `./${pathToRoot}`;
};

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const checkAndWrite = (filePath, ...args) => {
  const fulPath = filePath.split(/\\|\//);
  const prePath = fulPath.slice(0, fulPath.length - 1).join("\\");
  if (!fs.existsSync(prePath)) {
    fs.mkdirSync(prePath, { recursive: true });
  }
  return writeFile(filePath, ...args);
};

const parseArgs = (hasUseModule, hasUseExport, hasUseRequire) => {
  const moduleKey = hasUseModule ? "module" : "__unused_webpack_module";
  const exportsKey = hasUseExport ? "exports" : "__unused_webpack_exports";
  let args = [moduleKey, exportsKey, "__webpack_require__"];
  if (!hasUseRequire) {
    const startIndex = args
      .slice(0, args.length - 1)
      .reduceRight((id, item, index) => {
        if (id > -1) return id;
        if (!item.includes("unused")) {
          return index;
        }
        return id;
      }, -1);
    args = args.slice(0, startIndex + 1);
  }
  return args;
};

class Compiler {
  constructor(config) {
    this.config = config;
  }
  async run() {
    const files = await this.bundleFiles();
    await Promise.all(files.map(this.emitFile.bind(this)));
    console.log("打包完毕");
  }
  bundleFiles() {
    const { entry } = this.config;
    return Promise.all(entry.map((enter) => this.bundleModule(enter)));
  }
  async bundleModule(filePath) {
    let checkFiles = [filePath];
    let checkItem = null;
    const entries = [];
    // 深度优先
    while (checkFiles.length) {
      checkItem = checkFiles.shift();
      const {
        source,
        dependencies = [],
        hasUseModule,
        hasUseExport,
      } = await this.parseFile(checkItem);
      const dependenciesPath = dependencies.map((ph) => {
        const pathToEntry = path.join(checkItem, "../", ph);
        return getRootToFilePath(pathToEntry);
      });
      entries.unshift([
        getRootToFilePath(checkItem),
        {
          source,
          hasUseModule,
          hasUseExport,
          hasUseRequire: dependenciesPath.length,
        },
      ]);
      checkFiles = dependenciesPath.concat(checkFiles);
    }
    const selfModules = entries.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
    return { entryPath: filePath, modules: selfModules };
  }

  async emitFile(moduleInfo) {
    try {
      const { output } = this.config;
      const { path: optPath, filename } = output;
      const { entryPath, modules } = moduleInfo;
      const matchVal = entryPath.match(/[\\/](?<name>.+?)\.js$/);
      const name = matchVal && matchVal.groups.name;
      if (!name) {
        throw "文件名解析错误";
      }
      const realName = filename.replace(/\[name\]/g, name);
      const writePath = path.join(optPath, realName);
      const webpackModules = Object.entries(modules).reduce((obj, info) => {
        const [key, { source, hasUseModule, hasUseExport, hasUseRequire }] =
          info;
        const args = parseArgs(hasUseModule, hasUseExport, hasUseRequire);
        obj[key] = {
          args,
          body: source,
        };
        return obj;
      }, {});
      const writeSource = genTemplate(entryPath, webpackModules);
      await checkAndWrite(writePath, writeSource, "utf8");
    } catch (err) {
      console.log(err);
    }
  }
  async parseFile(filePath) {
    try {
      const source = await readFile(filePath, "utf8");
      // todo:: 此处调用loaders
      return this.transFileCtx(source);
    } catch (err) {
      console.log(err);
    }
  }
  transFileCtx(source) {
    const dependencies = [];
    let hasUseModule = false;
    let hasUseExport = false;
    const ast = parse(source);
    traverse(ast, {
      CallExpression(path) {
        if (path.node.callee.name === "require") {
          path.node.callee = t.Identifier("__webpack_require__");
          dependencies.push(path.node.arguments[0].value);
        }
      },
      MemberExpression(path) {
        if (!hasUseModule && path.node.object.name === "module") {
          hasUseModule = true;
        }
        if (path.node.object.name === "exports") {
          hasUseExport = true;
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
    return { source: code, dependencies, hasUseModule, hasUseExport };
  }
}

module.exports = Compiler;
