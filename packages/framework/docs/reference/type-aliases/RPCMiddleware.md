[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RPCMiddleware

# Type Alias: RPCMiddleware\<T, Req, Res\>

> **RPCMiddleware**\<`T`, `Req`, `Res`\> = (`route`, `body`, `req`, `response`, `connector`, `next`) => `Promise`\<`unknown`\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L24)

## Type Parameters

### T

`T` *extends* [`Route`](../classes/Route.md) = [`Route`](../classes/Route.md)

### Req

`Req` = `unknown`

### Res

`Res` = `unknown`

## Parameters

### route

`T`

### body

`Req`

### req

[`Request`](../classes/Request.md)\<`Req`\> \| [`Notify`](../classes/Notify.md)\<`Req`\>

### response

[`Response`](../classes/Response.md)\<`Res`\> \| `null`

### connector

[`Connector`](../classes/Connector.md)

### next

() => `Promise`\<`unknown`\>

## Returns

`Promise`\<`unknown`\>
