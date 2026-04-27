[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / IRawResPacket

# Interface: IRawResPacket\<T\>

Defined in: [packages/framework/src/interface/rpc.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L31)

## Type Parameters

### T

`T` = `unknown`

## Properties

### headers

> **headers**: `object`

Defined in: [packages/framework/src/interface/rpc.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L33)

#### Index Signature

\[`key`: `string`\]: `string`

***

### opcode

> **opcode**: [`Response`](../enumerations/OPCode.md#response)

Defined in: [packages/framework/src/interface/rpc.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L32)

***

### payload

> **payload**: [`IResPayloadPacket`](IResPayloadPacket.md)\<`T`\>

Defined in: [packages/framework/src/interface/rpc.ts:36](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L36)
