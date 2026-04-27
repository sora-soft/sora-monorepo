[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / PacketHandler

# Class: PacketHandler

Defined in: [packages/framework/src/lib/rpc/PacketHandler.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/PacketHandler.ts#L21)

## Constructors

### Constructor

> **new PacketHandler**(): `PacketHandler`

#### Returns

`PacketHandler`

## Methods

### handleNetPacket()

> `static` **handleNetPacket**(`data`, `connector`, `callback?`, `responseWaiter?`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/PacketHandler.ts:22](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/PacketHandler.ts#L22)

#### Parameters

##### data

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

##### connector

[`Connector`](Connector.md)

##### callback?

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

##### responseWaiter?

[`Waiter`](Waiter.md)\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`unknown`\>\>

#### Returns

`Promise`\<`void`\>
