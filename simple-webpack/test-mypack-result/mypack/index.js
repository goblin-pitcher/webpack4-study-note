const path = require("path");
const Complier = require("./Compiler.js");
const rootPath = process.cwd();
const configPath = path.join(rootPath, "webpack.config.js");

const config = require(configPath);
const compiler = new Complier(config);
compiler.run();
