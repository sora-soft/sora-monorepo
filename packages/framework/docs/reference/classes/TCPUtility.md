[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / TCPUtility

# Class: TCPUtility

Defined in: [packages/framework/src/lib/tcp/TCPUtility.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPUtility.ts#L7)

## Constructors

### Constructor

> **new TCPUtility**(): `TCPUtility`

#### Returns

`TCPUtility`

## Methods

### decodeMessage()

> `static` **decodeMessage**(`buffer`): `Promise`\<`NonSharedBuffer`\>

Defined in: [packages/framework/src/lib/tcp/TCPUtility.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPUtility.ts#L19)

#### Parameters

##### buffer

`Buffer`

#### Returns

`Promise`\<`NonSharedBuffer`\>

***

### encodeMessage()

> `static` **encodeMessage**(`data`): `Promise`\<`Buffer`\<`ArrayBuffer`\>\>

Defined in: [packages/framework/src/lib/tcp/TCPUtility.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPUtility.ts#L8)

#### Parameters

##### data

`Buffer`

#### Returns

`Promise`\<`Buffer`\<`ArrayBuffer`\>\>
