[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RPCSender

# Class: RPCSender

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:30](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L30)

## Constructors

### Constructor

> **new RPCSender**(`provider`, `target`, `routeCallback?`): `RPCSender`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L31)

#### Parameters

##### provider

[`Provider`](Provider.md)

##### target

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)

##### routeCallback?

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

#### Returns

`RPCSender`

## Accessors

### connector

#### Get Signature

> **get** **connector**(): [`Connector`](Connector.md)

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:236](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L236)

##### Returns

[`Connector`](Connector.md)

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:242](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L242)

##### Returns

`string`

***

### listenerId

#### Get Signature

> **get** **listenerId**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:246](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L246)

##### Returns

`string`

***

### metaData

#### Get Signature

> **get** **metaData**(): [`ISenderMetaData`](../interfaces/ISenderMetaData.md)

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:258](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L258)

##### Returns

[`ISenderMetaData`](../interfaces/ISenderMetaData.md)

***

### targetId

#### Get Signature

> **get** **targetId**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:250](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L250)

##### Returns

`string`

***

### weight

#### Get Signature

> **get** **weight**(): `number`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:254](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L254)

##### Returns

`number`

## Methods

### addRef()

> **addRef**(): `void`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L64)

#### Returns

`void`

***

### callRpc()

> **callRpc**\<`ResponsePayload`\>(`request`, `timeout?`): `Promise`\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`ResponsePayload`\>\>

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:112](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L112)

#### Type Parameters

##### ResponsePayload

`ResponsePayload`

#### Parameters

##### request

[`Request`](Request.md)

##### timeout?

`number` = `...`

#### Returns

`Promise`\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`ResponsePayload`\>\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:104](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L104)

#### Returns

`Promise`\<`void`\>

***

### getRefCount()

> **getRefCount**(): `number`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:72](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L72)

#### Returns

`number`

***

### handlePacket()

> `protected` **handlePacket**(`data`, `connector`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:229](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L229)

#### Parameters

##### data

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

##### connector

[`Connector`](Connector.md)

#### Returns

`Promise`\<`void`\>

***

### isAvailable()

> **isAvailable**(): `boolean`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:54](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L54)

#### Returns

`boolean`

***

### minusRef()

> **minusRef**(): `void`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:68](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L68)

#### Returns

`void`

***

### setStatus()

> **setStatus**(`value`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:76](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L76)

#### Parameters

##### value

[`RPCSenderStatus`](../enumerations/RPCSenderStatus.md)

#### Returns

`Promise`\<`void`\>

***

### updateTarget()

> **updateTarget**(`target`): `void`

Defined in: [packages/framework/src/lib/rpc/provider/RPCSender.ts:50](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/RPCSender.ts#L50)

#### Parameters

##### target

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)

#### Returns

`void`
