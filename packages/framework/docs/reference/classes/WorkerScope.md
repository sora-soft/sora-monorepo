[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / WorkerScope

# Class: WorkerScope

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L8)

## Extends

- [`LogScope`](LogScope.md)\<[`IWorkerScopeStore`](../interfaces/IWorkerScopeStore.md)\>

## Constructors

### Constructor

> **new WorkerScope**(`store`): `WorkerScope`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L9)

#### Parameters

##### store

[`IWorkerScopeStore`](../interfaces/IWorkerScopeStore.md)

#### Returns

`WorkerScope`

#### Overrides

[`LogScope`](LogScope.md).[`constructor`](LogScope.md#constructor)

## Properties

### id\_

> `protected` **id\_**: `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L62)

#### Inherited from

[`LogScope`](LogScope.md).[`id_`](LogScope.md#id_)

***

### parent\_?

> `protected` `optional` **parent\_?**: [`Scope`](Scope.md)\<`unknown`\>

Defined in: [packages/framework/src/lib/context/Scope.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L63)

#### Inherited from

[`LogScope`](LogScope.md).[`parent_`](LogScope.md#parent_)

***

### stack\_

> `protected` **stack\_**: `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:65](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L65)

#### Inherited from

[`LogScope`](LogScope.md).[`stack_`](LogScope.md#stack_)

***

### store\_

> `protected` **store\_**: [`IWorkerScopeStore`](../interfaces/IWorkerScopeStore.md)

Defined in: [packages/framework/src/lib/context/Scope.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L64)

#### Inherited from

[`LogScope`](LogScope.md).[`store_`](LogScope.md#store_)

## Accessors

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L58)

##### Returns

`string`

#### Inherited from

[`LogScope`](LogScope.md).[`id`](LogScope.md#id)

***

### logCategory

#### Get Signature

> **get** **logCategory**(): `string`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:29](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L29)

##### Returns

`string`

#### Overrides

[`LogScope`](LogScope.md).[`logCategory`](LogScope.md#logcategory)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L21)

##### Returns

`string`

***

### parent

#### Get Signature

> **get** **parent**(): [`Scope`](Scope.md)\<`unknown`\> \| `undefined`

Defined in: [packages/framework/src/lib/context/Scope.ts:46](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L46)

##### Returns

[`Scope`](Scope.md)\<`unknown`\> \| `undefined`

#### Set Signature

> **set** **parent**(`value`): `void`

Defined in: [packages/framework/src/lib/context/Scope.ts:50](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L50)

##### Parameters

###### value

[`Scope`](Scope.md)\<`unknown`\> \| `undefined`

##### Returns

`void`

#### Inherited from

[`LogScope`](LogScope.md).[`parent`](LogScope.md#parent)

***

### stack

#### Get Signature

> **get** **stack**(): `string`

Defined in: [packages/framework/src/lib/context/Scope.ts:54](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L54)

##### Returns

`string`

#### Inherited from

[`LogScope`](LogScope.md).[`stack`](LogScope.md#stack)

***

### store

#### Get Signature

> **get** **store**(): `T`

Defined in: [packages/framework/src/lib/context/Scope.ts:42](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L42)

##### Returns

`T`

#### Inherited from

[`LogScope`](LogScope.md).[`store`](LogScope.md#store)

***

### workerId

#### Get Signature

> **get** **workerId**(): `string`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L25)

##### Returns

`string`

## Methods

### hasComponent()

> **hasComponent**(`id`): `boolean`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L17)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### hasProvider()

> **hasProvider**(`id`): `boolean`

Defined in: [packages/framework/src/lib/context/scope/WorkerScope.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/scope/WorkerScope.ts#L13)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### isInChain()

> `protected` **isInChain**(`id`): `boolean`

Defined in: [packages/framework/src/lib/context/Scope.ts:38](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L38)

#### Parameters

##### id

`string`

#### Returns

`boolean`

#### Inherited from

[`LogScope`](LogScope.md).[`isInChain`](LogScope.md#isinchain)

***

### run()

> **run**\<`R`\>(`storage`, `callback`): `R`

Defined in: [packages/framework/src/lib/context/Scope.ts:23](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L23)

#### Type Parameters

##### R

`R`

#### Parameters

##### storage

`AsyncLocalStorage`\<[`Scope`](Scope.md)\<`unknown`\>\>

##### callback

() => `R`

#### Returns

`R`

#### Inherited from

[`LogScope`](LogScope.md).[`run`](LogScope.md#run)

***

### setStore()

> **setStore**(`data`): `void`

Defined in: [packages/framework/src/lib/context/Scope.ts:34](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Scope.ts#L34)

#### Parameters

##### data

[`IWorkerScopeStore`](../interfaces/IWorkerScopeStore.md)

#### Returns

`void`

#### Inherited from

[`LogScope`](LogScope.md).[`setStore`](LogScope.md#setstore)
