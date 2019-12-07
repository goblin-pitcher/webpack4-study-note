## es7类装饰器

### 类装饰器的实现
* 对Class本身赋值
	
		const decorators = props=>klass=>{
   		 klass.props = props
		}
		class A{
	    	constructor(){
	    	console.log(this.props)
	    	}
		}
		new A() // this.props输出undefined
		decorators({name:'test1',age:18})(A)
		new A() // this.props输出依旧为undefined
		A.props	// 输出{name:'test1',age:18}

* 对原型链赋值
		const decorators = props=>klass=>{
   		 klass.prototype.props = props
		}
		class A{
	    	constructor(){
	    	console.log(this.props)
	    	}
		}
		new A() // this.props输出undefined
		decorators({name:'test1',age:18})(A)
		new A() // 输出{name:'test1',age:18}


### 类装饰器的转换
在babel首页点击试一试，可以在线将es5以上的代码转换成普通的es5代码。
将装饰器模式设为`legacy`, 输入如下代码:

	const decorators = props=>klass=>{
		klass.prototype.props = props
	}
	@decorators({name:'xx',age:18})
	class A{
		constructor(){
    	console.log(this.props)
    	}
	}

转换后的代码如下：

	"use strict";

	var _dec, _class;
	
	function _instanceof(left, right) {
	  if (
	    right != null &&
	    typeof Symbol !== "undefined" &&
	    right[Symbol.hasInstance]
	  ) {
	    return !!right[Symbol.hasInstance](left);
	  } else {
	    return left instanceof right;
	  }
	}
	
	function _classCallCheck(instance, Constructor) {
	  if (!_instanceof(instance, Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}
	
	var decorators = function decorators(props) {
	  return function(klass) {
	    klass.prototype.props = props;
	  };
	};
	
	var A = ((_dec = decorators({
	  name: "xx",
	  age: 18
	})),
	_dec(
	  (_class = function A() {
	    _classCallCheck(this, A);
	
	    console.log(this.props);
	  })
	) || _class);

我们仅需关心最后对A变量的赋值：
	
	var A = ((_dec = decorators({
	  name: "xx",
	  age: 18
	})),
	_dec(
	  (_class = function A() {
	    _classCallCheck(this, A);
	
	    console.log(this.props);
	  })
	) || _class);

由于`a=(b=5,b||7)`的写法可以转换为`b=5;a=b||7`，因此这段赋值可以理解成：

	decorators=props=>klass=>{}
	class A{}
	A=decorators(props)(A)||A

当装饰器对类装饰后具有返回值，则A会赋予这个返回值。

react-redux的connect函数就是按照装饰器函数的规范设计的，可以查看connect源码，`connect(props)(klass)`是具有返回值的，因此装饰后的class为connect返回的，继承自原本class的对象。