[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / LifeRef

# Class: LifeRef\<T\>

Defined in: [packages/framework/src/utility/LifeRef.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L15)

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new LifeRef**\<`T`\>(): `LifeRef`\<`T`\>

Defined in: [packages/framework/src/utility/LifeRef.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L16)

#### Returns

`LifeRef`\<`T`\>

## Accessors

### count

#### Get Signature

> **get** **count**(): `number`

Defined in: [packages/framework/src/utility/LifeRef.ts:59](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L59)

##### Returns

`number`

#### Set Signature

> **set** **count**(`value`): `void`

Defined in: [packages/framework/src/utility/LifeRef.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L63)

##### Parameters

###### value

`number`

##### Returns

`void`

## Methods

### add()

> **add**(`callback`): `Promise`\<`T`\>

Defined in: [packages/framework/src/utility/LifeRef.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L21)

#### Parameters

##### callback

[`RefCallback`](../type-aliases/RefCallback.md)\<`T`\>

#### Returns

`Promise`\<`T`\>

***

### minus()

> **minus**(`callback`): `Promise`\<`T` \| `undefined`\>

Defined in: [packages/framework/src/utility/LifeRef.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L31)

#### Parameters

##### callback

[`RefCallback`](../type-aliases/RefCallback.md)\<`T`\>

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### waitFor()

> **waitFor**(`value`): `Promise`\<`void`\>

Defined in: [packages/framework/src/utility/LifeRef.ts:44](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/LifeRef.ts#L44)

#### Parameters

##### value

`number`

#### Returns

`Promise`\<`void`\>
