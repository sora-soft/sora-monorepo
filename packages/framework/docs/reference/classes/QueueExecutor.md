[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / QueueExecutor

# Class: QueueExecutor\<S\>

Defined in: [packages/framework/src/utility/QueueExecutor.ts:14](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L14)

## Extends

- [`Executor`](Executor.md)\<`S`\>

## Type Parameters

### S

`S` *extends* [`Scope`](Scope.md)\<`unknown`\> = [`Scope`](Scope.md)\<`unknown`\>

## Constructors

### Constructor

> **new QueueExecutor**\<`S`\>(`scope?`): `QueueExecutor`\<`S`\>

Defined in: [packages/framework/src/utility/Executor.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L8)

#### Parameters

##### scope?

`S`

#### Returns

`QueueExecutor`\<`S`\>

#### Inherited from

[`Executor`](Executor.md).[`constructor`](Executor.md#constructor)

## Properties

### isStopped\_

> `protected` **isStopped\_**: `boolean` = `true`

Defined in: [packages/framework/src/utility/Executor.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L53)

#### Inherited from

[`Executor`](Executor.md).[`isStopped_`](Executor.md#isstopped_)

## Accessors

### isIdle

#### Get Signature

> **get** **isIdle**(): `boolean`

Defined in: [packages/framework/src/utility/QueueExecutor.ts:67](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L67)

##### Returns

`boolean`

#### Overrides

[`Executor`](Executor.md).[`isIdle`](Executor.md#isidle)

## Methods

### doJob()

> **doJob**\<`T`\>(`executor`): `Promise`\<`T` \| `undefined`\>

Defined in: [packages/framework/src/utility/QueueExecutor.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L15)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### executor

[`JobExecutor`](../type-aliases/JobExecutor.md)\<`T`\>

#### Returns

`Promise`\<`T` \| `undefined`\>

#### Overrides

[`Executor`](Executor.md).[`doJob`](Executor.md#dojob)

***

### runInContext()

> `protected` **runInContext**\<`T`\>(`callback`): `Promise`\<`T`\>

Defined in: [packages/framework/src/utility/Executor.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L45)

#### Type Parameters

##### T

`T`

#### Parameters

##### callback

() => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

#### Inherited from

[`Executor`](Executor.md).[`runInContext`](Executor.md#runincontext)

***

### start()

> **start**(): `void`

Defined in: [packages/framework/src/utility/Executor.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L31)

#### Returns

`void`

#### Inherited from

[`Executor`](Executor.md).[`start`](Executor.md#start)

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/utility/QueueExecutor.ts:30](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/QueueExecutor.ts#L30)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Executor`](Executor.md).[`stop`](Executor.md#stop)
