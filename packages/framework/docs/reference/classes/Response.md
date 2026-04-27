[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Response

# Class: Response\<T\>

Defined in: [packages/framework/src/lib/rpc/packet/Response.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Response.ts#L6)

## Extends

- [`RawPacket`](RawPacket.md)\<[`IResPayloadPacket`](../interfaces/IResPayloadPacket.md)\<`T`\>\>

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new Response**\<`T`\>(`packet`): `Response`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/packet/Response.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Response.ts#L7)

#### Parameters

##### packet

`Omit`\<[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`T`\>, `"opcode"`\>

#### Returns

`Response`\<`T`\>

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

> **toPacket**(): [`IRawResPacket`](../interfaces/IRawResPacket.md)\<`unknown`\>

Defined in: [packages/framework/src/lib/rpc/packet/Response.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Response.ts#L15)

#### Returns

[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`unknown`\>

#### Overrides

[`RawPacket`](RawPacket.md).[`toPacket`](RawPacket.md#topacket)

***

### toResult()

> **toResult**(): `NonNullable`\<`T`\> \| `undefined`

Defined in: [packages/framework/src/lib/rpc/packet/Response.ts:23](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/packet/Response.ts#L23)

#### Returns

`NonNullable`\<`T`\> \| `undefined`
