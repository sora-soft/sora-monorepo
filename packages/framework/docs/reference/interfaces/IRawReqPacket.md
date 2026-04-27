[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / IRawReqPacket

# Interface: IRawReqPacket\<T\>

Defined in: [packages/framework/src/interface/rpc.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L15)

## Type Parameters

### T

`T` = `unknown`

## Properties

### headers

> **headers**: `object`

Defined in: [packages/framework/src/interface/rpc.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L19)

#### Index Signature

\[`key`: `string`\]: `string`

***

### method

> **method**: `string`

Defined in: [packages/framework/src/interface/rpc.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L17)

***

### opcode

> **opcode**: [`Request`](../enumerations/OPCode.md#request) \| [`Notify`](../enumerations/OPCode.md#notify)

Defined in: [packages/framework/src/interface/rpc.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L16)

***

### payload

> **payload**: `T`

Defined in: [packages/framework/src/interface/rpc.ts:22](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L22)

***

### service

> **service**: `string`

Defined in: [packages/framework/src/interface/rpc.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/rpc.ts#L18)
