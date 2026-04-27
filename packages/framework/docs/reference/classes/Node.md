[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Node

# Class: Node

Defined in: [packages/framework/src/lib/Node.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L12)

## Extends

- [`Service`](Service.md)

## Constructors

### Constructor

> **new Node**(`options`, `listeners`): `Node`

Defined in: [packages/framework/src/lib/Node.ts:38](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L38)

#### Parameters

##### options

[`INodeOptions`](../interfaces/INodeOptions.md)

##### listeners

[`Listener`](Listener.md)[]

#### Returns

`Node`

#### Overrides

[`Service`](Service.md).[`constructor`](Service.md#constructor)

## Properties

### executor\_

> `protected` **executor\_**: [`Executor`](Executor.md)

Defined in: [packages/framework/src/lib/Worker.ts:207](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L207)

#### Inherited from

[`Service`](Service.md).[`executor_`](Service.md#executor_)

***

### intervalJobTimer\_

> `protected` **intervalJobTimer\_**: [`Timer`](Timer.md)

Defined in: [packages/framework/src/lib/Worker.ts:208](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L208)

#### Inherited from

[`Service`](Service.md).[`intervalJobTimer_`](Service.md#intervaljobtimer_)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:206](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L206)

#### Inherited from

[`SingletonService`](SingletonService.md).[`lifeCycle_`](SingletonService.md#lifecycle_)

***

### options\_

> `protected` **options\_**: [`IServiceOptions`](../interfaces/IServiceOptions.md)

Defined in: [packages/framework/src/lib/Service.ts:174](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L174)

#### Inherited from

[`Service`](Service.md).[`options_`](Service.md#options_)

***

### scope\_

> `protected` **scope\_**: [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:211](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L211)

#### Inherited from

[`Service`](Service.md).[`scope_`](Service.md#scope_)

***

### startTime\_

> `protected` **startTime\_**: `number`

Defined in: [packages/framework/src/lib/Worker.ts:209](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L209)

#### Inherited from

[`Service`](Service.md).[`startTime_`](Service.md#starttime_)

## Accessors

### executor

#### Get Signature

> **get** **executor**(): [`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

Defined in: [packages/framework/src/lib/Worker.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L187)

##### Returns

[`Executor`](Executor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

#### Inherited from

[`SingletonService`](SingletonService.md).[`executor`](SingletonService.md#executor)

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:183](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L183)

##### Returns

`string`

#### Inherited from

[`SingletonService`](SingletonService.md).[`id`](SingletonService.md#id)

***

### isIdle

#### Get Signature

> **get** **isIdle**(): `boolean`

Defined in: [packages/framework/src/lib/Worker.ts:171](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L171)

##### Returns

`boolean`

#### Inherited from

[`SingletonService`](SingletonService.md).[`isIdle`](SingletonService.md#isidle)

***

### lifeCycle

#### Get Signature

> **get** **lifeCycle**(): [`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:179](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L179)

##### Returns

[`LifeCycle`](LifeCycle.md)\<[`WorkerState`](../enumerations/WorkerState.md)\>

#### Inherited from

[`SingletonService`](SingletonService.md).[`lifeCycle`](SingletonService.md#lifecycle)

***

### listenerPool

#### Get Signature

> **get** `protected` **listenerPool**(): `Map`\<`string`, [`Listener`](Listener.md)\>

Defined in: [packages/framework/src/lib/Service.ts:170](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L170)

##### Returns

`Map`\<`string`, [`Listener`](Listener.md)\>

#### Inherited from

[`SingletonService`](SingletonService.md).[`listenerPool`](SingletonService.md#listenerpool)

***

### metaData

#### Get Signature

> **get** **metaData**(): [`IServiceMetaData`](../interfaces/IServiceMetaData.md)

Defined in: [packages/framework/src/lib/Service.ts:144](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L144)

##### Returns

[`IServiceMetaData`](../interfaces/IServiceMetaData.md)

#### Inherited from

[`Service`](Service.md).[`metaData`](Service.md#metadata)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/Worker.ts:163](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L163)

##### Returns

`string`

#### Inherited from

[`SingletonService`](SingletonService.md).[`name`](SingletonService.md#name)

***

### nodeRunData

#### Get Signature

> **get** **nodeRunData**(): [`INodeRunData`](../interfaces/INodeRunData.md)

Defined in: [packages/framework/src/lib/Node.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L53)

##### Returns

[`INodeRunData`](../interfaces/INodeRunData.md)

***

### nodeStateData

#### Get Signature

> **get** **nodeStateData**(): [`INodeMetaData`](../interfaces/INodeMetaData.md)

Defined in: [packages/framework/src/lib/Node.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L63)

##### Returns

[`INodeMetaData`](../interfaces/INodeMetaData.md)

***

### runData

#### Get Signature

> **get** **runData**(): [`IServiceRunData`](../interfaces/IServiceRunData.md)

Defined in: [packages/framework/src/lib/Service.ts:156](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L156)

##### Returns

[`IServiceRunData`](../interfaces/IServiceRunData.md)

#### Inherited from

[`Service`](Service.md).[`runData`](Service.md#rundata)

***

### scope

#### Get Signature

> **get** **scope**(): [`WorkerScope`](WorkerScope.md)

Defined in: [packages/framework/src/lib/Worker.ts:191](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L191)

##### Returns

[`WorkerScope`](WorkerScope.md)

#### Inherited from

[`SingletonService`](SingletonService.md).[`scope`](SingletonService.md#scope)

***

### state

#### Get Signature

> **get** **state**(): [`WorkerState`](../enumerations/WorkerState.md)

Defined in: [packages/framework/src/lib/Worker.ts:167](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L167)

##### Returns

[`WorkerState`](../enumerations/WorkerState.md)

#### Inherited from

[`SingletonService`](SingletonService.md).[`state`](SingletonService.md#state)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

Defined in: [packages/framework/src/lib/Worker.ts:175](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L175)

##### Returns

`BehaviorSubject`\<[`WorkerState`](../enumerations/WorkerState.md)\>

#### Inherited from

[`SingletonService`](SingletonService.md).[`stateSubject`](SingletonService.md#statesubject)

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

[`Service`](Service.md).[`connectComponent`](Service.md#connectcomponent)

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

[`Service`](Service.md).[`connectComponents`](Service.md#connectcomponents)

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

[`Service`](Service.md).[`disconnectComponent`](Service.md#disconnectcomponent)

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

[`Service`](Service.md).[`doJob`](Service.md#dojob)

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

[`Service`](Service.md).[`doJobInterval`](Service.md#dojobinterval)

***

### getListenerMetaData()

> `protected` **getListenerMetaData**(`listener`): `object`

Defined in: [packages/framework/src/lib/Service.ts:126](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L126)

#### Parameters

##### listener

[`Listener`](Listener.md)

#### Returns

`object`

##### codecs

> **codecs**: `string`[]

##### endpoint

> **endpoint**: `string`

##### id

> **id**: `string` = `listener.id`

##### labels

> **labels**: `object`

###### Index Signature

\[`key`: `string`\]: `string`

##### protocol

> **protocol**: `string`

##### state

> **state**: [`ListenerState`](../enumerations/ListenerState.md) = `listener.state`

##### targetId

> **targetId**: `string`

##### targetName

> **targetName**: `string`

##### version

> **version**: `string` = `listener.version`

##### weight

> **weight**: `number` = `listener.weight`

#### Inherited from

[`Service`](Service.md).[`getListenerMetaData`](Service.md#getlistenermetadata)

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

[`Service`](Service.md).[`hasComponent`](Service.md#hascomponent)

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

[`Service`](Service.md).[`hasProvider`](Service.md#hasprovider)

***

### installListener()

> **installListener**(`listener`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Service.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L58)

#### Parameters

##### listener

[`Listener`](Listener.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`installListener`](Service.md#installlistener)

***

### onError()

> `protected` **onError**(`err`): `void`

Defined in: [packages/framework/src/lib/Worker.ts:157](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L157)

#### Parameters

##### err

`Error`

#### Returns

`void`

#### Inherited from

[`Service`](Service.md).[`onError`](Service.md#onerror)

***

### registerEndpoint()

> **registerEndpoint**(`listener`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Service.ts:98](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L98)

#### Parameters

##### listener

[`Listener`](Listener.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`registerEndpoint`](Service.md#registerendpoint)

***

### registerEndpoints()

> **registerEndpoints**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Service.ts:107](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L107)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`registerEndpoints`](Service.md#registerendpoints)

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

[`Service`](Service.md).[`registerProvider`](Service.md#registerprovider)

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

[`Service`](Service.md).[`registerProviders`](Service.md#registerproviders)

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

[`Service`](Service.md).[`runCommand`](Service.md#runcommand)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Node.ts:51](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L51)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Service`](Service.md).[`shutdown`](Service.md#shutdown)

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Worker.ts:34](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Worker.ts#L34)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`start`](Service.md#start)

***

### startup()

> **startup**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Node.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L45)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Service`](Service.md).[`startup`](Service.md#startup)

***

### stop()

> **stop**(`reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Service.ts:42](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L42)

#### Parameters

##### reason

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`stop`](Service.md#stop)

***

### uninstallListener()

> **uninstallListener**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Service.ts:113](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Service.ts#L113)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](Service.md).[`uninstallListener`](Service.md#uninstalllistener)

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

[`Service`](Service.md).[`unregisterProvider`](Service.md#unregisterprovider)

***

### registerService()

> `static` **registerService**\<`T`\>(`name`, `builder`): `void`

Defined in: [packages/framework/src/lib/Node.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L24)

#### Type Parameters

##### T

`T` *extends* [`IServiceOptions`](../interfaces/IServiceOptions.md)

#### Parameters

##### name

`string`

##### builder

[`ServiceBuilder`](../type-aliases/ServiceBuilder.md)\<`T`\>

#### Returns

`void`

***

### registerWorker()

> `static` **registerWorker**\<`T`\>(`name`, `builder`): `void`

Defined in: [packages/framework/src/lib/Node.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L13)

#### Type Parameters

##### T

`T` *extends* [`IWorkerOptions`](../interfaces/IWorkerOptions.md)

#### Parameters

##### name

`string`

##### builder

[`WorkerBuilder`](../type-aliases/WorkerBuilder.md)\<`T`\>

#### Returns

`void`

***

### serviceFactory()

> `static` **serviceFactory**(`name`, `options`): [`Service`](Service.md) \| `null`

Defined in: [packages/framework/src/lib/Node.ts:28](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L28)

#### Parameters

##### name

`string`

##### options

[`IServiceOptions`](../interfaces/IServiceOptions.md)

#### Returns

[`Service`](Service.md) \| `null`

***

### workerFactory()

> `static` **workerFactory**(`name`, `options`): [`Worker`](Worker.md) \| `null`

Defined in: [packages/framework/src/lib/Node.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Node.ts#L17)

#### Parameters

##### name

`string`

##### options

[`IWorkerOptions`](../interfaces/IWorkerOptions.md)

#### Returns

[`Worker`](Worker.md) \| `null`
