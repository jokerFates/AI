

const webpack = require('webpack')

const prodConfig = require('./webpack/webpack.prod.js')


// 打包
const compiler = webpack(prodConfig)
compiler.run((err, stats) => {
    console.log(err)
    console.log(stats)
    compiler.close((closeErr) => {
        console.log(closeErr)
    })
})


