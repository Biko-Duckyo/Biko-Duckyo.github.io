// 空脚本：用于替换 hexo-butterfly-clock 默认注入的第三方 IP 定位脚本
// （https://pv.sohu.com/cityjson）。新版电子钟 /clock/clock.js 已改为
// 浏览器定位 + 同源天气代理，不再读取 returnCitySN，因此这里用一个零请求、
// 零副作用的本地空文件占位，避免向第三方上报访问，也避免本地出现 127.0.0.1。
