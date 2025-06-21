function loader(content, map, meta) {
    const lastLoaderName = ' loader name is log...'
    return this.callback(null, content, map, { ...meta, lastLoaderName })
}

module.exports = loader