## optimization.splitChunks


### cacheGroups

个人感觉splitChunks中除了cacheGroup之外的配置是用来作代码分割的，而cacheGroup是作为模块合并的配置项。cacheGroup内配置优先级高于外面配置，可以理解为先进行分割再进行合并，分割的代码放到哪个缓存组的块中，由优先级决定。
可进行如下配置：

        splitChunks:{
            cacheGroups: {
                common:{
                    chunks: 'initial',
                    name:'testCommon', // 打包后的文件名
                    minSize: 0, 
                    minChunks: 2 // 重复2次才能打包到此模块
                },
                vendor: {
                    priority: 1, // 优先级配置，优先匹配优先级更高的规则，不设置的规则优先级默认为0
                    test: /node_modules/, // 匹配对应文件
                    chunks: 'initial',
                    name:'testVendor',
                    minSize: 0,
                    minChunks: 1
                }
            }
        }

除了test, priority和reuseExistingChunk只能卸载cacheGroups里，其他属性都能直接写在splitChunks下。


### chunks

前一步配置中提到chunks一般用initial打包规则，chunks可配置的参数有：all, async和initial三种。具体区别详见：
[https://juejin.im/post/5c08fe7d6fb9a04a0d56a702](https://juejin.im/post/5c08fe7d6fb9a04a0d56a702)

总结一下：
initial: 对于匹配文件，非动态模块打包进该vendor,动态模块优化打包
async: 对于匹配文件，动态模块打包进该vendor,非动态模块不进行优化打包
all: 匹配文件无论是否动态模块，都打包进该vendor

webpack4的默认配置中，splitChunks.chunks默认是async,因为webpack更希望将代码中异步引入的部分作为独立模块进行打包，异步的部分在需要时引入，这种懒加载的方式更能提升页面性能。

注：import()可动态加载模块，返回一个Promise。

### minSize

当模块大于minSize时，进行代码分割

### maxSize

当模块大于maxSize时，尝试将该模块拆分，如设置maxSize为50*1024，代码中引入了jQuery,jQuery模块大于50kb,于是尝试将jQuery拆分（只是尝试，不一定真能拆分成功）

### maxAsyncRequests

同时加载的模块数，若代码分割设置的是一个库分割成一个模块，打开某个页面时同时需要加载10个库，设置maxAsyncRequests：5，只会将那10个库分割成5个模块

### maxInitialRequests

最大初始化加载次数，入口文件可以并行加载的最大文件数量。
maxInitialRequest和maxAsyncRequests中的'initial'和'async'代表的意思和chunks配置中的'initial'和'async'一样，maxAsyncRequests代表懒加载时最多只能同时引入多少个模块，maxInitialRequests代表非懒加载时最多能同时引入多少模块。
假设maxInitialRequests设为3，有文件a.js中，使用了大量import xx from 'xx',a.js依赖的这些非动态加载的模块，最多只会被打包成3个模块。
可参考：
[https://ymbo.github.io/2018/05/21/webpack配置代码分割/#%E4%B8%89%E3%80%81%E7%96%91%E9%9A%BE%E9%85%8D%E7%BD%AE%E9%A1%B9](https://ymbo.github.io/2018/05/21/webpack配置代码分割/#%E4%B8%89%E3%80%81%E7%96%91%E9%9A%BE%E9%85%8D%E7%BD%AE%E9%A1%B9 "https://ymbo.github.io/2018/05/21/webpack配置代码分割/#%E4%B8%89%E3%80%81%E7%96%91%E9%9A%BE%E9%85%8D%E7%BD%AE%E9%A1%B9")

### automaticNameDelimiter
打包的chunk名字连接符，如设为'-',生成的chunk文件名为chunk-name.js

### name
是否以cacheGroups中的filename作为文件名

### reuseExistingChunk
重复使用已经存在的块，若某个模块在之前已经被打包过了，后面打包时再遇到这个模块就直接使用之前打包的模块
