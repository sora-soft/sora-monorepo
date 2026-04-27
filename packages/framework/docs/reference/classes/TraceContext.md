[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / TraceContext

# Abstract Class: TraceContext

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:107](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L107)

## Extended by

- [`InnerTraceContext`](InnerTraceContext.md)
- [`RpcClientTraceContext`](RpcClientTraceContext.md)
- [`RpcServerTraceContext`](RpcServerTraceContext.md)

## Constructors

### Constructor

> **new TraceContext**(`traceId?`, `parentSpanId?`, `flags?`, `traceState?`): `TraceContext`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:111](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L111)

#### Parameters

##### traceId?

`string`

##### parentSpanId?

`string`

##### flags?

`number`

##### traceState?

`string`

#### Returns

`TraceContext`

## Properties

### endChannel

> `static` **endChannel**: `Channel`\<`unknown`, `unknown`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:109](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L109)

***

### startChannel

> `static` **startChannel**: `Channel`\<`unknown`, `unknown`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L108)

## Accessors

### attribute

#### Get Signature

> **get** **attribute**(): `Map`\<`string`, `string`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:226](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L226)

##### Returns

`Map`\<`string`, `string`\>

***

### endNanoTime

#### Get Signature

> **get** **endNanoTime**(): `bigint`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:218](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L218)

##### Returns

`bigint`

***

### error

#### Get Signature

> **get** **error**(): [`ExError`](ExError.md) \| `undefined`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:222](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L222)

##### Returns

[`ExError`](ExError.md) \| `undefined`

***

### finished

#### Get Signature

> **get** **finished**(): `boolean`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:206](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L206)

##### Returns

`boolean`

***

### flags

#### Get Signature

> **get** **flags**(): [`TraceFlag`](../enumerations/TraceFlag.md)

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:198](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L198)

##### Returns

[`TraceFlag`](../enumerations/TraceFlag.md)

#### Set Signature

> **set** **flags**(`value`): `void`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:202](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L202)

##### Parameters

###### value

[`TraceFlag`](../enumerations/TraceFlag.md)

##### Returns

`void`

***

### parentSpanId

#### Get Signature

> **get** **parentSpanId**(): `string` \| `undefined`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:194](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L194)

##### Returns

`string` \| `undefined`

***

### spanId

#### Get Signature

> **get** **spanId**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:190](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L190)

##### Returns

`string`

***

### startNanoTime

#### Get Signature

> **get** **startNanoTime**(): `bigint`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:214](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L214)

##### Returns

`bigint`

***

### traceId

#### Get Signature

> **get** **traceId**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:186](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L186)

##### Returns

`string`

***

### traceState

#### Get Signature

> **get** **traceState**(): [`TraceState`](TraceState.md)

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:210](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L210)

##### Returns

[`TraceState`](TraceState.md)

## Methods

### run()

> **run**\<`R`\>(`storage`, `callback`): `R`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:141](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L141)

#### Type Parameters

##### R

`R`

#### Parameters

##### storage

`AsyncLocalStorage`\<`TraceContext`\>

##### callback

() => `R`

#### Returns

`R`

***

### toRPCTraceParentHeader()

> **toRPCTraceParentHeader**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:133](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L133)

#### Returns

`string`

***

### toRPCTraceStateHeader()

> **toRPCTraceStateHeader**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:137](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L137)

#### Returns

`string`
