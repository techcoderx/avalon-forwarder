const argv = require('yargs').argv

let config = {
    source_api: 'http://localhost:3001',
    destination_api: 'http://localhost:3020',
    resigner_key: '',
    start_block: -1, //4350027
    replay_output: 25
}

for (let c in config)
    config[c] = argv[c] || process.env['AVALON_FORWARDER_' + c.toUpperCase()] || config[c]

module.exports = config