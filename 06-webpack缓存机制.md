## webpack缓存机制

一些比较老的html项目，引入js文件时要根据js文件的依赖关系，控制js文件引入顺序。

> 为了避免同步引入阻塞DOM树解析，同时又需要保证文件按顺序解析，因此常常需要给script添加defer属性(添加async属性可保证异步引入，但无法保证按顺序加载)。

在使用各种框架的脚手架进行开发时，往往不需要在意js文件之间的依赖关系。
如a.js:

````
import {b} from './b.js'
console.log(b)
export const a = 'aaa'

````
b.js:

````
import {a} from './a.js'
console.log(a)
export const b = 'bbb'

````
a.js和b.js存在相互依赖，但打包后的代码运行时并不会出现依赖相关的错误，原因就是webpack进行了依赖的缓存。

**注意，webpack对于输出单文件和输出多文件有着不同的处理方式**

### 单文件

#### 单文件打包测试

假设入口文件为main.js:

````
import {str} from './str.js'
console.log(str)

````

str.js:

````
export const str = 'hello world'

````

webpack打包后的代码大概有一百多行，简化后的大体结构如下：

````
 (function(modules) { // webpackBootstrap
 	// module緩存
 	var installedModules = {};
 	// 相当于自定义的require方法
 	function __webpack_require__(moduleId) {
 		// 若缓存中有moduleId对应模块，则从缓存中取
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// Create a new module (and put it into the cache)
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		// 执行参数中modules对应的function
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		// module是否加载完毕
 		module.l = true;
 		// Return the exports of the module
 		return module.exports;
 	}
   ···
   ···
   ···
 	// 立即执行函数首先执行入口文件的内容
 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
 })
/************************************************************************/
// 立即执行函数的参数部分
({
	 "./src/main.js":
	 (function(module, __webpack_exports__, __webpack_require__) {
	  // str.js放入__webpack_exports__中
	  // 利用__webpack_require__从str.js中获取str
	  // console.log(str)
	 })，
	 "./src/str.js":
	 (function(module, __webpack_exports__, __webpack_require__) {
	   // main.js利用__webpack_require__从str.js中获取str时，__webpack_require__递归将str.js的依赖项放入其exports中
	  })
	
});

````
#### 解析

打包后的结果执行步骤如下：
1. 打包文件为一个立即执行函数，其中最主要的部分为：

	- 变量`installedModules`：用于缓存所有模块
	- 函数`__webpack_require__`：相当于一个自定义的require，功能如下：
		- installedModules中**有**对应模块时：返回该模块
		- installedModules中**没有**对应模块时：从立即执行函数的参数中获取该模块，并递归获取其依赖

2. 立即执行函数的参数为一个object（key: 文件路径，value: 文件内容生成的function），立即执行函数最先执行的是入口文件对应的function。
3. 执行入口文件对应function时，传入了`__webpack_require__`，利用`__webpack_require__`递归获取入口文件所需的依赖，执行入口文件中的内容。

假设入口文件main.js依赖于a.js，而a.js于b.js相互依赖，在上述步骤3中，依赖放入`installedModules`的步骤如下：
1. main.js利用`__webpack_require__`获取依赖文件a.js
2. 由于a.js依赖b.js，`__webpack_require__`会递归地将b.js也放入`installedModules`，再递归地获取b.js的依赖
3. b.js的依赖项a.js存在于`installedModules`中，因此结束递归，直接return的a.js

#### 小结

可以看到，开发过程中，文件的相互依赖并不会对webpack打包后的项目造成影响

### 多文件

对于spa或者多页项目，webpack打包后的代码结构是否能像单文件那样处理？


首先，单文件打包后的代码是一个立即执行函数，缓存放在立即执行函数内部的installedModules中，该变量在立即执行函数执行完毕后便已回收，若某时刻再从网络获取其他chunk，之前的依赖项都已经回收，该chunk的依赖项必须重新获取，显然不合适。

其次，单文件的立即执行函数必须放入所有依赖文件。先假设不放入所有依赖，当点击某个按钮跳转页面时，如果跳转后的页面依赖pageA.js：
- 若立即执行函数的参数中没有pageA.js：单文件的`__webpack_require__`方法没法获取该文件
- 若立即执行函数的参数中有pageA.js：此时可以正常跳转，但若想跳转到其他页面，立即执行函数的参数中也必须包含其他依赖文件，而入口文件可以到达所有文件，即参数中包含所有文件依赖，与“不放入所有依赖”的假设相悖


可以得出结论，不能用处理单文件的方式去打包多文件项目。

#### 多文件打包测试

demo描述：点击btn按钮，import()函数引入a.js中的数据，显示在主页
入口文件main.js代码如下：
````
const $ = document.querySelector.bind(document)
// 使用async需要@babel/plugin-transform-runtime插件
// 为减少打包后的代码量，不使用async-await
function func() {
    import('./a.js').then(data=>{
        $('#content').innerHTML = data.default.content
    })
}
$('#btn').onclick = func

````
a.js：

````
export default {
    content: '显示文本内容'
}

````

打包后的入口文件main.js简化代码结构如下：

