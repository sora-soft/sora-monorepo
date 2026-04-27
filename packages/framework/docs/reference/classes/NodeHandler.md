[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / NodeHandler

# Class: NodeHandler

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L25)

## Extends

- [`Route`](Route.md)

## Constructors

### Constructor

> **new NodeHandler**(`node`): `NodeHandler`

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:26](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L26)

#### Parameters

##### node

[`Node`](Node.md)

#### Returns

`NodeHandler`

#### Overrides

[`Route`](Route.md).[`constructor`](Route.md#constructor)

## Methods

### buildCallParams()

> `protected` **buildCallParams**(`method`, `paramTypes`, `request`, `response`, `connector`): `Promise`\<`unknown`[]\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:204](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L204)

#### Parameters

##### method

`string`

##### paramTypes

`any`[]

##### request

[`Notify`](Notify.md)\<`unknown`\> \| [`Request`](Request.md)\<`unknown`\>

##### response

[`Response`](Response.md)\<`unknown`\> \| `null`

##### connector

[`Connector`](Connector.md)

#### Returns

`Promise`\<`unknown`[]\>

#### Inherited from

[`Route`](Route.md).[`buildCallParams`](Route.md#buildcallparams)

***

### callMethod()

> `protected` **callMethod**(`method`, `request`, `response`, `connector`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:243](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L243)

#### Parameters

##### method

`string`

##### request

[`Request`](Request.md)

##### response

[`Response`](Response.md)

##### connector

[`Connector`](Connector.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Route`](Route.md).[`callMethod`](Route.md#callmethod)

***

### callNotify()

> `protected` **callNotify**(`method`, `request`, `connector`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:275](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L275)

#### Parameters

##### method

`string`

##### request

[`Notify`](Notify.md)

##### connector

[`Connector`](Connector.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Route`](Route.md).[`callNotify`](Route.md#callnotify)

***

### createService()

> **createService**(`body`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L32)

#### Parameters

##### body

[`IReqCreateService`](../interfaces/IReqCreateService.md)

#### Returns

`Promise`\<\{ `id`: `string`; \}\>

***

### createWorker()

> **createWorker**(`body`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:44](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L44)

#### Parameters

##### body

[`IReqCreateWorker`](../interfaces/IReqCreateWorker.md)

#### Returns

`Promise`\<\{ `id`: `string`; \}\>

***

### fetchRunningData()

> **fetchRunningData**(): `Promise`\<[`INodeRunData`](../interfaces/INodeRunData.md)\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:79](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L79)

#### Returns

`Promise`\<[`INodeRunData`](../interfaces/INodeRunData.md)\>

***

### hasMethod()

> `protected` **hasMethod**(`method`): `boolean` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Route.ts:302](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L302)

#### Parameters

##### method

`string`

#### Returns

`boolean` \| `undefined`

#### Inherited from

[`Route`](Route.md).[`hasMethod`](Route.md#hasmethod)

***

### hasNotify()

> `protected` **hasNotify**(`method`): `boolean` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Route.ts:308](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L308)

#### Parameters

##### method

`string`

#### Returns

`boolean` \| `undefined`

#### Inherited from

[`Route`](Route.md).[`hasNotify`](Route.md#hasnotify)

***

### removeService()

> **removeService**(`body`): `Promise`\<\{ \}\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L53)

#### Parameters

##### body

[`IReqRemoveWorker`](../interfaces/IReqRemoveWorker.md)

#### Returns

`Promise`\<\{ \}\>

***

### removeWorker()

> **removeWorker**(`body`): `Promise`\<\{ \}\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L63)

#### Parameters

##### body

[`IReqRemoveWorker`](../interfaces/IReqRemoveWorker.md)

#### Returns

`Promise`\<\{ \}\>

***

### shutdown()

> **shutdown**(): `Promise`\<\{ \}\>

Defined in: [packages/framework/src/lib/handler/NodeHandler.ts:71](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/handler/NodeHandler.ts#L71)

#### Returns

`Promise`\<\{ \}\>

***

### callback()

> `static` **callback**(`route`): [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Route.ts:125](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L125)

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

#### Inherited from

[`Route`](Route.md).[`callback`](Route.md#callback)

***

### compose()

> `static` **compose**(`routes`): [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Route.ts:177](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L177)

#### Parameters

##### routes

[`Route`](Route.md)[]

#### Returns

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

#### Inherited from

[`Route`](Route.md).[`compose`](Route.md#compose)

***

### makeErrorRPCResponse()

> `protected` `static` **makeErrorRPCResponse**(`request`, `response`, `err`): [`IRawResPacket`](../interfaces/IRawResPacket.md)\<`unknown`\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:111](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L111)

#### Parameters

##### request

[`Request`](Request.md)

##### response

[`Response`](Response.md)

##### err

[`ExError`](ExError.md)

#### Returns

[`IRawResPacket`](../interfaces/IRawResPacket.md)\<`unknown`\>

#### Inherited from

[`Route`](Route.md).[`makeErrorRPCResponse`](Route.md#makeerrorrpcresponse)

***

### method()

> `protected` `static` **method**(`target`, `key`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L53)

#### Parameters

##### target

[`Route`](Route.md)

##### key

`string`

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`method`](Route.md#method)

***

### notify()

> `protected` `static` **notify**(`target`, `key`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L58)

#### Parameters

##### target

[`Route`](Route.md)

##### key

`string`

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`notify`](Route.md#notify)

***

### registerMethod()

> `protected` `static` **registerMethod**(`target`, `method`, `callback`, `types`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L64)

#### Parameters

##### target

[`Route`](Route.md)

##### method

`string`

##### callback

[`RPCHandler`](../type-aliases/RPCHandler.md)

##### types

`any`[]

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`registerMethod`](Route.md#registermethod)

***

### registerMiddleware()

> `protected` `static` **registerMiddleware**\<`T`\>(`target`, `method`, `middleware`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:101](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L101)

#### Type Parameters

##### T

`T` *extends* [`Route`](Route.md) = [`Route`](Route.md)

#### Parameters

##### target

`T`

##### method

`string`

##### middleware

[`RPCMiddleware`](../type-aliases/RPCMiddleware.md)\<`T`\>

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`registerMiddleware`](Route.md#registermiddleware)

***

### registerNotify()

> `protected` `static` **registerNotify**(`target`, `method`, `callback`, `types`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:76](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L76)

#### Parameters

##### target

[`Route`](Route.md)

##### method

`string`

##### callback

[`NotifyHandler`](../type-aliases/NotifyHandler.md)

##### types

`any`[]

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`registerNotify`](Route.md#registernotify)

***

### registerProvider()

> `protected` `static` **registerProvider**\<`T`, `R`\>(`target`, `method`, `type`, `provider`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:88](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L88)

#### Type Parameters

##### T

`T` = `unknown`

##### R

`R` *extends* [`Route`](Route.md) = [`Route`](Route.md)

#### Parameters

##### target

`R`

##### method

`string`

##### type

`unknown`

##### provider

[`MethodPramBuilder`](../type-aliases/MethodPramBuilder.md)\<`T`, `R`\>

#### Returns

`void`

#### Inherited from

[`Route`](Route.md).[`registerProvider`](Route.md#registerprovider)
