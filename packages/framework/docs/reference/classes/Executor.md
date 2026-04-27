[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Executor

# Class: Executor\<S\>

Defined in: [packages/framework/src/utility/Executor.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L7)

## Extended by

- [`QueueExecutor`](QueueExecutor.md)

## Type Parameters

### S

`S` *extends* [`Scope`](Scope.md)\<`unknown`\> = [`Scope`](Scope.md)\<`unknown`\>

## Constructors

### Constructor

> **new Executor**\<`S`\>(`scope?`): `Executor`\<`S`\>

Defined in: [packages/framework/src/utility/Executor.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L8)

#### Parameters

##### scope?

`S`

#### Returns

`Executor`\<`S`\>

## Properties

### isStopped\_

> `protected` **isStopped\_**: `boolean` = `true`

Defined in: [packages/framework/src/utility/Executor.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L53)

## Accessors

### isIdle

#### Get Signature

> **get** **isIdle**(): `boolean`

Defined in: [packages/framework/src/utility/Executor.ts:41](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L41)

##### Returns

`boolean`

## Methods

### doJob()

> **doJob**\<`T`\>(`executor`): `Promise`\<`T` \| `undefined`\>

Defined in: [packages/framework/src/utility/Executor.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L12)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### executor

[`JobExecutor`](../type-aliases/JobExecutor.md)\<`T`\>

#### Returns

`Promise`\<`T` \| `undefined`\>

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

***

### start()

> **start**(): `void`

Defined in: [packages/framework/src/utility/Executor.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L31)

#### Returns

`void`

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/utility/Executor.ts:35](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Executor.ts#L35)

#### Returns

`Promise`\<`void`\>
