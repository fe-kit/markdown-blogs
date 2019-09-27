# Welcome to markdown-blog !
> 防抖：触发完事件 n 秒内不再触发事件，才执行
> 思路：每次触发事件时都取消之前的延时调用

> 节流：如果你持续触发事件，每隔一段时间，只执行一次事件
> 思路：每次触发事件时都判断当前是否有等待执行的延时函数

### 结果
::: spoiler 防抖：点击查看结果
```javascript
// 防抖
function debounce(fn, wait = 500 ) {
    let timeout = null;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, wait);
    }
}
function sayHi() {
    console.log('防抖成功');
}
const fn = debounce(sayHi);
window.addEventListener('resize', fn)
```
:::

::: spoiler 节流：点击查看结果
```javascript
// 节流
function throttle(fn, wait = 500 ) {
    let flag = true;
    return function () {
        if (!flag) return;
        flag = false;
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
            flag = true;
        }, wait);
    }
}
function sayHi(e) {
    console.info(e, this)
    console.log('节流成功');
}
const fn = throttle(sayHi);
window.addEventListener('resize', fn)
```
:::
***
### 延伸
* 防抖：input suggest, button click
* 节流：resize, scroll