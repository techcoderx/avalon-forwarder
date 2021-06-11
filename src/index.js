const AvalonStreamer = require('./avalonStreamer')
const config = require('./config')
const axios = require('axios')
const javalon = require('javalon')
const series = require('run-series')
const ExcludedTxTypes = [
    javalon.TransactionType.ENABLE_NODE,
    javalon.TransactionType.APPROVE_NODE_OWNER,
    javalon.TransactionType.DISAPROVE_NODE_OWNER
]

javalon.init({api: config.destination_api})

console.log('source api',config.source_api)
console.log('destination api',javalon.config.api)

let sentTx = 0
let erroredTxs = 0

// catch up
function fetchTxs(api,blockNum,endBlockNum,cb) {
    if (blockNum >= endBlockNum) {
        console.log('fetch complete')
        return cb()
    }
    axios.get(api + '/block/' + blockNum).then((newBlock) => {
        if (blockNum % config.replay_output === 0) {
            console.log('scanned block',blockNum,'rebroadcasted',sentTx,'tx with',erroredTxs,'fails')
            sentTx = 0
            erroredTxs = 0
        }
        let ops = []
        for (let i = 0; i < newBlock.data.txs.length; i++) if (newBlock.data.txs[i].type !== javalon.TransactionType.ENABLE_NODE) {
            ops.push((callback) => {
                let newTx = {
                    type: newBlock.data.txs[i].type,
                    data: newBlock.data.txs[i].data
                }
                let resignedTx = javalon.sign(config.resigner_key,newBlock.data.txs[i].sender,newTx)
                javalon.sendRawTransaction(resignedTx,(e) => {
                    if (!e)
                        sentTx++
                    else
                        erroredTxs++
                    callback(null,true)
                })
            })
        }
        if (ops.length > 0)
            series(ops,() => setTimeout(() => fetchTxs(api,blockNum+1,endBlockNum,cb),500))
        else
            fetchTxs(api,blockNum+1,endBlockNum,cb)
    }).catch(() => {
        fetchTxs(api,blockNum+1,endBlockNum,cb)
    })
}

// stream
function streamTxs() {
    let streamer = new AvalonStreamer(config.source_api,true)
    streamer.streamTransactions((txns) => {
        if (!ExcludedTxTypes.includes(txns.type)) {
            let newTx = {
                type: txns.type,
                data: txns.data
            }
            let resignedTx = javalon.sign(config.resigner_key,txns.sender,newTx)
            javalon.sendRawTransaction(resignedTx,(e) => {
                if (!e) {
                    console.log('rebroadcasted tx type',newTx.type,'by',txns.sender)
                }
            })
        }
    })
}

if (config.start_block >= 0) {
    axios.get(config.source_api + '/count').then((bHeight) => {
        console.log('end block',bHeight.data.count)
        fetchTxs(config.source_api,config.start_block,bHeight.data.count,() => streamTxs(config.source_api))
    }).catch(() => {
        console.log('failed to fetch block height to catchup to')
    })
} else {
    streamTxs(config.source_api)
}