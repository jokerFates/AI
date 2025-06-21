
const { merge } = require('webpack-merge')
const base = require('../../webpack.config.js')
const { projectName } = process.env

const getSplitChunkConfig = () => {
    const entry = JSON.parse(process.env.entryObject || "[]")
    if (entry.length > 1) {
        return {}
    } else {
        return {
            cacheGroups: {
                react: {
                    name: `./${entry[0]}/react`,
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                }
            }
        }
    }
}

const chunkConfig = getSplitChunkConfig()

module.exports = merge(base, {
    entry: `./src/main.tsx`,
    mode: 'production',
    // optimization: {
    //     splitChunks: {
    //         ...chunkConfig,
    //     },
    // },
})


