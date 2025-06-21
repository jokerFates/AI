

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

// const prodConfig = require('./webpack/webpack.prod.js')
const devConfig = require('./webpack/webpack.dev.js')

const { getIPAddress } = require('./util.js')
// const { mode = 'dev', port } = process.env

// 开发
const compiler = webpack(devConfig)
const server = new WebpackDevServer({
    historyApiFallback: true,
    port: 8081
}, compiler)
server.startCallback(() => {
    console.log(`<i> server start http://localhost:${8081}/`)
    console.log(`<i> server start http://${getIPAddress()}:${8081}/`)
})



