[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RouteRPCMethod

# Type Alias: RouteRPCMethod\<T, K\>

> **RouteRPCMethod**\<`T`, `K`\> = (`body`, `options?`, `raw?`) => `ReturnType`\<[`TypeOfClassMethod`](TypeOfClassMethod.md)\<`T`, `K`\>\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:22](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L22)

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

`false`

## Returns

`ReturnType`\<[`TypeOfClassMethod`](TypeOfClassMethod.md)\<`T`, `K`\>\>
