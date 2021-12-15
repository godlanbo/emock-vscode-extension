// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const { provideDefinition } = require('./json.js')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "study-demo" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable = vscode.commands.registerCommand(
    'study-demo.helloWorld',
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(
        'Hello World from vscode-study-plugin!'
      )
    }
  )

  // context.subscriptions.push(
  //   vscode.commands.registerCommand('study-demo.getCurrentFilePath', uri => {
  //     vscode.window.showInformationMessage(
  //       `当前文件(夹)路径是：${path.resolve(__dirname, './test')}`
  //     )
  //   })
  // )
  require('./server/app')(context)
  require('./provide')(context)
  require('./hover')(context)

  // context.workspaceState

  context.subscriptions.push(
    vscode.commands.registerCommand('study-demo.openWebview', function (uri) {
      // 创建webview
      const panel = vscode.window.createWebviewPanel(
        'testWebview', // viewType
        'WebView演示', // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
          enableScripts: true, // 启用JS，默认禁用
          retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
        }
      )
      panel.webview.html = `<html><body>你好，我是Webview</body></html>`
    })
  )
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(['json'], {
      provideDefinition
    })
  )
  // 编辑器命令
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'study-demo.getCurrentFilePath',
      (textEditor, edit) => {
        // let quickPick = vscode.window.showQuickPick(['Node', 'GO', 'PHP'], {
        //   title: '测试quick pick',
        //   placeHolder: 'select'
        // })
        // quickPick.then(res => {
        //   console.log('select:: ', res)
        // })
        console.log('您正在执行编辑器命令！')
        console.log(textEditor, edit)
      }
    )
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
