## 实现一个简易的`webpack`（单文件输出版）

> 该项目实现的是单文件打包，观察的也是单文件输出打包后的结果

### 观察打包后的结果

创建一个打包测试项目[test-webpack-result](./test-webpack-result) ，观察打包后删除注释的[main-bundle.js](./test-webpack-result/dist/js/main-bundle.js) 文件，会发现打包后的内容主要完成了两项工作：

+ 实现自定义的require方法：`__webpack_require__`
+ 解析入口文件的引用树，将相关文件的内容形成映射表`__webpack_modules__`

如果要自己实现一个简易的`webpack`，那么需要完成的工作也有对应的两项：

+ 将代码中所有的require替换为`__webpack_require__`
+ 沿着引用树向上找到项目所有引用，生成key为文件相对路径，value为文件内容的映射表`__webpack_modules__`，将`__webpack_modules__`的内容放入模板文件中

### 简易webpack的实现

