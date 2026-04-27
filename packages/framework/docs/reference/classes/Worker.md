[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Worker

# Abstract Class: Worker

Defined in: [packages/framework/src/lib/Worker.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L21)

## Extended by

- [`Service`](Service.md)
- [`SingletonWorker`](SingletonWorker.md)

## Constructors

### Constructor

> **new Worker**(`name`, `options`): `Worker`

Defined in: [packages/framework/src/lib/Worker.ts:22](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L22)

#### Parameters

##### name

`string`

##### options

[`IWorkerOptions`](../interfaces/IWorkerOptions.md)

#### Returns

`Worker`

## Properties

### executor\_

> `protected` **executor\_**: [`Executor`](Executor.md)

Defined in: [packages/framework/src/lib/Worker.ts:207](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L207)

***

### intervalJobTimer\_

> `protected` **intervalJobTimer\_**: [`Timer`](Timer.md)

Defined in: [packages/framework/src/lib/Worker.ts:208](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L208)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:206](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L206)

***

### options\_

> `protected` **options\_**: [`IWorkerOptions`](../interfaces/IWorkerOptions.md)

Defined in: [packages/framework/src/lib/Worker.ts:210](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L210)

***

### scope\_

> `protected` **scope\_**: [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:211](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L211)

***

### startTime\_

> `protected` **startTime\_**: `number`

Defined in: [packages/framework/src/lib/Worker.ts:209](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L209)

## Accessors

### executor

#### Get Signature

> **get** **executor**(): [`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

Defined in: [packages/framework/src/lib/Worker.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L187)

##### Returns

[`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:183](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L183)

##### Returns

`string`

***

### isIdle

#### Get Signature

> **get** **isIdle**(): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:171](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L171)

##### Returns

`boolean`

***

### lifeCycle

#### Get Signature

> **get** **lifeCycle**(): [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:179](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L179)

##### Returns

[`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

***

### metaData

#### Get Signature

> **get** **metaData**(): [`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)

Defined in: [packages/framework/src/lib/Worker.ts:195](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L195)

##### Returns

[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:163](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L163)

##### Returns

`string`

***

### scope

#### Get Signature

> **get** **scope**(): [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:191](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L191)

##### Returns

[`WorkerScope`](WorkerScope.md)

***

### state

#### Get Signature

> **get** **state**(): [`WorkerState`](../enumerations/WorkerState.md)

Defined in: [packages/framework/src/lib/Worker.ts:167](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L167)

##### Returns

[`WorkerState`](../enumerations/WorkerState.md)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:175](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L175)

##### Returns

`BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

## Methods

### connectComponent()

> **connectComponent**(`component`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:126](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L126)

#### Parameters

##### component

[`Component`](Component.md)

#### Returns

`Promise`\<`void`\>

***

### connectComponents()

> **connectComponents**(`components`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:120](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L120)

#### Parameters

##### components

[`Component`](Component.md)[]

#### Returns

`Promise`\<`void`\>

***

### disconnectComponent()

> **disconnectComponent**(`name`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:136](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L136)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

***

### doJob()

> `protected` **doJob**\<`T`\>(`executor`): `Promise`\<`T` \| `undefined`\>

Defined in: [packages/framework/src/lib/Worker.ts:68](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L68)

#### Type Parameters

##### T

`T`

#### Parameters

##### executor

[`JobExecutor`](../type-aliases/JobExecutor.md)\<`T`\>

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### doJobInterval()

> `protected` **doJobInterval**(`executor`, `timeMS`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:72](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L72)

#### Parameters

##### executor

[`JobExecutor`](../type-aliases/JobExecutor.md)

##### timeMS

`number`

#### Returns

`Promise`\<`void`\>

***

### hasComponent()

> **hasComponent**(`id`): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:153](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L153)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### hasProvider()

> **hasProvider**(`id`): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:149](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L149)

#### Parameters

##### id

`string`

#### Returns

`boolean`

***

### onError()

> `protected` **onError**(`err`): `void`

Defined in: [packages/framework/src/lib/Worker.ts:157](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L157)

#### Parameters

##### err

`Error`

#### Returns

`void`

***

### registerProvider()

> **registerProvider**(`provider`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:98](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L98)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`Promise`\<`void`\>

***

### registerProviders()

> **registerProviders**(`providers`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:92](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L92)

#### Parameters

##### providers

[`Provider`](Provider.md)\<[`Route`](Route.md)\>[]

#### Returns

`Promise`\<`void`\>

***

### runCommand()

> **runCommand**(...`args`): `Promise`\<`boolean`\>

Defined in: [packages/framework/src/lib/Worker.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L64)

#### Parameters

##### args

...`unknown`[]

#### Returns

`Promise`\<`boolean`\>

***

### shutdown()

> `abstract` `protected` **shutdown**(`reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:43](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L43)

#### Parameters

##### reason

`string`

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:34](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L34)

#### Returns

`Promise`\<`void`\>

***

### startup()

> `abstract` `protected` **startup**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L33)

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(`reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:44](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L44)

#### Parameters

##### reason

`string`

#### Returns

`Promise`\<`void`\>

***

### unregisterProvider()

> **unregisterProvider**(`name`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L108)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>
