const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'js/[name].[hash:8].js', //只显示8位hash
        path: path.resolve(__dirname, '../dist'),
    },
    devServer: { // 开发服务器配置
        port: 3045,
        progress: true,
        //contentBase: path.resolve(__dirname,'../dist'), //可以指定启动目录
        open: true, //自动打开浏览器
        compress: true, //启动gzip压缩
    },
    resolve: {
        modules:[path.resolve('node_modules')],
        alias:{
            '@':path.resolve(__dirname,'../src'),
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin(['./public']),
        new webpack.BannerPlugin('create by goblin pitcher'),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            fliename: 'index.html',
            minify: {
                removeAttributeQuotes: true, //删除属性的双引号
                collapseWhitespace: true  //折叠空格、空行
            }
        }),
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
                use: {
                    loader: 'eslint-loader',
                    options: {
                        //previous，由于loader执行从下到上，从左到右
                        // 加上pre强制在普通loader之前执行
                        // post则为在普通loader之后执行
                        enforce: 'pre'
                    }
                }
            },
            {
                test: /\.js$/,
                // 设置exclude和include可缩小查找范围，提升打包速度
                exclude: /node_modules/,
                use: {
                    // babel-loader很慢，因此除了设置exclude/include，最好将cacheDirectory设为true
                    // 充分利用缓存提高打包速度
                    loader: 'babel-loader',
                    options: {
                        // 设置缓存，避免重复文件多次被重新loader
                        cacheDirectory: true,
                        // 设置当前js的版本，相当于一个大插件的集合
                        // @babel/preset-env可将es6转换成es5
                        presets: ['@babel/preset-env'],
                        // @babel/preset-env可完成大部分常规的es6转es5，部分功能需要配置
                        // 相应的插件进行转换
                        plugins: [
                            // class装饰器、class转换；宽松模式
                            ["@babel/plugin-proposal-decorators", {"legacy": true}],
                            ["@babel/plugin-proposal-class-properties", {"loose": true}],
                            "@babel/plugin-transform-runtime"
                        ]
                    }
                }
            },
            {
                test: /\.(le|c)ss$/,
                // 执行方向:从右到左，从下到上
                // style-loader是把css插入到head标签中
                use: ['style-loader','css-loader','less-loader']
            }
        ]
    }
}