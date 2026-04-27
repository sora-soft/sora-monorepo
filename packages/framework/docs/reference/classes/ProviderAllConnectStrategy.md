[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ProviderAllConnectStrategy

# Class: ProviderAllConnectStrategy

Defined in: [packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts#L8)

## Extends

- [`ProviderStrategy`](ProviderStrategy.md)

## Constructors

### Constructor

> **new ProviderAllConnectStrategy**(): `ProviderAllConnectStrategy`

#### Returns

`ProviderAllConnectStrategy`

#### Inherited from

[`ProviderStrategy`](ProviderStrategy.md).[`constructor`](ProviderStrategy.md#constructor)

## Methods

### init()

> **init**(): `void`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts#L9)

#### Returns

`void`

#### Overrides

[`ProviderStrategy`](ProviderStrategy.md).[`init`](ProviderStrategy.md#init)

***

### isBroadcastEnabled()

> **isBroadcastEnabled**(): `boolean`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts#L25)

#### Returns

`boolean`

#### Overrides

[`ProviderStrategy`](ProviderStrategy.md).[`isBroadcastEnabled`](ProviderStrategy.md#isbroadcastenabled)

***

### selectListener()

> **selectListener**(`provider`, `listeners`): `Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts:11](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts#L11)

#### Parameters

##### provider

[`Provider`](Provider.md)

##### listeners

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]

#### Returns

`Promise`\<[`IListenerMetaData`](../interfaces/IListenerMetaData.md)[]\>

#### Overrides

[`ProviderStrategy`](ProviderStrategy.md).[`selectListener`](ProviderStrategy.md#selectlistener)

***

### selectSender()

> **selectSender**(`provider`, `senders`, `toId?`): `Promise`\<[`RPCSender`](RPCSender.md) \| `null`\>

Defined in: [packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderAllConnectStrategy.ts#L17)

#### Parameters

##### provider

[`Provider`](Provider.md)

##### senders

[`RPCSender`](RPCSender.md)[]

##### toId?

`string`

#### Returns

`Promise`\<[`RPCSender`](RPCSender.md) \| `null`\>

#### Overrides

[`ProviderStrategy`](ProviderStrategy.md).[`selectSender`](ProviderStrategy.md#selectsender)
