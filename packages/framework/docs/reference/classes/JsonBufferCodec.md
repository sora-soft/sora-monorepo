[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / JsonBufferCodec

# Class: JsonBufferCodec

Defined in: [packages/framework/src/lib/codec/JsonBufferCodec.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/codec/JsonBufferCodec.ts#L4)

## Extends

- [`Codec`](Codec.md)\<`Buffer`\>

## Constructors

### Constructor

> **new JsonBufferCodec**(): `JsonBufferCodec`

#### Returns

`JsonBufferCodec`

#### Inherited from

[`Codec`](Codec.md).[`constructor`](Codec.md#constructor)

## Accessors

### code

#### Get Signature

> **get** **code**(): `string`

Defined in: [packages/framework/src/lib/codec/JsonBufferCodec.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/codec/JsonBufferCodec.ts#L9)

##### Returns

`string`

#### Overrides

[`Codec`](Codec.md).[`code`](Codec.md#code)

## Methods

### decode()

> **decode**(`raw`): `Promise`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

Defined in: [packages/framework/src/lib/codec/JsonBufferCodec.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/codec/JsonBufferCodec.ts#L17)

#### Parameters

##### raw

`Buffer`\<`ArrayBufferLike`\>

#### Returns

`Promise`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

#### Overrides

[`Codec`](Codec.md).[`decode`](Codec.md#decode)

***

### encode()

> **encode**(`packet`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [packages/framework/src/lib/codec/JsonBufferCodec.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/codec/JsonBufferCodec.ts#L13)

#### Parameters

##### packet

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

#### Overrides

[`Codec`](Codec.md).[`encode`](Codec.md#encode)

***

### get()

> `static` **get**(`code`): [`Codec`](Codec.md)\<`any`\> \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L8)

#### Parameters

##### code

`string`

#### Returns

[`Codec`](Codec.md)\<`any`\> \| `undefined`

#### Inherited from

[`Codec`](Codec.md).[`get`](Codec.md#get)

***

### has()

> `static` **has**(`code`): `boolean`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L12)

#### Parameters

##### code

`string`

#### Returns

`boolean`

#### Inherited from

[`Codec`](Codec.md).[`has`](Codec.md#has)

***

### register()

> `static` **register**(`codec`): `void`

Defined in: [packages/framework/src/lib/rpc/Codec.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Codec.ts#L4)

#### Parameters

##### codec

[`Codec`](Codec.md)\<`any`\>

#### Returns

`void`

#### Inherited from

[`Codec`](Codec.md).[`register`](Codec.md#register)
