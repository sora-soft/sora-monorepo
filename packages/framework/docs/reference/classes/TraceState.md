[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / TraceState

# Class: TraceState

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:48](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L48)

## Constructors

### Constructor

> **new TraceState**(`headerValue?`): `TraceState`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L53)

#### Parameters

##### headerValue?

`string`

#### Returns

`TraceState`

## Methods

### get()

> **get**(`key`): `string` \| `undefined`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:80](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L80)

#### Parameters

##### key

`string`

#### Returns

`string` \| `undefined`

***

### isEmpty()

> **isEmpty**(): `boolean`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:102](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L102)

#### Returns

`boolean`

***

### remove()

> **remove**(`key`): `void`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:95](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L95)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### serialize()

> **serialize**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:76](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L76)

#### Returns

`string`

***

### set()

> **set**(`key`, `value`): `void`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:85](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L85)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`
