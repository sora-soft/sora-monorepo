[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ListenerCallback

# Type Alias: ListenerCallback\<Req, Res\>

> **ListenerCallback**\<`Req`, `Res`\> = (`data`, `session`, `connector`) => `Promise`\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`Res`\> \| `null`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:29](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L29)

## Type Parameters

### Req

`Req` = `unknown`

### Res

`Res` = `unknown`

## Parameters

### data

[`IRawReqPacket`](../interfaces/IRawReqPacket.md)\<`Req`\>

### session

`string` \| `undefined`

### connector

[`Connector`](../classes/Connector.md)

## Returns

`Promise`\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`Res`\> \| `null`\>
