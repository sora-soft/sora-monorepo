[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Notify

# Class: Notify\<T\>

Defined in: [packages/framework/src/lib/rpc/packet/Notify.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Notify.ts#L6)

## Extends

- [`RawPacket`](RawPacket.md)\<`T`\>

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new Notify**\<`T`\>(`packet`): `Notify`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/packet/Notify.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Notify.ts#L7)

#### Parameters

##### packet

`Omit`\<[`IRawReqPacket`](../interfaces/IRawReqPacket.md)\<`T`\>, `"opcode"`\>

#### Returns

`Notify`\<`T`\>

#### Overrides

[`RawPacket`](RawPacket.md).[`constructor`](RawPacket.md#constructor)

## Properties

### headers\_

> `protected` **headers\_**: `Map`\<`string`, `string`\>

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:49](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L49)

#### Inherited from

[`RawPacket`](RawPacket.md).[`headers_`](RawPacket.md#headers_)

## Accessors

### headers

#### Get Signature

> **get** **headers**(): `object`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L45)

##### Returns

`object`

#### Inherited from

[`RawPacket`](RawPacket.md).[`headers`](RawPacket.md#headers)

***

### method

#### Get Signature

> **get** **method**(): `string`

Defined in: [packages/framework/src/lib/rpc/packet/Notify.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Notify.ts#L25)

##### Returns

`string`

***

### opCode

#### Get Signature

> **get** **opCode**(): [`OPCode`](../enumerations/OPCode.md)

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L32)

##### Returns

[`OPCode`](../enumerations/OPCode.md)

#### Inherited from

[`RawPacket`](RawPacket.md).[`opCode`](RawPacket.md#opcode)

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

#### Inherited from

[`RawPacket`](RawPacket.md).[`payload`](RawPacket.md#payload)

***

### service

#### Get Signature

> **get** **service**(): `string`

Defined in: [packages/framework/src/lib/rpc/packet/Notify.ts:29](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Notify.ts#L29)

##### Returns

`string`

## Methods

### getHeader()

> **getHeader**(`header`): `string` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L12)

#### Parameters

##### header

`string`

#### Returns

`string` \| `undefined`

#### Inherited from

[`RawPacket`](RawPacket.md).[`getHeader`](RawPacket.md#getheader)

***

### loadHeaders()

> **loadHeaders**(`headers`): `void`

Defined in: [packages/framework/src/lib/rpc/packet/RawPacket.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/RawPacket.ts#L16)

#### Parameters

##### headers

#### Returns

`void`

#### Inherited from

[`RawPacket`](RawPacket.md).[`loadHeaders`](RawPacket.md#loadheaders)

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

#### Inherited from

[`RawPacket`](RawPacket.md).[`setHeader`](RawPacket.md#setheader)

***

### toPacket()

> **toPacket**(): [`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/packet/Notify.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Notify.ts#L15)

#### Returns

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\<`T`\>

#### Overrides

[`RawPacket`](RawPacket.md).[`toPacket`](RawPacket.md#topacket)
