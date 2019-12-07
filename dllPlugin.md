## dlPlugin

开发过程中引用的第三方模块，开发者往往不会去修改源码，而每次打包时又会重新打包引用的第三方模块，因此采用dllplugin生成动态链接库。

### 基本流程：

1. 新建打包第三方模块的webpack.dll.conf.js文件（entry为需要打包的第三方模块，插件中调用webpack.DllPlugin插件生成映射文件），代码打包前，先运行此文件对第三方模块进行打包。
2. 在代码打包的webpack文件中使用 webpack.DllReferencePlugin 插件，引用第1步生成的动态链接库映射文件，代码打包时会先通过此映射文件查看动态链接库中是否有此模块，若有则不打包。
3. 在html文件中引用动态链接库（也可在代码打包时通过插件完成此步骤）。

### 对于配置项context的理解：
1. 关于 dllPlugin 和 dllReferencePlugin 的context配置，若不配置此项，默认路径为插件运行的路径，也就是运行node的项目文件根目录。假设将webpack文件放在 '项目/build/webpack.xxx.js'，虽然插件是配置在webpack.xxx.js的plugins中，但运行的仍是 '项目/node_modules'下的插件文件，其__dirname仍指的是 '项目/' 路径。
2. dllPlugin的context配置决定了映射文件查找模块的__dirname，假设context设置的绝对路径为 '项目/build/' 文件夹，则生成的映射文件中，映射到模块的路径都是 '../node_modules'。
3. 结合1和2，dllPlugin 和 dllReferencePlugin 的context配置要么不设置(默认项目文件根目录)，设置的话则context绝对路径必须指向同一文件夹，否则dllReferencePlugin将找不到第三方模块的映射地址。

### 关于打包内容
1. 全局引用的第三方包，webpack.dll.conf.js入口可直接设为包名，只引用部分模块的第三方包，最好不放在入口中，若将包名放在入口中，则会全部打包；若入口设为引用部分，比如只使用vux的toastPlugin,入口设为'vux/src/plugins/toast/index.js',这样虽然只打包vux的toastPlugin，但引入toastPlugin的方式也要变(代码如下)，使得开发较为不便。


    // import {ToastPlugin} from 'vux'
    import ToastPlugin from 'vux/src/plugins/toast/index.js'


### 代码部分
> webpack.dll.conf.js代码：


    //webpack.dll.conf.js
    
    const path = require('path');
    const webpack = require('webpack');
    const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
    
    // 将动态链接库放到/dist/dll/下
    const dllConfig = {
      entry: {
        vendor: [
          'vue/dist/vue.esm.js',
          'vue-router',
          'vuex',
          'axios',
        ]
      },
      output: {
        path: path.join(__dirname, '../dist/dll'),
        filename: '[name].dll.js',
        library: '[name]_library',
        libraryTarget: 'umd'
      },
      plugins: [
        new webpack.DllPlugin({
          // 生成映射文件
          path: path.join(__dirname, '../dist/dll/manifest.json'),
          name: '[name]_library',
          // context: path.resolve(__dirname,'../')
        }),
        // ParallelUglifyPlugin可实现多线程代码压缩
        new ParallelUglifyPlugin({
          cacheDir: '.cache/',
          uglifyJS: {
            output: {
              comments: false
            },
            compress: {
              warnings: false
            }
          }
        }),
      ],
    }

> 代码打包的webpack中plugins添加：


    new webpack.DllReferencePlugin({
      // context: path.resolve(__dirname,'../'),
      manifest: './dist/dll/manifest.json'
    }),