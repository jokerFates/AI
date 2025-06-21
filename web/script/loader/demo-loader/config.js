const schema = {
    title: 'demoLoader',
    type: 'object',
    properties: {
        color: {
            type: 'string',
            desription: 'color must be a string'
        },
        disable: {
            type: 'boolean',
            description: 'disable must be a boolean'
        }
    },
    required: ['color']
}

module.exports = schema;



