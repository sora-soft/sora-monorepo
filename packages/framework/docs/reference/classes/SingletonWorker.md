[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / SingletonWorker

# Abstract Class: SingletonWorker

Defined in: [packages/framework/src/lib/SingletonWorker.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/SingletonWorker.ts#L8)

## Extends

- [`Worker`](Worker.md)

## Constructors

### Constructor

> **new SingletonWorker**(`name`, `options`): `SingletonWorker`

Defined in: [packages/framework/src/lib/SingletonWorker.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/SingletonWorker.ts#L9)

#### Parameters

##### name

`string`

##### options

[`IWorkerOptions`](../interfaces/IWorkerOptions.md)

#### Returns

`SingletonWorker`

#### Overrides

[`Worker`](Worker.md).[`constructor`](Worker.md#constructor)

## Properties

### executor\_

> `protected` **executor\_**: [`Executor`](Executor.md)

Defined in: [packages/framework/src/lib/Worker.ts:207](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L207)

#### Inherited from

[`Worker`](Worker.md).[`executor_`](Worker.md#executor_)

***

### intervalJobTimer\_

> `protected` **intervalJobTimer\_**: [`Timer`](Timer.md)

Defined in: [packages/framework/src/lib/Worker.ts:208](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L208)

#### Inherited from

[`Worker`](Worker.md).[`intervalJobTimer_`](Worker.md#intervaljobtimer_)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:206](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L206)

#### Inherited from

[`Worker`](Worker.md).[`lifeCycle_`](Worker.md#lifecycle_)

***

### options\_

> `protected` **options\_**: [`IWorkerOptions`](../interfaces/IWorkerOptions.md)

Defined in: [packages/framework/src/lib/Worker.ts:210](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L210)

#### Inherited from

[`Worker`](Worker.md).[`options_`](Worker.md#options_)

***

### scope\_

> `protected` **scope\_**: [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:211](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L211)

#### Inherited from

[`Worker`](Worker.md).[`scope_`](Worker.md#scope_)

***

### startTime\_

> `protected` **startTime\_**: `number`

Defined in: [packages/framework/src/lib/Worker.ts:209](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L209)

#### Inherited from

[`Worker`](Worker.md).[`startTime_`](Worker.md#starttime_)

## Accessors

### executor

#### Get Signature

> **get** **executor**(): [`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

Defined in: [packages/framework/src/lib/Worker.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L187)

##### Returns

[`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

#### Inherited from

[`Worker`](Worker.md).[`executor`](Worker.md#executor)

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:183](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L183)

##### Returns

`string`

#### Inherited from

[`Worker`](Worker.md).[`id`](Worker.md#id)

***

### isIdle

#### Get Signature

> **get** **isIdle**(): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:171](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L171)

##### Returns

`boolean`

#### Inherited from

[`Worker`](Worker.md).[`isIdle`](Worker.md#isidle)

***

### lifeCycle

#### Get Signature

> **get** **lifeCycle**(): [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:179](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L179)

##### Returns

[`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

#### Inherited from

[`Worker`](Worker.md).[`lifeCycle`](Worker.md#lifecycle)

***

### metaData

#### Get Signature

> **get** **metaData**(): [`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)

Defined in: [packages/framework/src/lib/Worker.ts:195](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L195)

##### Returns

[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)

#### Inherited from

[`Worker`](Worker.md).[`metaData`](Worker.md#metadata)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:163](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L163)

##### Returns

`string`

#### Inherited from

[`Worker`](Worker.md).[`name`](Worker.md#name)

***

### scope

#### Get Signature

> **get** **scope**(): [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:191](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L191)

##### Returns

[`WorkerScope`](WorkerScope.md)

#### Inherited from

[`Worker`](Worker.md).[`scope`](Worker.md#scope)

***

### state

#### Get Signature

> **get** **state**(): [`WorkerState`](../enumerations/WorkerState.md)

Defined in: [packages/framework/src/lib/Worker.ts:167](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L167)

##### Returns

[`WorkerState`](../enumerations/WorkerState.md)

#### Inherited from

[`Worker`](Worker.md).[`state`](Worker.md#state)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:175](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L175)

##### Returns

`BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

#### Inherited from

[`Worker`](Worker.md).[`stateSubject`](Worker.md#statesubject)

## Methods

### connectComponent()

> **connectComponent**(`component`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:126](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L126)

#### Parameters

##### component

[`Component`](Component.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`connectComponent`](Worker.md#connectcomponent)

***

### connectComponents()

> **connectComponents**(`components`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:120](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L120)

#### Parameters

##### components

[`Component`](Component.md)[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`connectComponents`](Worker.md#connectcomponents)

***

### disconnectComponent()

> **disconnectComponent**(`name`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:136](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L136)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`disconnectComponent`](Worker.md#disconnectcomponent)

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

#### Inherited from

[`Worker`](Worker.md).[`doJob`](Worker.md#dojob)

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

#### Inherited from

[`Worker`](Worker.md).[`doJobInterval`](Worker.md#dojobinterval)

***

### hasComponent()

> **hasComponent**(`id`): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:153](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L153)

#### Parameters

##### id

`string`

#### Returns

`boolean`

#### Inherited from

[`Worker`](Worker.md).[`hasComponent`](Worker.md#hascomponent)

***

### hasProvider()

> **hasProvider**(`id`): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:149](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L149)

#### Parameters

##### id

`string`

#### Returns

`boolean`

#### Inherited from

[`Worker`](Worker.md).[`hasProvider`](Worker.md#hasprovider)

***

### onError()

> `protected` **onError**(`err`): `void`

Defined in: [packages/framework/src/lib/SingletonWorker.ts:26](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/SingletonWorker.ts#L26)

#### Parameters

##### err

`Error`

#### Returns

`void`

#### Overrides

[`Worker`](Worker.md).[`onError`](Worker.md#onerror)

***

### registerProvider()

> **registerProvider**(`provider`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:98](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L98)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`registerProvider`](Worker.md#registerprovider)

***

### registerProviders()

> **registerProviders**(`providers`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:92](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L92)

#### Parameters

##### providers

[`Provider`](Provider.md)\<[`Route`](Route.md)\>[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`registerProviders`](Worker.md#registerproviders)

***

### runCommand()

> **runCommand**(...`args`): `Promise`\<`boolean`\>

Defined in: [packages/framework/src/lib/Worker.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L64)

#### Parameters

##### args

...`unknown`[]

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`Worker`](Worker.md).[`runCommand`](Worker.md#runcommand)

***

### shutdown()

> `abstract` `protected` **shutdown**(`reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:43](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L43)

#### Parameters

##### reason

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`shutdown`](Worker.md#shutdown)

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/SingletonWorker.ts:14](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/SingletonWorker.ts#L14)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Worker`](Worker.md).[`start`](Worker.md#start)

***

### startup()

> `abstract` `protected` **startup**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L33)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`startup`](Worker.md#startup)

***

### stop()

> **stop**(`reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/SingletonWorker.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/SingletonWorker.ts#L19)

#### Parameters

##### reason

`string`

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Worker`](Worker.md).[`stop`](Worker.md#stop)

***

### unregisterProvider()

> **unregisterProvider**(`name`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L108)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Worker`](Worker.md).[`unregisterProvider`](Worker.md#unregisterprovider)
