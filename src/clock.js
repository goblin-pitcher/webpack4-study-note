const $ = document.querySelector.bind(document)
const dial = $('.dial')
let innerStr = ''
for(let i=0;i<60;i++){
    innerStr += `<li style="transform:translateX(-1px) rotate(${6*i}deg);"></li>`
}
dial.innerHTML = innerStr
const second = $('.second')
const minute = $('.minute')
const hour = $('.hour')
let isCancel = false
let date,s,m,h
function keepTransition(){
    const keepFunc= self => {
        self.style.transition = 'none'
        self.style.transform = 'translateX(-50%) rotate(174deg)'
        isCancel = true
        setTimeout(()=>{
            isCancel = false
            self.style.transition = ''
        },200)
    }
    second.addEventListener('transitionend',()=>{
        if(s===59) {
            keepFunc(second)
        }
    })
}
function runClock(){
    setInterval(()=>{
        if(isCancel) return
        date = new Date()
        s = date.getSeconds()
        m = date.getMinutes() + s/60
        h = date.getHours() + m/60
        second.style.transform = `translateX(-50%) rotate(${(180+6*s)}deg)`
        minute.style.transform = `translateX(-50%) rotate(${(180+6*m)}deg)`
        hour.style.transform = `translateX(-50%) rotate(${(180+30*h)}deg)`
    },200)
    keepTransition()
}
runClock()
