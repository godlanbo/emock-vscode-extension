const http = require('http')

http.get('http://www.baidu.com', (res => {
    console.log(res)
}))