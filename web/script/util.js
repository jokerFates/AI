const os = require('os')

function getIPAddress() {
    const values = Object.values(os.networkInterfaces())[0]
    return values.find(value => value.family === 'IPv4' && value.address !== '127.0.0.1').address
}
module.exports = { getIPAddress }