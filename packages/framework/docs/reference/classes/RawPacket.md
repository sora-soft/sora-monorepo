[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RawPacket

# Abstract Class: RawPacket\<T\>

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:5](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L5)

## Extended by

- [`Notify`](Notify.md)
- [`Request`](Request.md)
- [`Response`](Response.md)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new RawPacket**\<`T`\>(`opCode`, `data`): `RawPacket`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L6)

#### Parameters

##### opCode

[`OPCode`](../enumerations/OPCode.md)

##### data

`Omit`\<[`IRawReqPacket`](../interfaces/IRawReqPacket.md)\<`T`\> \| [`IRawResPacket`](../interfaces/IRawResPacket.md)\<`T`\>, `"opcode"`\>

#### Returns

`RawPacket`\<`T`\>

## Properties

### headers\_

> `protected` **headers\_**: `Map`\<`string`, `string`\>

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:49](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L49)

## Accessors

### headers

#### Get Signature

> **get** **headers**(): `object`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L45)

##### Returns

`object`

***

### opCode

#### Get Signature

> **get** **opCode**(): [`OPCode`](../enumerations/OPCode.md)

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L32)

##### Returns

[`OPCode`](../enumerations/OPCode.md)

***

### payload

#### Get Signature

> **get** **payload**(): `T`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:37](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L37)

##### Returns

`T`

#### Set Signature

> **set** **payload**(`value`): `void`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:41](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L41)

##### Parameters

###### value

`T`

##### Returns

`void`

## Methods

### getHeader()

> **getHeader**(`header`): `string` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L12)

#### Parameters

##### header

`string`

#### Returns

`string` \| `undefined`

***

### loadHeaders()

> **loadHeaders**(`headers`): `void`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L16)

#### Parameters

##### headers

#### Returns

`void`

***

### setHeader()

> **setHeader**(`header`, `value?`): `void`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L24)

#### Parameters

##### header

`string`

##### value?

`string`

#### Returns

`void`

***

### toPacket()

> `abstract` **toPacket**(): [`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:30](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L30)

#### Returns

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\<`T`\>
