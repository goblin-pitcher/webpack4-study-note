## 实现一个简易的`webpack`（单文件输出版）

> 该项目实现的是单文件打包，观察的也是单文件输出打包后的结果

### 观察打包后的结果

创建一个打包测试项目[test-webpack-result](./test-webpack-result) ，观察打包后删除注释的[main-bundle.js](./test-webpack-result/dist/js/main-bundle.js) 文件，会发现打包后的内容主要完成了两项工作：

+ 实现自定义的require方法：`__webpack_require__`
+ 解析入口文件的引用树，将相关文件的内容形成映射表`__webpack_modules__`

### 简易webpack的实现

通过观察打包后的结果，可以得出结论，如果要自己实现一个简易的`webpack`，那么需要完成的工作也有对应的两项：

+ 将代码中所有的require替换为`__webpack_require__`
+ 沿着引用树向上找到项目所有引用，生成key为文件相对路径，value为文件内容的映射表`__webpack_modules__`，将`__webpack_modules__`的内容放入模板文件中

打包的核心文件即[Complier.js](./test-mypack-result/mypack/Compiler.js)，该文件主要完成两方面的内容：

+ 文件读取与收集
  + 将文件解析成ast树，深度优先遍历所有引用文件
  + 将入口文件及其所有引用文件中的require替换成webpack自定义的`__webpack_require__`
  + 收集入口文件及其所有引用文件的路径和代码内容

+ 处理后代码的写入
  + 解析webpack打包的模板文件
  + 根据收集的所有文件的路径和代码内容，生成`__webpack_modules__`对象，并将模板中的`__webpack_modules__`对象进行替换
  + 解析output路径，将处理后的内容写入对应路径
