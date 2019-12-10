# webpack4学习笔记
---
## 准备工作
### 安装webpack、webpack-cli、webpack-dev-server,创建package.json,在package.json的scripts中创建build启动方式，由于准备将webpack.config.js放在build文件夹下，配置如下：
    "scripts": {
      "dev": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.js",
      "build": "cross-env NODE_ENV=production webpack --config build/webpack.config.js"
    },
### 创建build文件夹，在其中创建webpack配置文件webpack.config.js。
### 注：webpack.config.js中entry、plugins等可以用到相对路径的地方，相对路径都是相对于根目录。

---
## 基础插件与处理
### 1. html部分

#### 安装html-webpack-plugin，负责打包html文件
> 注意，在html文件中不需要手动引入打包后的js文件，html-webpack-plugin会自动将打包后的js文件引入html文件中

### 2. css部分

#### 安装loader,如style-loader/css-loader/less-loader
> 注意，解析less除了安装less-loader还需安装less，提供运行环境

#### 安装 mini-css-extract-plugin用于抽离css

#### 安装postcss-loader、autoprefixer用于添加样式兼容性前缀
>添加兼容性前缀的功能由autoprefixer完成，postcss-loader相当于一个loader的容器，autoprefixer配置在其中，使postcss-loader在加载css文件时能自动添加兼容性前缀

#### 安装optimize-css-assets-webpack-plugin用于抽离css
> 注：此插件是配置在optimization.minimizer中，webpack4将大部分优化相关内容放在optimization中，又根据优化的具体内容划分为minimizer、splitChunks等模块。    
> 注意，抽离的css无法自动压缩，因此后续需配置压缩抽离的css的插件

#### 安装mini-css-extract-plugin用于压缩抽离后的css
> 此插件配置在plugins中

### 3. js部分

#### 安装uglifyjs-webpack-plugin用于压缩js
> 由于抽离css时optimization.minimizer的配置，导致webpack4压缩的默认js相关配置被覆盖，因此需要手动配置js压缩，此插件也是放在optimization.minimizer中

#### 安装babel-loader、@babel/core、@babel/preset-env
> (加载器)、(核心模块，可以调用transform方法转换源代码)、(转化模块，es6->es5)

#### 安装@babel/plugin-proposal-class-properties
> @babel模块很大，因此最好按需下载模块，此模块为class的转换工具

#### 安装@babel/plugin-proposal-decorators
> class的装饰器

#### 安装@babel/plugin-transform-runtime(dev环境)、@babel/runtime(生产环境)
> babel只能转义ES6语法，比如箭头函数，但是遇到ES6新增的api就无能为力了，runtime可处理async、Promise、generater等新增API

#### 安装@babel/polyfill
> runtime无法处理实例上的方法，如'aaa'.includes('aa'),因此需使用@babel/polyfill，@babel/polyfill的使用方式较为特殊，并非配置在插件中，可在需要的js文件中引入，或在entry中添加'@babel/polyfill'。

\*注：polyfill、runtime作用都是实现ES6相关API，但polyfill是污染全局变量，runtime是使用局部变量，对于实例上的api，必须污染原型链上的全局变量，因此runtime无法处理。由于runtime是使用局部变量实现，假设多个地方使用了Promise,在使用的地方注入局部变量，势必会有大量重复代码，plugin-transform-runtime可通过一些helper函数的注入来减少语法转换函数的开销，如多处使用promise时，实现promise的方法指向同一处。\*

### 4. 图片处理

#### 安装file-loader或url-loader用于解析图片文件
> webpack运行于nodejs，无法解析图片;若图片采用的是样式background:url('...'),此种背景图css-loader会进行解析;
file-loader、url-loader都可以解析图片文件，file-loader是将图片拷贝至打包后的文件，url-loader与file-loader相比
多了可将图片解析为base64放入文件中的功能,因此使用时一般添加limit,小于多少比特的文件采用转换base64(base64同常比原文件大1/3)，
limit设为0的话，url-loader功能与file-loader没区别了
#### 安装html-withimg-loader，用于解析html中img
> 若在html中添加img，图片地址为src目录下的draw.svg，直接打包的话打包后的文件中src地址仍指向src目录下的src,因此需要
html-withimg-loader将html中的img指向的图片打包至dist；html-withimg-loader并不能直接解析图片文件，遇到html中的img标签
时，html-withimg-loader需通过file-loader或url-loader对图片文件进行解析，并修改html中src的指向

