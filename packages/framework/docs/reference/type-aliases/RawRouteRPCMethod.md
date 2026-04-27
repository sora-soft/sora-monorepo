[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RawRouteRPCMethod

# Type Alias: RawRouteRPCMethod\<T, K\>

> **RawRouteRPCMethod**\<`T`, `K`\> = (`body`, `options?`, `raw?`) => `Promise`\<[`Response`](../classes/Response.md)\<[`ThenArg`](ThenArg.md)\<`ReturnType`\<[`TypeOfClassMethod`](TypeOfClassMethod.md)\<`T`, `K`\>\>\>\>\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L21)

## Type Parameters

### T

`T` *extends* [`Route`](../classes/Route.md)

### K

`K` *extends* keyof `T`

## Parameters

### body

[`UndefinedToVoid`](UndefinedToVoid.md)\<`Parameters`\<[`TypeOfClassMethod`](TypeOfClassMethod.md)\<`T`, `K`\>\>\[`0`\]\>

### options?

[`IRequestOptions`](../interfaces/IRequestOptions.md)

### raw?

`true`

## Returns

`Promise`\<[`Response`](../classes/Response.md)\<[`ThenArg`](ThenArg.md)\<`ReturnType`\<[`TypeOfClassMethod`](TypeOfClassMethod.md)\<`T`, `K`\>\>\>\>\>
