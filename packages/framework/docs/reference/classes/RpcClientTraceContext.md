[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RpcClientTraceContext

# Class: RpcClientTraceContext

Defined in: [packages/framework/src/lib/trace/context/RpcClientTraceContext.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/context/RpcClientTraceContext.ts#L4)

## Extends

- [`TraceContext`](TraceContext.md)

## Constructors

### Constructor

> **new RpcClientTraceContext**(`traceId?`, `parentSpanId?`, `flags?`, `traceState?`): `RpcClientTraceContext`

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

`RpcClientTraceContext`

#### Inherited from

[`TraceContext`](TraceContext.md).[`constructor`](TraceContext.md#constructor)

## Properties

### endChannel

> `static` **endChannel**: `Channel`\<`unknown`, `unknown`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:109](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L109)

#### Inherited from

[`TraceContext`](TraceContext.md).[`endChannel`](TraceContext.md#endchannel)

***

### startChannel

> `static` **startChannel**: `Channel`\<`unknown`, `unknown`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L108)

#### Inherited from

[`TraceContext`](TraceContext.md).[`startChannel`](TraceContext.md#startchannel)

## Accessors

### attribute

#### Get Signature

> **get** **attribute**(): `Map`\<`string`, `string`\>

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:226](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L226)

##### Returns

`Map`\<`string`, `string`\>

#### Inherited from

[`TraceContext`](TraceContext.md).[`attribute`](TraceContext.md#attribute)

***

### endNanoTime

#### Get Signature

> **get** **endNanoTime**(): `bigint`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:218](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L218)

##### Returns

`bigint`

#### Inherited from

[`TraceContext`](TraceContext.md).[`endNanoTime`](TraceContext.md#endnanotime)

***

### error

#### Get Signature

> **get** **error**(): [`ExError`](ExError.md) \| `undefined`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:222](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L222)

##### Returns

[`ExError`](ExError.md) \| `undefined`

#### Inherited from

[`TraceContext`](TraceContext.md).[`error`](TraceContext.md#error)

***

### finished

#### Get Signature

> **get** **finished**(): `boolean`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:206](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L206)

##### Returns

`boolean`

#### Inherited from

[`TraceContext`](TraceContext.md).[`finished`](TraceContext.md#finished)

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

#### Inherited from

[`TraceContext`](TraceContext.md).[`flags`](TraceContext.md#flags)

***

### parentSpanId

#### Get Signature

> **get** **parentSpanId**(): `string` \| `undefined`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:194](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L194)

##### Returns

`string` \| `undefined`

#### Inherited from

[`TraceContext`](TraceContext.md).[`parentSpanId`](TraceContext.md#parentspanid)

***

### spanId

#### Get Signature

> **get** **spanId**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:190](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L190)

##### Returns

`string`

#### Inherited from

[`TraceContext`](TraceContext.md).[`spanId`](TraceContext.md#spanid)

***

### startNanoTime

#### Get Signature

> **get** **startNanoTime**(): `bigint`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:214](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L214)

##### Returns

`bigint`

#### Inherited from

[`TraceContext`](TraceContext.md).[`startNanoTime`](TraceContext.md#startnanotime)

***

### traceId

#### Get Signature

> **get** **traceId**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:186](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L186)

##### Returns

`string`

#### Inherited from

[`TraceContext`](TraceContext.md).[`traceId`](TraceContext.md#traceid)

***

### traceState

#### Get Signature

> **get** **traceState**(): [`TraceState`](TraceState.md)

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:210](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L210)

##### Returns

[`TraceState`](TraceState.md)

#### Inherited from

[`TraceContext`](TraceContext.md).[`traceState`](TraceContext.md#tracestate)

## Methods

### run()

> **run**\<`R`\>(`storage`, `callback`): `R`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:141](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L141)

#### Type Parameters

##### R

`R`

#### Parameters

##### storage

`AsyncLocalStorage`\<[`TraceContext`](TraceContext.md)\>

##### callback

() => `R`

#### Returns

`R`

#### Inherited from

[`TraceContext`](TraceContext.md).[`run`](TraceContext.md#run)

***

### toRPCTraceParentHeader()

> **toRPCTraceParentHeader**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:133](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L133)

#### Returns

`string`

#### Inherited from

[`TraceContext`](TraceContext.md).[`toRPCTraceParentHeader`](TraceContext.md#torpctraceparentheader)

***

### toRPCTraceStateHeader()

> **toRPCTraceStateHeader**(): `string`

Defined in: [packages/framework/src/lib/trace/TraceContext.ts:137](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/TraceContext.ts#L137)

#### Returns

`string`

#### Inherited from

[`TraceContext`](TraceContext.md).[`toRPCTraceStateHeader`](TraceContext.md#torpctracestateheader)

***

### create()

> `static` **create**(): `RpcClientTraceContext`

Defined in: [packages/framework/src/lib/trace/context/RpcClientTraceContext.ts:5](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/context/RpcClientTraceContext.ts#L5)

#### Returns

`RpcClientTraceContext`
