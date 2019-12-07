## happypack

happypack可利用多线程对文件进行打包(默认cpu核数-1)，对多核cpu利用率更高。
new Happypack(options)可生成对应的loader,如配置：

    new Happypack({
       id: 'js',
       use: [{
         loader: 'babel-loader',
         options: {
           cacheDirectory: true
         }
       }]
     }),
     new Happypack({其他loader配置})

在js的loader中配置:

    use:[{
       loader: 'Happypack/loader',
       options: {
           id: 'js'
         }
    }],

则js的打包可利用多线程。
注意，项目较小时，多线程打包反而会使打包速度变慢。
** 注：关于多线程打包，老版本webpack利用webpack.optimize.UglifyJsPlugin进行文件压缩，此插件为单线程，可利用ParallelUglifyPlugin插件实现多线程压缩 **

