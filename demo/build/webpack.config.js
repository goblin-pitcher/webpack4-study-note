const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Autoprefixer = require('autoprefixer')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const mode = process.env.NODE_ENV


const config =  {
    devServer: { // 开发服务器配置
        port: 3000,
        progress: true,
        //contentBase: path.resolve(__dirname,'../dist'), //可以指定启动目录
        open: true, //自动打开浏览器
        compress: true, //启动gzip压缩
        // proxy:{
        //     //匹配/api接口，将其代理到http://localhost:8080
        //     // 方法1：
        //     //'/api':'http://localhost:8080'
        //     // 方法2：
        //     '/api':{
        //         target: 'http://localhost:8080',
        //         // 将路径替换，/api/name中的/api替换为空字符串
        //         pathRewrite:{
        //             '/api':''
        //         }
        //     }
        // },
        // // 前端mock数据,利用提供的生命周期钩子
        // before(app){
        //     app.get(/^\/api/,(req,res)=>{
        //         res.json({data:'mock-data-before'})
        //     })
        // }
    },
    mode, // development or production
    // entry: ['@babel/polyfill', './src/main.js'],
    entry: './src/main.js',
    output: {
        filename: 'js/[name].[contenthash:8].js', //只显示8位hash
        path: path.resolve(__dirname, '../dist'),
        // 当引用路径统一需要加上前缀时设置
        // publicPath: 'http://www.xx.cdn.xx.com/'
    },
    externals: {
        // react: 'react'
    },
    watch:false, // 实时打包，相当于build的热更新
    watchOptions:{
        poll:1000, //每1000毫秒轮询一次
        aggregateTimeout:300, //防抖，停止输入300ms后才更新
        ignored: /node_modules/, //不监控node_modules
    },
    devtool:'cheap-module-source-map',
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
        extensions: ['.js', '.css','.json'],
        alias:{
            //别名，代码中'@/'直接指向src目录
            '@':path.resolve(__dirname,'../src'),
        }
    },
    optimization: {
        // minimizer的配置会让webpack4默认的js压缩失效，因此需要重新配置js的压缩
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true, // 是否并发
                // devtool设置了sourcemap类型，但生产环境是否启用sourcemap仍需要此参数设置
                sourceMap: false
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        // 定义环境变量
        new webpack.DefinePlugin({
            FLAG: JSON.stringify(mode)
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin(['./public']),
        new webpack.BannerPlugin('create by goblin pitcher'),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            fliename: 'index.html',
            // hash: true, //引用文件加hash值，如打包后文件为bundle.js?6d1dae454d5a1d5as
            // HtmlWebpackPlugin默认会引入所有entry的文件，chunks指定引入哪些入口的文件
            // 此配置一般用于多页面应用，单页面只有一个入口加不加无所谓
            // chunks:['main'],
            minify: {
                removeAttributeQuotes: true, //删除属性的双引号
                collapseWhitespace: true  //折叠空格、空行
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css'// 将样式文件放入css文件夹
        }),
        new webpack.ProvidePlugin({
            $: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test:/\.html$/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options:{
                        limit: 7*1024, //小于7kb的转换为base64
                        outputPath: 'img/'
                        // 当引用路径统一需要加上前缀时设置
                        // publicPath: 'http://www.xx.cdn.xx.com/'
                    }
                }]
            },
            {
                // 将jquery以jQuery和$暴露给window
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'eslint-loader',
                    options: {
                        //previous，由于loader执行从下到上，从左到右
                        // 加上pre强制在普通loader之前执行
                        // post则为在普通loader之后执行
                        enforce: 'pre'
                    }
                }]
            },
            {
                test: /\.js$/,
                // 设置exclude和include可缩小查找范围，提升打包速度
                exclude: /node_modules/,
                use: [{
                    // babel-loader很慢，因此除了设置exclude/include，最好将cacheDirectory设为true
                    // 充分利用缓存提高打包速度
                    loader: 'babel-loader',
                    options: {
                        // 设置缓存，避免重复文件多次被重新loader
                        cacheDirectory: true,
                        // 设置当前js的版本，相当于一个大插件的集合
                        // @babel/preset-env可完成大部分常规的es6转es5，部分功能需要配置
                        presets: ['@babel/preset-env'],
                        // 相应的插件进行转换
                        plugins: [
                            // class装饰器、class转换；宽松模式
                            ["@babel/plugin-proposal-decorators", {"legacy": true}],
                            ["@babel/plugin-proposal-class-properties", {"loose": true}],
                            "@babel/plugin-transform-runtime"
                        ]
                    }
                }]
            },
            {
                test: /\.(le|c)ss$/,
                // 执行方向:从右到左，从下到上
                // style-loader是把css插入到head标签中
                use: [
                    // {
                    //     loader: 'style-loader',
                    //     options: {
                    //         // insertAt: 'top' // 把style插到最上面
                    //     }
                    // },
                    // 不用style-loader插到head,样式单独提取
                    MiniCssExtractPlugin.loader,
                    {
                        loader:'css-loader',
                        options:{
                            sourceMap:true
                        }
                    },
                    // 'postcss-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            // 直接添加plugins配置，可以不用创建postcss-loader.config.js
                            plugins: [
                                Autoprefixer
                            ],
                            // config:{
                            // 若通过配置文件配置postcss-loader，且不想放在根目录下，可通过path配置文件路径
                            //     path: 'build'
                            // }
                        }
                    },
                    'less-loader'
                ]
            }
        ]
    }
}
if(mode === 'production'){
    config.plugins.push(new BundleAnalyzerPlugin())
}
module.exports = config
