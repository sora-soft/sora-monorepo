[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / IQueueExecutorInfo

# Interface: IQueueExecutorInfo\<T\>

Defined in: [packages/framework/src/utility/QueueExecutor.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L8)

## Type Parameters

### T

`T`

## Properties

### executor

> **executor**: [`JobExecutor`](../type-aliases/JobExecutor.md)

Defined in: [packages/framework/src/utility/QueueExecutor.ts:11](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L11)

***

### reject

> **reject**: (`err`) => `void`

Defined in: [packages/framework/src/utility/QueueExecutor.ts:10](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L10)

#### Parameters

##### err

`Error`

#### Returns

`void`

***

### resolve

> **resolve**: [`PromiseResolver`](../type-aliases/PromiseResolver.md)\<`T`\>

Defined in: [packages/framework/src/utility/QueueExecutor.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L9)
