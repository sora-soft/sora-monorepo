[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / LifeCycle

# Class: LifeCycle\<T\>

Defined in: [packages/framework/src/utility/LifeCycle.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L13)

## Type Parameters

### T

`T` *extends* `number`

## Constructors

### Constructor

> **new LifeCycle**\<`T`\>(`state`, `backTrackable?`): `LifeCycle`\<`T`\>

Defined in: [packages/framework/src/utility/LifeCycle.ts:14](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L14)

#### Parameters

##### state

`T`

##### backTrackable?

`boolean` = `true`

#### Returns

`LifeCycle`\<`T`\>

## Accessors

### state

#### Get Signature

> **get** **state**(): `T`

Defined in: [packages/framework/src/utility/LifeCycle.ts:52](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L52)

##### Returns

`T`

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<`T`\>

Defined in: [packages/framework/src/utility/LifeCycle.ts:59](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L59)

##### Returns

`BehaviorSubject`\<`T`\>

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [packages/framework/src/utility/LifeCycle.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L31)

#### Returns

`void`

***

### setState()

> **setState**(`state`): `void`

Defined in: [packages/framework/src/utility/LifeCycle.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L20)

#### Parameters

##### state

`T`

#### Returns

`void`

***

### waitFor()

> **waitFor**(`state`, `ttlMs`): `Promise`\<`void`\>

Defined in: [packages/framework/src/utility/LifeCycle.ts:35](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeCycle.ts#L35)

#### Parameters

##### state

`T`

##### ttlMs

`number`

#### Returns

`Promise`\<`void`\>
