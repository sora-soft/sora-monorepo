[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Runtime

# Class: Runtime

Defined in: [packages/framework/src/lib/Runtime.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L19)

## Constructors

### Constructor

> **new Runtime**(): `Runtime`

#### Returns

`Runtime`

## Properties

### appVersion

> `static` **appVersion**: `string` = `'0.0.0'`

Defined in: [packages/framework/src/lib/Runtime.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L21)

***

### root

> `static` **root**: `string`

Defined in: [packages/framework/src/lib/Runtime.ts:23](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L23)

***

### startTime

> `static` **startTime**: `number`

Defined in: [packages/framework/src/lib/Runtime.ts:22](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L22)

***

### version

> `static` **version**: `string` = `__VERSION__`

Defined in: [packages/framework/src/lib/Runtime.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L20)

## Accessors

### components

#### Get Signature

> **get** `static` **components**(): [`Component`](Component.md)[]

Defined in: [packages/framework/src/lib/Runtime.ts:263](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L263)

##### Returns

[`Component`](Component.md)[]

***

### discovery

#### Get Signature

> **get** `static` **discovery**(): [`Discovery`](Discovery.md)

Defined in: [packages/framework/src/lib/Runtime.ts:243](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L243)

##### Returns

[`Discovery`](Discovery.md)

***

### frameLogger

#### Get Signature

> **get** `static` **frameLogger**(): [`FrameworkLogger`](FrameworkLogger.md)

Defined in: [packages/framework/src/lib/Runtime.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L25)

##### Returns

[`FrameworkLogger`](FrameworkLogger.md)

***

### node

#### Get Signature

> **get** `static` **node**(): [`Node`](Node.md)

Defined in: [packages/framework/src/lib/Runtime.ts:239](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L239)

##### Returns

[`Node`](Node.md)

***

### pvdManager

#### Get Signature

> **get** `static` **pvdManager**(): [`ProviderManager`](ProviderManager.md)

Defined in: [packages/framework/src/lib/Runtime.ts:247](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L247)

##### Returns

[`ProviderManager`](ProviderManager.md)

***

### rpcLogger

#### Get Signature

> **get** `static` **rpcLogger**(): [`RPCLogger`](RPCLogger.md)

Defined in: [packages/framework/src/lib/Runtime.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L32)

##### Returns

[`RPCLogger`](RPCLogger.md)

***

### scope

#### Get Signature

> **get** `static` **scope**(): `string`

Defined in: [packages/framework/src/lib/Runtime.ts:251](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L251)

##### Returns

`string`

***

### services

#### Get Signature

> **get** `static` **services**(): [`Service`](Service.md)[]

Defined in: [packages/framework/src/lib/Runtime.ts:255](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L255)

##### Returns

[`Service`](Service.md)[]

***

### workers

#### Get Signature

> **get** `static` **workers**(): [`Worker`](Worker.md)[]

Defined in: [packages/framework/src/lib/Runtime.ts:259](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L259)

##### Returns

[`Worker`](Worker.md)[]

## Methods

### getComponent()

> `static` **getComponent**\<`T`\>(`name`): `T`

Defined in: [packages/framework/src/lib/Runtime.ts:235](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L235)

#### Type Parameters

##### T

`T` *extends* [`Component`](Component.md)

#### Parameters

##### name

`string`

#### Returns

`T`

***

### installService()

> `static` **installService**(`service`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:132](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L132)

#### Parameters

##### service

[`Service`](Service.md)

#### Returns

`Promise`\<`void`\>

***

### installWorker()

> `static` **installWorker**(`worker`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:161](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L161)

#### Parameters

##### worker

[`Worker`](Worker.md)

#### Returns

`Promise`\<`void`\>

***

### loadConfig()

> `static` **loadConfig**(`options`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:36](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L36)

#### Parameters

##### options

[`IRuntimeOptions`](../interfaces/IRuntimeOptions.md)

#### Returns

`Promise`\<`void`\>

***

### registerComponent()

> `static` **registerComponent**(`name`, `component`): `void`

Defined in: [packages/framework/src/lib/Runtime.ts:225](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L225)

#### Parameters

##### name

`string`

##### component

[`Component`](Component.md)

#### Returns

`void`

***

### shutdown()

> `static` **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:84](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L84)

#### Returns

`Promise`\<`void`\>

***

### startup()

> `static` **startup**(`node`, `discovery`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:41](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L41)

#### Parameters

##### node

[`Node`](Node.md)

##### discovery

[`Discovery`](Discovery.md)

#### Returns

`Promise`\<`void`\>

***

### uninstallService()

> `static` **uninstallService**(`id`, `reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:208](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L208)

#### Parameters

##### id

`string`

##### reason

`string`

#### Returns

`Promise`\<`void`\>

***

### uninstallWorker()

> `static` **uninstallWorker**(`id`, `reason`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Runtime.ts:190](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Runtime.ts#L190)

#### Parameters

##### id

`string`

##### reason

`string`

#### Returns

`Promise`\<`void`\>
