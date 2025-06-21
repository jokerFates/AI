/**
 * @param {string|Buffer} content  上一个loader的输出 第一个loader只有content（资源文件）
 * @param {object} map  可选  sourceMaps数据
 * @param {any} meta  可选 用于 loader 之间传递额外信息 webpack不做额外处理
 * @returns {string|Buffer}
 */
function loader(content, map, meta) {
    const options = Object.assign({ disable: false, color: 'green' }, this.getOptions(require('./config')))
    content = options.disable ? content.replace('red', options.color || 'blue') : content
    return this.callback(null, content, map, meta)
}

module.exports = loader