### 5.不同类型文件放入相应文件夹
#### 将不同类型文件放入相应文件夹，通常在打包的最后一步进行，如js文件的output，图片文件的url-loader中，css文件若没有minicss插件，一般默认打包到js文件中，若单独分离，最后一步为mini-css-extract-plugin插件处理，因此在此处设置

### 6. 代码规范

#### 安装eslint eslint-loader(可在官网上勾选具体规则，下载配置,不配置会报错)

### 7. 暴露对象

#### 若要讲某个对象（如jquery）暴露于全局window下
* 安装并使用expose-loader
#### 若要将对象暴露于每一个模块
* 使用webpack.ProvidePlugin

### 8.sourceMap
#### 若要在打包后文件的基础上查看原文件，则需要设置devtool，注意，生产环境若没在UglifyJsPlugin中设置sourcemap:true,即使设置了devtool也无法查看原文件（原文件可在F12->Sources->webpack:// 中查看,未设置则无此文件夹），devtool的类型有：
* source-map:大而全，会产生单独的map文件，可查看报错部分在原文件的行和列
* eval-source-map:不会产生单独的文件，但报错能显示行和列
* cheap-module-source-map:报错不会显示多少列，但是一个单独的映射文件
* cheap-module-eval-source-map: 不会产生文件，集成在打包后的文件中，报错不会显示多少列

### 9.resolve配置
#### 详情见代码注释：
        resolve: {
        // 解析第三方包只从node_modules查找
        // 如代码中import XX from 'xx';'xx'默认只在node_modules查找
        // 一般引用模块默认从当前目录的node_modules查找，找不到则沿着
        // 上一层目录去查找，此配置缩小查找范围
        modules:[path.resolve('node_modules')],
        // 一般import XX from 'xx',引入的路径都是在package.json中'main'配置里的路径，
        // 此配置可规定引入时先查找package.json下的哪个路径
        // mainFields: ['style','main'],
        // 设置默认入口文件名字，默认是index,因此若配置main,此项目中依赖了'strip-ansi'包，该包package.json
        // 中未配置main,因此默认找index.js，此配置让这种场景默认找main.js，因此require('strip-ansi')报错
        // mainFiles: ['main'],
        // 引入文件时若未填写后缀，先找同名js，再找css，再json,依次从左到右
        // extensions: ['.js','.css','.json'],
        alias:{
            //别名，代码中'@/'直接指向src目录
            '@':path.resolve(__dirname,'../src'),
        }
### 10.常用插件
#### 安装cleanWebpackPlugin(打包前清空dist)
#### 安装copyWebpackPlugin(文件直接复制)
#### bannerPlugin(版权声明插件，不用安装，webpack内置)
---
## 常用功能
### 1、代理
#### webpack代理功能可用于解决跨域问题，将浏览器到有跨域问题服务器的请求，转化为浏览器到无跨域问题的代理服务器，代理服务器到有跨域问题服务器的请求，其效果类似于nginx的proxy_pass；同源策略只针对浏览器，服务器到服务器的请求不会有跨域问题。
#### proxy配置只针对于开发环境，生产环境不会自动搭建服务器。
#### devServer中配置：
        proxy:{
            //匹配/api接口，将其代理到http://localhost:8080
            // 方法1：
            //'/api':'http://localhost:8080'
            // 方法2：
            '/api':{
                target: 'http://localhost:8080',
                // 将路径替换，/api/name中的/api替换为空字符串
                pathRewrite:{
                    '/api':''
                }
            }
        },
#### 除此之外，还可以在nodejs搭建的服务器中，利用webpack-dev-middleware启动webpack,此时打包后的服务器与搭建的服务器同源，也不会引起跨域问题。
### 2、mock数据
#### 利用devServer提供的生命周期钩子，在开发环境dev服务器上新增接口，devServer中配置：
            before(app){
            app.get(/^\/api/,(req,res)=>{
                res.json({data:'mock-data-before'})
                })
            }
### 3.实时打包
#### 新增如下配置,build完毕后服务不会立刻结束，修改代码后可实时打包，相当于build版的热更新。
        watch:true, // 实时打包，相当于build的热更新
        watchOptions:{
            poll:1000, //每1000毫秒轮询一次
            aggregateTimeout:300, //防抖，停止输入300ms后才更新
            ignored: /node_modules/, //不监控node_modules
        },
