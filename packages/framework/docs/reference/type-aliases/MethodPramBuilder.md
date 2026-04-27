[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / MethodPramBuilder

# Type Alias: MethodPramBuilder\<T, R, Req, Res\>

> **MethodPramBuilder**\<`T`, `R`, `Req`, `Res`\> = (`route`, `body`, `req`, `response`, `connector`) => `Promise`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/Route.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Route.ts#L18)

## Type Parameters

### T

`T` = `unknown`

### R

`R` *extends* [`Route`](../classes/Route.md) = [`Route`](../classes/Route.md)

### Req

`Req` = `unknown`

### Res

`Res` = `unknown`

## Parameters

### route

`R`

### body

`Req`

### req

[`Request`](../classes/Request.md)\<`Req`\> \| [`Notify`](../classes/Notify.md)\<`Req`\>

### response

[`Response`](../classes/Response.md)\<`Res`\> \| `null`

### connector

[`Connector`](../classes/Connector.md)

## Returns

`Promise`\<`T`\>
