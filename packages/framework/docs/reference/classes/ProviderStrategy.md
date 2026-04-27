[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ProviderStrategy

# Abstract Class: ProviderStrategy

Defined in: [packages/framework/src/lib/rpc/provider/ProviderStrategy.ts:5](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderStrategy.ts#L5)

## Extended by

- [`ProviderAllConnectStrategy`](ProviderAllConnectStrategy.md)

## Constructors

### Constructor

> **new ProviderStrategy**(): `ProviderStrategy`

#### Returns

`ProviderStrategy`

## Methods

### init()

> `abstract` **init**(`provider`): `void`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderStrategy.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderStrategy.ts#L6)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`void`

***

### isBroadcastEnabled()

> `abstract` **isBroadcastEnabled**(`provider`): `boolean`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderStrategy.ts:12](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderStrategy.ts#L12)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`boolean`

***

### selectListener()

> `abstract` **selectListener**(`provider`, `list`, `senders`): `Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderStrategy.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderStrategy.ts#L8)

#### Parameters

##### provider

[`Provider`](Provider.md)

##### list

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]

##### senders

[`RPCSender`](RPCSender.md)[]

#### Returns

`Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

***

### selectSender()

> `abstract` **selectSender**(`provider`, `senders`, `toId?`): `Promise`\<[`RPCSender`](RPCSender.md) \| `null`\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderStrategy.ts:10](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderStrategy.ts#L10)

#### Parameters

##### provider

[`Provider`](Provider.md)

##### senders

[`RPCSender`](RPCSender.md)[]

##### toId?

`string` \| `null`

#### Returns

`Promise`\<[`RPCSender`](RPCSender.md) \| `null`\>
