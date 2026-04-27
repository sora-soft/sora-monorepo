[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Scope

# Abstract Class: Scope\<T\>

Defined in: [packages/framework/src/lib/context/Scope.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L7)

## Extended by

- [`LogScope`](LogScope.md)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new Scope**\<`T`\>(`id`, `store`): `Scope`\<`T`\>

Defined in: [packages/framework/src/lib/context/Scope.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L8)

#### Parameters

##### id

`string`

##### store

`T`

#### Returns

`Scope`\<`T`\>

## Properties

### id\_

> `protected` **id\_**: `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L62)

***

### parent\_?

> `protected` `optional` **parent\_?**: `Scope`\<`unknown`\>

Defined in: [packages/framework/src/lib/context/Scope.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L63)

***

### stack\_

> `protected` **stack\_**: `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:65](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L65)

***

### store\_

> `protected` **store\_**: `T`

Defined in: [packages/framework/src/lib/context/Scope.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L64)

## Accessors

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L58)

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): `Scope`\<`unknown`\> \| `undefined`

Defined in: [packages/framework/src/lib/context/Scope.ts:46](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L46)

##### Returns

`Scope`\<`unknown`\> \| `undefined`

#### Set Signature

> **set** **parent**(`value`): `void`

Defined in: [packages/framework/src/lib/context/Scope.ts:50](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L50)

##### Parameters

###### value

`Scope`\<`unknown`\> \| `undefined`

##### Returns

`void`

***

### stack

#### Get Signature

> **get** **stack**(): `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:54](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L54)

##### Returns

`string`

***

### store

#### Get Signature

> **get** **store**(): `T`

Defined in: [packages/framework/src/lib/context/Scope.ts:42](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L42)

##### Returns

`T`

## Methods

### isInChain()

> `protected` **isInChain**(`id`): `boolean`

Defined in: [packages/framework/src/lib/context/Scope.ts:38](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L38)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### run()

> **run**\<`R`\>(`storage`, `callback`): `R`

Defined in: [packages/framework/src/lib/context/Scope.ts:23](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L23)

#### Type Parameters

##### R

`R`

#### Parameters

##### storage

`AsyncLocalStorage`\<`Scope`\<`unknown`\>\>

##### callback

() => `R`

#### Returns

`R`

***

### setStore()

> **setStore**(`data`): `void`

Defined in: [packages/framework/src/lib/context/Scope.ts:34](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L34)

#### Parameters

##### data

`T`

#### Returns

`void`
