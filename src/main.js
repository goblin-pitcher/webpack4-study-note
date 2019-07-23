require('@/common.css');
require('@/theme.less');
require('@babel/polyfill')
console.log('polyfill:::','aaa'.includes('aa'))
// import $ from 'jquery'
// console.log('$:::',$)
// console.log('jQuery:::',jQuery)
console.log('$:::', $);
// console.log('FLAG:::',FLAG)
var f = () => {
    return {testtestlonglong: process.env.NODE_ENV};
};
var a = f();

@testable
class B {
    b = 3;
}

function testable(target) {
    // target.prototype.isTestable = true
    console.log(target);
}

async function func() {
    await new Promise(res => {
        setTimeout(() => {
            res();
        }, 2000);
    });
    return 111;
}

var asd = func();
asd.then(res => {
    console.log(res);
});
// var c = {d: 7}
// var e = {...a, ...c}
// console.log(e)
// let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
// console.log(x); // 1
// console.log(y); // 2
// console.log(z); // { a: 3, b: 4 }
import img from './bd_logo.png';
import svg from './draw.svg';

let _div = document.querySelector('#app');
let img0 = document.createElement('img');
let img1 = document.createElement('img');
img0.src = img;
img1.src = svg;
_div.appendChild(img0);
_div.appendChild(img1);
// cosnle.log(111);
fetch('/api/name').then(res => res.json()).then(data => {
    console.log('getData:::',data);
});