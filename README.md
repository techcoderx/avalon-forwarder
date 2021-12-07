# Avalon Forwarder

Rebroadcasts Avalon mainnet transactions to testnet. Useful to mirror mainnet state onto testnet as close as possible.

## Install

```
git clone https://github.com/techcoderx/avalon-forwarder.git
cd avalon-forwarder
npm i
```

## Configuration

Set in command line args, environment variables or in [config.js file](https://github.com/techcoderx/avalon-forwarder/blob/main/src/config.js) in this order.

|Argument|Env Var|Description|Default|
|-|-|-|-|
|`--source_api`|`AVALON_FORWARDER_SOURCE_API`|Source mainnet API|http://localhost:3001|
|`--destination_api`|`AVALON_FORWARDER_DESTINATION_API`|Destination testnet API|http://localhost:3020|
|`--resigner_key`|`AVALON_FORWARDER_RESIGNER_KEY`|Private key for resigning txs||
|`--start_block`|`AVALON_FORWARDER_START_BLOCK`|Mainnet block to start catching up txs from. Set to -1 for head block.|-1|
|`--replay_output`|`AVALON_FORWARDER_REPLAY_OUTPUT`|Log frequency of replay progress|25|