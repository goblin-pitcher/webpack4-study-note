import './theme.less'
import './clock.js'

// es6方法测试
async function func() {
    const val1 = await new Promise(res=>{setTimeout(res.bind(this,120),300)})
    const val2 = await new Promise(res=>{setTimeout(res.bind(this,val1/2),300)})
    return val2
}
func().then(data=>{data>50?console.log('es6 test pass'):null})

