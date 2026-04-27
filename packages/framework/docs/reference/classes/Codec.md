[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Codec

# Abstract Class: Codec\<T\>

Defined in: [packages/framework/src/lib/rpc/Codec.ts:3](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L3)

## Extended by

- [`JsonBufferCodec`](JsonBufferCodec.md)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new Codec**\<`T`\>(): `Codec`\<`T`\>

#### Returns

`Codec`\<`T`\>

## Accessors

### code

#### Get Signature

> **get** `abstract` **code**(): `string`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L18)

##### Returns

`string`

## Methods

### decode()

> `abstract` **decode**(`raw`): `Promise`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

Defined in: [packages/framework/src/lib/rpc/Codec.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L20)

#### Parameters

##### raw

`T`

#### Returns

`Promise`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

***

### encode()

> `abstract` **encode**(`packet`): `Promise`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/Codec.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L21)

#### Parameters

##### packet

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

#### Returns

`Promise`\<`T`\>

***

### get()

> `static` **get**(`code`): `Codec`\<`any`\> \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L8)

#### Parameters

##### code

`string`

#### Returns

`Codec`\<`any`\> \| `undefined`

***

### has()

> `static` **has**(`code`): `boolean`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L12)

#### Parameters

##### code

`string`

#### Returns

`boolean`

***

### register()

> `static` **register**(`codec`): `void`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L4)

#### Parameters

##### codec

`Codec`\<`any`\>

#### Returns

`void`
