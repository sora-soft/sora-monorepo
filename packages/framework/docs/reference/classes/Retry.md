[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Retry

# Class: Retry\<T\>

Defined in: [packages/framework/src/utility/Retry.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Retry.ts#L45)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new Retry**\<`T`\>(`executor`, `options?`): `Retry`\<`T`\>

Defined in: [packages/framework/src/utility/Retry.ts:46](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Retry.ts#L46)

#### Parameters

##### executor

[`RetryExecutor`](../type-aliases/RetryExecutor.md)\<`T`\>

##### options?

[`IRetryOptions`](../type-aliases/IRetryOptions.md) = `defaultRetryOptions`

#### Returns

`Retry`\<`T`\>

## Accessors

### errorEmitter

#### Get Signature

> **get** **errorEmitter**(): [`IEventEmitter`](../interfaces/IEventEmitter.md)\<`IErrorEvent`\>

Defined in: [packages/framework/src/utility/Retry.ts:89](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Retry.ts#L89)

##### Returns

[`IEventEmitter`](../interfaces/IEventEmitter.md)\<`IErrorEvent`\>

## Methods

### doJob()

> **doJob**(): `Promise`\<`T`\>

Defined in: [packages/framework/src/utility/Retry.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Retry.ts#L62)

#### Returns

`Promise`\<`T`\>