````
 (function(modules) {
 	function webpackJsonpCallback(data) {
		// 此方法作为webpackJsonp.push方法
		// 可以看到引入的chunks，首先执行的是:
		// (window["webpackJsonp"] = window["webpackJsonp"] || []).push(key,{src:function})
		// 注意，此方法中调用了parentJsonpFunction，parentJsonpFunction指向了webpackJsonp.push，webpackJsonp与webpackJsonpCallback形成循环引用
 	};
	// 缓存模块
 	var installedModules = {};
	// 缓存chunks
 	var installedChunks = {
 		"main": 0
 	};

 	function __webpack_require__(moduleId) {
		// 和单文件差不多
 		return module.exports;
 	}

 	// This file contains only the entry chunk.
 	// The chunk loading function for additional chunks
 	__webpack_require__.e = function requireEnsure(chunkId) {
		// chunks文件一开始不会放在立即执行函数的参数中，此方法从网络获取chunks
		// 
 	};
	/*********************************/
	// webpackJsonp与立即执行函数内部形成循环引用
 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
 	jsonpArray.push = webpackJsonpCallback;
 	jsonpArray = jsonpArray.slice();
	// 若入口文件加载前，chunks文件先加载了，遍历webpackJsonp执行回调，将chunks缓存放入installedModules和installedChunks
 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
 	var parentJsonpFunction = oldJsonpFunction;
	/*******************************/
 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
 })
/************************************************************************/
({
"./src/main.js":
(function(module, exports, __webpack_require__) {

var $ = document.querySelector.bind(document);
function func() {
  new Promise(function (resolve) {
    __webpack_require__.e(0).then((function (require) {
      resolve(__webpack_require__("./src/a.js"));
    }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
  }).then(function (data) {
    $('#content').innerHTML = data["default"].a;
  });
}

$('#btn').onclick = func;
})
});

````
a.js打包后代码如下：

````
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{
"./src/a.js":
(function(module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.r(__webpack_exports__);
 __webpack_exports__["default"] = ({
  a: '显示文本内容'
});
})
}]);

````

#### 解析

可以看到a.js打包后的代码，将[key, {src:function}]结构的代码，放入webpackJsonp，chunks文件本质上是无依赖脚本。
再来看打包后的入口文件，和单文件打包一样，入口文件是一个立即执行函数，但参数只有非chunks文件。在执行__webpack_require__获取main.js相关依赖前，还会执行这么一段代码：

````
// webpackJsonp与立即执行函数内部形成循环引用
 var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
 var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
 jsonpArray.push = webpackJsonpCallback;
 jsonpArray = jsonpArray.slice();
// 若入口文件加载前，chunks文件先加载了，遍历webpackJsonp执行回调，将chunks缓存放入installedModules和installedChunks
 for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
 var parentJsonpFunction = oldJsonpFunction;

````
这段代码主要有两个作用：
1. 使window["webpackJsonp"]和立即执行函数的内部方法webpackJsonpCallback形成循环引用，立即执行函数未退出执行环境，存放chunks的installedChunks和存放modules的installedModules不会被回收，从网络导入chunks时，可以先在缓存中查询chunks是否存在。如下图所示，webpackJsonp.push作用域中可看到立即执行函数中定义的各参数：
![作用域](https://s2.ax1x.com/2019/12/09/Q0BmGT.png)
2. 若chunks在入口文件执行前加载了，执行打包后的入口文件时，分别执行回调，将已加载的chunks文件放入installedChunks和installedModules中

从立即执行函数的参数中可以看到，从网络引入chunks时，调用的是`__webpack_require__.e`方法,该方法代码结构如下：

````
 __webpack_require__.e = function requireEnsure(chunkId) {
 	// 该方法主要作用是根据chunkId获取对应chunk
	// chunk从installedChunks中获取，获取的值有四种状态
	// undefined：chunk未加载, null: chunk通过prefetch/preload提前获取过
	// Promise：chunk正在加载, 0：chunk加载完毕
	var promises = [];
	var installedChunkData = installedChunks[chunkId];
	if(installedChunkData !== 0) {
		// 若正在加载，则给加载的这个promise添加回调
		if(installedChunkData) {
			promises.push(installedChunkData[2]);
		} else {
			// 无论installedChunkData是undefined还是null，都视作需要从网络获取对应chunk
			// 若是undefined未加载状态，从网络获取，若是null则表明浏览器缓存中存在对应chunk的缓存，请求会自动从浏览器缓存中获取结果
		}
	}
	// 若installedChunkData=0，则返回value为[]的promise，后续从installedChunks中取出对应内容
	return Promise.all(promises);
 };

````
#### 小结

前面分析，多文件不能像单文件那样打包的原因主要是：
1. 单文件的installedModules在执行完毕便会被回收
2. 单文件无法解决chunks不放在立即函数的参数中的问题

在多文件中，以上两个问题的解决方式分别是：
1. 利用循环window.webpackJsonp的引用防止立即执行函数中的变量被回收
2. `__webpack_require__.e`定义了从网络获取chunks的方法

同时，chunks都是无依赖脚本，入口文件对于无依赖chunks的处理保证了多文件和单文件一样，无需担心依赖之间的关系。