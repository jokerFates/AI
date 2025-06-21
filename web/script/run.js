const inquirer = require('inquirer')
const spawn = require('cross-spawn')
const {runQuestion } = require('./config')

// /** 运行项目 */
// inquirer.prompt([...runQuestion]).then((res) => {
//     const { mode, runEnv, port } = res
//     process.env.NODE_ENV = runEnv
//     process.env.mode = mode
//     process.env.port = port

//     spawn('node', ['./script/index.js'], {
//         stdio: 'inherit',
//         cwd: process.cwd(),
//     })
// })

spawn('node', ['./script/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
})