[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / RouteMethod

# Type Alias: RouteMethod\<T, K\>

> **RouteMethod**\<`T`, `K`\> = (`body`, `options?`) => `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:26](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L26)

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

## Returns

`Promise`\<`void`\>
