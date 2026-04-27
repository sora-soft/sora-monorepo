[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ProviderManager

# Class: ProviderManager

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L32)

## Constructors

### Constructor

> **new ProviderManager**(`discovery`): `ProviderManager`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L33)

#### Parameters

##### discovery

[`Discovery`](Discovery.md)

#### Returns

`ProviderManager`

## Accessors

### discovery

#### Get Signature

> **get** **discovery**(): [`Discovery`](Discovery.md)

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:70](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L70)

##### Returns

[`Discovery`](Discovery.md)

## Methods

### addProvider()

> **addProvider**(`provider`): `void`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:58](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L58)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`void`

***

### connectorFactory()

> **connectorFactory**(`target`): [`Connector`](Connector.md) \| `null`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:41](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L41)

#### Parameters

##### target

[`IListenerMetaData`](../interfaces/IListenerMetaData.md)

#### Returns

[`Connector`](Connector.md) \| `null`

***

### findAvailableCodec()

> **findAvailableCodec**(`codes`): [`Codec`](Codec.md)\<`any`\> \| `null`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:49](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L49)

#### Parameters

##### codes

`string`[]

#### Returns

[`Codec`](Codec.md)\<`any`\> \| `null`

***

### getAllProviders()

> **getAllProviders**(): [`Provider`](Provider.md)\<[`Route`](Route.md)\>[]

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:66](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L66)

#### Returns

[`Provider`](Provider.md)\<[`Route`](Route.md)\>[]

***

### registerSender()

> **registerSender**(`protocol`, `builder`): `void`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:37](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L37)

#### Parameters

##### protocol

`string`

##### builder

[`SenderBuilder`](../type-aliases/SenderBuilder.md)

#### Returns

`void`

***

### removeProvider()

> **removeProvider**(`provider`): `void`

Defined in: [packages/framework/src/lib/rpc/provider/ProviderManager.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/provider/ProviderManager.ts#L62)

#### Parameters

##### provider

[`Provider`](Provider.md)

#### Returns

`void`
