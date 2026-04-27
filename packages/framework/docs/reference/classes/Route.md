[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Route

# Class: Route

Defined in: [packages/framework/src/lib/rpc/Route.ts:52](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L52)

## Extended by

- [`NodeHandler`](NodeHandler.md)

## Constructors

### Constructor

> **new Route**(): `Route`

Defined in: [packages/framework/src/lib/rpc/Route.ts:202](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L202)

#### Returns

`Route`

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

***

### hasMethod()

> `protected` **hasMethod**(`method`): `boolean` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Route.ts:302](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L302)

#### Parameters

##### method

`string`

#### Returns

`boolean` \| `undefined`

***

### hasNotify()

> `protected` **hasNotify**(`method`): `boolean` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Route.ts:308](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L308)

#### Parameters

##### method

`string`

#### Returns

`boolean` \| `undefined`

***

### callback()

> `static` **callback**(`route`): [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Route.ts:125](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L125)

#### Parameters

##### route

`Route`

#### Returns

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

***

### compose()

> `static` **compose**(`routes`): [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Route.ts:177](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L177)

#### Parameters

##### routes

`Route`[]

#### Returns

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

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

***

### method()

> `protected` `static` **method**(`target`, `key`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:53](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L53)

#### Parameters

##### target

`Route`

##### key

`string`

#### Returns

`void`

***

### notify()

> `protected` `static` **notify**(`target`, `key`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L58)

#### Parameters

##### target

`Route`

##### key

`string`

#### Returns

`void`

***

### registerMethod()

> `protected` `static` **registerMethod**(`target`, `method`, `callback`, `types`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:64](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L64)

#### Parameters

##### target

`Route`

##### method

`string`

##### callback

[`RPCHandler`](../type-aliases/RPCHandler.md)

##### types

`any`[]

#### Returns

`void`

***

### registerMiddleware()

> `protected` `static` **registerMiddleware**\<`T`\>(`target`, `method`, `middleware`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:101](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L101)

#### Type Parameters

##### T

`T` *extends* `Route` = `Route`

#### Parameters

##### target

`T`

##### method

`string`

##### middleware

[`RPCMiddleware`](../type-aliases/RPCMiddleware.md)\<`T`\>

#### Returns

`void`

***

### registerNotify()

> `protected` `static` **registerNotify**(`target`, `method`, `callback`, `types`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:76](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L76)

#### Parameters

##### target

`Route`

##### method

`string`

##### callback

[`NotifyHandler`](../type-aliases/NotifyHandler.md)

##### types

`any`[]

#### Returns

`void`

***

### registerProvider()

> `protected` `static` **registerProvider**\<`T`, `R`\>(`target`, `method`, `type`, `provider`): `void`

Defined in: [packages/framework/src/lib/rpc/Route.ts:88](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L88)

#### Type Parameters

##### T

`T` = `unknown`

##### R

`R` *extends* `Route` = `Route`

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
