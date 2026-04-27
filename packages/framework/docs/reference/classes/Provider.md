[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Provider

# Class: Provider\<T\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:30](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L30)

## Type Parameters

### T

`T` *extends* [`Route`](Route.md) = [`Route`](Route.md)

## Constructors

### Constructor

> **new Provider**\<`T`\>(`name`, `filter?`, `strategy?`, `manager?`, `callback?`): `Provider`\<`T`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L31)

#### Parameters

##### name

`string`

##### filter?

[`LabelFilter`](LabelFilter.md) = `...`

##### strategy?

[`ProviderStrategy`](ProviderStrategy.md)

##### manager?

[`ProviderManager`](ProviderManager.md) \| `null`

##### callback?

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

#### Returns

`Provider`\<`T`\>

## Properties

### executor\_

> `protected` **executor\_**: [`QueueExecutor`](QueueExecutor.md)\<[`Scope`](Scope.md)\<`unknown`\>\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:342](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L342)

***

### senderSubject\_

> `protected` **senderSubject\_**: `BehaviorSubject`\<[`RPCSender`](RPCSender.md)[]\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:341](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L341)

***

### strategy\_

> `protected` **strategy\_**: [`ProviderStrategy`](ProviderStrategy.md)

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:340](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L340)

## Accessors

### broadcast

#### Get Signature

> **get** **broadcast**(): () => [`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:190](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L190)

##### Returns

() => [`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:328](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L328)

##### Returns

`string`

***

### isStarted

#### Get Signature

> **get** **isStarted**(): `boolean`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:133](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L133)

##### Returns

`boolean`

***

### logCategory

#### Get Signature

> **get** **logCategory**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:316](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L316)

##### Returns

`string`

***

### metaData

#### Get Signature

> **get** **metaData**(): [`IProviderMetaData`](../interfaces/IProviderMetaData.md)

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:293](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L293)

##### Returns

[`IProviderMetaData`](../interfaces/IProviderMetaData.md)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:125](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L125)

##### Returns

`string`

***

### notify

#### Get Signature

> **get** **notify**(): (`toId?`) => [`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:168](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L168)

##### Returns

(`toId?`) => [`ConvertRouteMethod`](../type-aliases/ConvertRouteMethod.md)\<`T`\>

***

### pvdManager

#### Get Signature

> **get** **pvdManager**(): [`ProviderManager`](ProviderManager.md)

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:324](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L324)

##### Returns

[`ProviderManager`](ProviderManager.md)

***

### rpc

#### Get Signature

> **get** **rpc**(): (`toId?`) => [`ConvertRPCRouteMethod`](../type-aliases/ConvertRPCRouteMethod.md)\<`T`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:140](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L140)

##### Returns

(`toId?`) => [`ConvertRPCRouteMethod`](../type-aliases/ConvertRPCRouteMethod.md)\<`T`\>

***

### senders

#### Get Signature

> **get** **senders**(): `Map`\<`string`, [`RPCSender`](RPCSender.md)\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:129](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L129)

##### Returns

`Map`\<`string`, [`RPCSender`](RPCSender.md)\>

***

### senderSubject

#### Get Signature

> **get** **senderSubject**(): `BehaviorSubject`\<[`RPCSender`](RPCSender.md)[]\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:301](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L301)

##### Returns

`BehaviorSubject`\<[`RPCSender`](RPCSender.md)[]\>

## Methods

### getSender()

> **getSender**(`targetId`): [`RPCSender`](RPCSender.md) \| `null`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:276](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L276)

#### Parameters

##### targetId

`string`

#### Returns

[`RPCSender`](RPCSender.md) \| `null`

***

### isSatisfy()

> **isSatisfy**(`labels`): `boolean`

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:272](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L272)

#### Parameters

##### labels

[`ILabels`](../interfaces/ILabels.md)

#### Returns

`boolean`

***

### randomSender()

> **randomSender**(): `Promise`\<[`RPCSender`](RPCSender.md)\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:284](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L284)

#### Returns

`Promise`\<[`RPCSender`](RPCSender.md)\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:41](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L41)

#### Returns

`Promise`\<`void`\>

***

### startup()

> **startup**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/provider/Provider.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/Provider.ts#L63)

#### Returns

`Promise`\<`void`\>
