/**
 * @description 爬取单页内容
 * 使用方法：node 该文件名.js
 */

// 引入http模块
const https = require('https')
const http = require('http')
// 引入url模块
const url = require('url')
// cheerio库,将字符串解析成html
const cheerio = require('cheerio')
// fs模块
const fs = require('fs')

// 需要爬取的地址
const source_url = 'https://juejin.im/post/5c7a4952f265da2ddd4a7813?utm_source=gold_browser_extension'

// 封装获取页面方法，返回promise对象，给await和aynsc使用
function parseUrl (u) {
  return new Promise((resolve, reject) => {
    https.get(url.parse(u), res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('spider end && do callback')
        resolve(data)
      })
      res.on('error', () => reject(data))
    })
  })
}

// 创建node服务器，监听8000端口
function createSever ({ title, content }) {
  const server = http.createServer()

  // 相当于路由，对静态资源做代理
  server.on('request', (req, res) => {
    if (req.url === '/') {
      // 首页时，返回首页内容
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.write(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
            <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover">
            <link rel="stylesheet" href="./static/style.css">
          </head>
          <body>
            <h1 class="article-title">${title}</h1>
            <article class="article-content">${content}</article>
          </body>
        </html>`
      )
      res.end()
    } else if (req.url.indexOf('.css') > 0) {
      // 访问的是css文件时，读取该文件，不存在则返回404，存在则返回文件内容
      fs.readFile(__dirname + req.url, (err, data) => {
        if (err) {
          res.writeHead(404, {
            "Content-Type":"text/html;charset=UTF8"
          })
          res.write('404 Error')
          res.end()
        } else {
          res.writeHead(200, {
            "Content-Type": "text/css"
          })
          res.end(data)
        }
      })
    }
  })

  server.listen(8000)
}

/**
 * @description 爬虫方法，爬取单页面，多页面自行实现
 * @param {String} u 爬取的路径
 */
async function spider (u) {
  const data = await parseUrl(u)
  if (!data) return console.error('Unable to fetch page data. ')

  // 通过cheerio库将爬取的页面字符串转化为dom对象
  const $ = cheerio.load(data)
  let title = $('.article-title').text()
  let content = $('.article-content').html()
 
  // 将ul元素转化为ol元素
  content = content.replace(/ul/ig, 'ol')
  // 创建node服务器
  createSever({ title, content })
}

spider(source_url)
