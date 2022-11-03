# webpack4学习笔记
---
## 内容简介

### webpack基础配置
* 此项目demo为webpack基础配置相关demo
* 详情参见 `webpack基础配置.md`
* 文档内容顺序为创建该demo时配置添加的顺序
* 各配置项说明可参见build/webpack.config.js中的注释

### webpack基本优化
* 参见文档`dllPlugin.md`、`happypack.md`

### splitChunks配置
* 参见文档`splitChunks.md`

### 其他相关内容
* 关于babel对装饰器的编译，参见`babel装饰器.md`
* 关于webpack对依赖的管理，参见`06-webpack缓存机制`

### 自己实现一个简易的webpack

文件夹[simple-webpack](https://github.com/goblin-pitcher/webpack4-study-note/tree/master/simple-webpack)

简易webpack代码[地址](https://github.com/goblin-pitcher/webpack4-study-note/tree/master/simple-webpack/test-mypack-result/mypack)

可对比自己实现的简易webpack和webpack打包的结果：

对比[test-mypack-result](https://github.com/goblin-pitcher/webpack4-study-note/tree/master/simple-webpack/test-mypack-result)和[test-webpack-result](https://github.com/goblin-pitcher/webpack4-study-note/tree/master/simple-webpack/test-webpack-result)打包出dist文件夹的内容
