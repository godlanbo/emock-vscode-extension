const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')
const Router = require('koa-router')
const Mock = require('mockjs')
const vscode = require('vscode')
const path = require('path')
const net = require('net')

const router = new Router()

// middlewares
app.use(cors())
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
router.prefix('/mock')

function initRouter(workDir) {
  let configFilePath = path.resolve(workDir, './emock.config.js')
  let config = require(configFilePath)
  console.log('mock config: ', config)
  let { get: getMock, post: postMock } = config
  getMock.forEach(getItem => {
    router.get(getItem.url, ctx => {
      ctx.body = Mock.mock(getItem.data)
    })
  })

  postMock.forEach(postItem => {
    router.post(postItem.url, ctx => {
      ctx.body = Mock.mock(postItem.data)
    })
  })
}

function isPortCanUse(port) {
  return new Promise(resolve => {
    let server = net.createServer().listen(port)
    server.on('listening', () => {
      server.close()
      resolve(true)
    })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false)
      }
    })
  })
}

app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

const ServerStatus = {
  RUNNING: 1,
  STOP: 2
}
const portKey = 'EMock.port'

const EMockServerHandler = {
  status: ServerStatus.STOP,
  port: vscode.workspace.getConfiguration().get(portKey) || 3000,
  channel: null,
  initRouter(uri) {
    initRouter(path.dirname(uri.path))
    return this
  },
  startServer() {
    isPortCanUse(this.port).then(res => {
      console.log('port res:', res);
      if (res) {
        this.channel = app.listen(this.port, () => {
          console.log('app is running at port: ', this.port)
          vscode.commands.executeCommand('setContext', 'EMock:show', true)
        })
      } else {
        vscode.window.showErrorMessage(`${this.port}端口不可用`)
      }
    })
    return this
  },
  stopServer() {
    this.channel.close(() => {
      console.log('app server is closed')
      this.channel = null
      vscode.commands.executeCommand('setContext', 'EMock:show', false)
    })
    return this
  },
  handleConfigChange() {
    this.port = vscode.workspace.getConfiguration().get(portKey) || 3000
    if (this.channel) {
      this.stopServer().startServer()
    }
    return this
  }
}

module.exports = context => {
  vscode.commands.executeCommand('setContext', 'EMock:show', false)
  vscode.workspace.onDidChangeConfiguration(() => {
    EMockServerHandler.handleConfigChange()
  })

  context.subscriptions.push(
    vscode.commands.registerCommand('study-demo.openMockServer', uri => {
      EMockServerHandler.initRouter(uri).startServer()
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('study-demo.closeMockServer', () => {
      EMockServerHandler.stopServer()
    })
  )
}
