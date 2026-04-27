[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Broadcaster

# Class: Broadcaster\<T\>

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L12)

## Type Parameters

### T

`T` *extends* [`Route`](Route.md)

## Constructors

### Constructor

> **new Broadcaster**\<`T`\>(): `Broadcaster`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L13)

#### Returns

`Broadcaster`\<`T`\>

## Methods

### notify()

> **notify**(`fromId?`, `toSession?`): [`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:71](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L71)

#### Parameters

##### fromId?

`string`

##### toSession?

`string`[]

#### Returns

[`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

***

### registerConnector()

> **registerConnector**(`method`, `connector`): `void`

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L18)

#### Parameters

##### method

keyof `T`

##### connector

[`Connector`](Connector.md)

#### Returns

`void`

***

### removeConnector()

> **removeConnector**(`session`): `void`

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:47](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L47)

#### Parameters

##### session

`string`

#### Returns

`void`

***

### unregisterConnector()

> **unregisterConnector**(`method`, `session`): `void`

Defined in: [packages/framework/src/lib/rpc/Broadcaster.ts:56](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Broadcaster.ts#L56)

#### Parameters

##### method

`string`

##### session

`string`

#### Returns

`void`
