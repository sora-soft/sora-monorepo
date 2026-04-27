[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Trace

# Class: Trace

Defined in: [packages/framework/src/lib/trace/Trace.ts:5](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/Trace.ts#L5)

## Constructors

### Constructor

> **new Trace**(): `Trace`

#### Returns

`Trace`

## Methods

### current()

> `static` **current**(): [`TraceContext`](TraceContext.md) \| `undefined`

Defined in: [packages/framework/src/lib/trace/Trace.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/Trace.ts#L12)

#### Returns

[`TraceContext`](TraceContext.md) \| `undefined`

***

### run()

> `static` **run**\<`R`\>(`context`, `callback`): `R`

Defined in: [packages/framework/src/lib/trace/Trace.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/trace/Trace.ts#L8)

#### Type Parameters

##### R

`R`

#### Parameters

##### context

[`TraceContext`](TraceContext.md)

##### callback

() => `R`

#### Returns

`R`
