[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Discovery

# Abstract Class: Discovery

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:11](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L11)

## Constructors

### Constructor

> **new Discovery**(): `Discovery`

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L12)

#### Returns

`Discovery`

## Properties

### listenerSubject\_

> `protected` **listenerSubject\_**: `BehaviorSubject`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:77](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L77)

***

### nodeSubject\_

> `protected` **nodeSubject\_**: `BehaviorSubject`\<[`INodeMetaData`](../interfaces/INodeMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:78](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L78)

***

### serviceSubject\_

> `protected` **serviceSubject\_**: `BehaviorSubject`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:76](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L76)

***

### workerSubject\_

> `protected` **workerSubject\_**: `BehaviorSubject`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:79](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L79)

## Accessors

### info

#### Get Signature

> **get** `abstract` **info**(): [`IDiscoveryInfo`](../interfaces/IDiscoveryInfo.md)

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:75](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L75)

##### Returns

[`IDiscoveryInfo`](../interfaces/IDiscoveryInfo.md)

***

### listenerSubject

#### Get Signature

> **get** **listenerSubject**(): `BehaviorSubject`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:61](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L61)

##### Returns

`BehaviorSubject`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

***

### nodeSubject

#### Get Signature

> **get** **nodeSubject**(): `BehaviorSubject`\<[`INodeMetaData`](../interfaces/INodeMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:69](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L69)

##### Returns

`BehaviorSubject`\<[`INodeMetaData`](../interfaces/INodeMetaData.md)[]\>

***

### serviceSubject

#### Get Signature

> **get** **serviceSubject**(): `BehaviorSubject`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L57)

##### Returns

`BehaviorSubject`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

***

### version

#### Get Signature

> **get** `abstract` **version**(): `string`

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:73](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L73)

##### Returns

`string`

***

### workerSubject

#### Get Signature

> **get** **workerSubject**(): `BehaviorSubject`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:65](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L65)

##### Returns

`BehaviorSubject`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L45)

#### Returns

`Promise`\<`void`\>

***

### createElection()

> `abstract` **createElection**(`name`): [`Election`](Election.md)

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:40](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L40)

#### Parameters

##### name

`string`

#### Returns

[`Election`](Election.md)

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:49](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L49)

#### Returns

`Promise`\<`void`\>

***

### getAllEndpointList()

> `abstract` **getAllEndpointList**(): `Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L17)

#### Returns

`Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

***

### getAllServiceList()

> `abstract` **getAllServiceList**(): `Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L15)

#### Returns

`Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

***

### getAllWorkerList()

> `abstract` **getAllWorkerList**(): `Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L20)

#### Returns

`Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

***

### getEndpointById()

> `abstract` **getEndpointById**(`id`): `Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md) \| `undefined`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:27](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L27)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md) \| `undefined`\>

***

### getEndpointList()

> `abstract` **getEndpointList**(`service`): `Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L18)

#### Parameters

##### service

`string`

#### Returns

`Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

***

### getNodeById()

> `abstract` **getNodeById**(`id`): `Promise`\<[`INodeMetaData`](../interfaces/INodeMetaData.md) \| `undefined`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:26](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L26)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`INodeMetaData`](../interfaces/INodeMetaData.md) \| `undefined`\>

***

### getNodeList()

> `abstract` **getNodeList**(): `Promise`\<[`INodeMetaData`](../interfaces/INodeMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L19)

#### Returns

`Promise`\<[`INodeMetaData`](../interfaces/INodeMetaData.md)[]\>

***

### getServiceById()

> `abstract` **getServiceById**(`id`): `Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md) \| `undefined`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L24)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md) \| `undefined`\>

***

### getServiceList()

> `abstract` **getServiceList**(`name`): `Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L16)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<[`IServiceMetaData`](../interfaces/IServiceMetaData.md)[]\>

***

### getWorkerById()

> `abstract` **getWorkerById**(`id`): `Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md) \| `undefined`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L25)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md) \| `undefined`\>

***

### getWorkerList()

> `abstract` **getWorkerList**(`worker`): `Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L21)

#### Parameters

##### worker

`string`

#### Returns

`Promise`\<[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)[]\>

***

### registerEndpoint()

> `abstract` **registerEndpoint**(`info`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L32)

#### Parameters

##### info

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)

#### Returns

`Promise`\<`void`\>

***

### registerNode()

> `abstract` **registerNode**(`node`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L33)

#### Parameters

##### node

[`INodeMetaData`](../interfaces/INodeMetaData.md)

#### Returns

`Promise`\<`void`\>

***

### registerService()

> `abstract` **registerService**(`service`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L31)

#### Parameters

##### service

[`IServiceMetaData`](../interfaces/IServiceMetaData.md)

#### Returns

`Promise`\<`void`\>

***

### registerWorker()

> `abstract` **registerWorker**(`worker`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:30](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L30)

#### Parameters

##### worker

[`IWorkerMetaData`](../interfaces/IWorkerMetaData.md)

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> `abstract` `protected` **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:43](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L43)

#### Returns

`Promise`\<`void`\>

***

### startup()

> `abstract` `protected` **startup**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:42](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L42)

#### Returns

`Promise`\<`void`\>

***

### unregisterEndPoint()

> `abstract` **unregisterEndPoint**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:36](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L36)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### unregisterNode()

> `abstract` **unregisterNode**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:37](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L37)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### unregisterService()

> `abstract` **unregisterService**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:35](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L35)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### unregisterWorker()

> `abstract` **unregisterWorker**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/discovery/Discovery.ts:34](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/discovery/Discovery.ts#L34)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>
