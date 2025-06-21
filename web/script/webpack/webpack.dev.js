const base = require('../../webpack.config.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    entry: `./src/main.tsx`,
    mode: 'development'
});