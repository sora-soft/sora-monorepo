[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Waiter

# Class: Waiter\<T\>

Defined in: [packages/framework/src/utility/Waiter.ts:3](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L3)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new Waiter**\<`T`\>(): `Waiter`\<`T`\>

Defined in: [packages/framework/src/utility/Waiter.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L4)

#### Returns

`Waiter`\<`T`\>

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/framework/src/utility/Waiter.ts:66](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L66)

#### Returns

`void`

***

### emit()

> **emit**(`id`, `result`): `void`

Defined in: [packages/framework/src/utility/Waiter.ts:37](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L37)

#### Parameters

##### id

`number`

##### result

`T`

#### Returns

`void`

***

### emitError()

> **emitError**(`id`, `error`): `void`

Defined in: [packages/framework/src/utility/Waiter.ts:55](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L55)

#### Parameters

##### id

`number`

##### error

`Error`

#### Returns

`void`

***

### wait()

> **wait**(`ttlMs?`): `object`

Defined in: [packages/framework/src/utility/Waiter.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L9)

#### Parameters

##### ttlMs?

`number`

#### Returns

`object`

##### id

> **id**: `number`

##### promise

> **promise**: `Promise`\<`T`\>

***

### waitForAll()

> **waitForAll**(`ttlMS?`): `Promise`\<`void`\>

Defined in: [packages/framework/src/utility/Waiter.ts:75](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Waiter.ts#L75)

#### Parameters

##### ttlMS?

`number`

#### Returns

`Promise`\<`void`\>
