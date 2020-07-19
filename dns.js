const dns = require('native-dns'),
	server = dns.createServer()

server.on('request', (req, res) => {
	console.log({ req })
})

module.exports = server