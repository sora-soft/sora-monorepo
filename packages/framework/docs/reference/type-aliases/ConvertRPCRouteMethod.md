[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ConvertRPCRouteMethod

# Type Alias: ConvertRPCRouteMethod\<T\>

> **ConvertRPCRouteMethod**\<`T`\> = `{ [K in keyof T]: RouteRPCMethod<T, K> & RawRouteRPCMethod<T, K> }`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:23](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L23)

## Type Parameters

### T

`T` *extends* [`Route`](../classes/Route.md)
