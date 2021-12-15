const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
// const util = require('./util')

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {import('vscode').TextDocument} document
 * @param {vscode.Position} position
 * @param {import('vscode').CancellationToken} token
 */
function provideHover(document, position, token) {
  console.log('hover plugin activated')
  const fileName = document.fileName
  const workDir = path.dirname(fileName)
  const word = document.getText(document.getWordRangeAtPosition(position))
  // const projectPath = util.getProjectPath(document)

  // 只处理package.json文件
  // if (/\/package\.json$/.test(fileName)) {
  const json = document.getText()

  if (
    new RegExp(
      `"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(
        /\//g,
        '\\/'
      )}[\\s\\S]*?\\}`,
      'gm'
    ).test(json)
  ) {
    let destPath = `${workDir}/node_modules/${word.replace(
      /"/g,
      ''
    )}/package.json`
    if (fs.existsSync(destPath)) {
      const content = require(destPath)
      return new vscode.Hover(
        `* **名称**：${content.name}\n* **版本**：${content.version}\n* **许可协议**：${content.license}`
      )
    }
    // }
  }
}

module.exports = function (context) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('json', {
      provideHover
    })
  )
}
