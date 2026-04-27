[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Connector

# Abstract Class: Connector

Defined in: [packages/framework/src/lib/rpc/Connector.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L24)

## Extended by

- [`TCPConnector`](TCPConnector.md)

## Constructors

### Constructor

> **new Connector**(`options`): `Connector`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L25)

#### Parameters

##### options

[`IConnectorOptions`](../interfaces/IConnectorOptions.md)

#### Returns

`Connector`

## Properties

### codec\_?

> `protected` `optional` **codec\_?**: [`Codec`](Codec.md)\<`any`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:276](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L276)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:274](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L274)

***

### session\_

> `protected` **session\_**: `string` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:277](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L277)

***

### target\_?

> `protected` `optional` **target\_?**: [`IListenerInfo`](../interfaces/IListenerInfo.md)

Defined in: [packages/framework/src/lib/rpc/Connector.ts:275](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L275)

## Accessors

### dataSubject

#### Get Signature

> **get** **dataSubject**(): `Subject`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:266](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L266)

##### Returns

`Subject`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

***

### protocol

#### Get Signature

> **get** `abstract` **protocol**(): `string`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:55](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L55)

##### Returns

`string`

***

### scope

#### Get Signature

> **get** **scope**(): [`Scope`](Scope.md)\<`unknown`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:270](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L270)

##### Returns

[`Scope`](Scope.md)\<`unknown`\>

***

### session

#### Get Signature

> **get** **session**(): `string` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:254](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L254)

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **session**(`value`): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:258](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L258)

##### Parameters

###### value

`string` \| `undefined`

##### Returns

`void`

***

### state

#### Get Signature

> **get** **state**(): [`ConnectorState`](../enumerations/ConnectorState.md)

Defined in: [packages/framework/src/lib/rpc/Connector.ts:246](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L246)

##### Returns

[`ConnectorState`](../enumerations/ConnectorState.md)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:250](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L250)

##### Returns

`BehaviorSubject`\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

***

### target

#### Get Signature

> **get** **target**(): [`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:262](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L262)

##### Returns

[`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

## Methods

### connect()

> `abstract` `protected` **connect**(`target`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:61](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L61)

#### Parameters

##### target

[`IListenerInfo`](../interfaces/IListenerInfo.md)

#### Returns

`Promise`\<`void`\>

***

### disablePingPong()

> `protected` **disablePingPong**(): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:178](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L178)

#### Returns

`void`

***

### disconnect()

> `abstract` `protected` **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:95](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L95)

#### Returns

`Promise`\<`void`\>

***

### enablePingPong()

> `protected` **enablePingPong**(): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:147](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L147)

#### Returns

`void`

***

### handleCommand()

> `protected` **handleCommand**(`command`, `args`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:214](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L214)

#### Parameters

##### command

[`ConnectorCommand`](../enumerations/ConnectorCommand.md)

##### args

`unknown`

#### Returns

`Promise`\<`void`\>

***

### handleIncomeMessage()

> `protected` **handleIncomeMessage**(`data`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L187)

#### Parameters

##### data

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

#### Returns

`Promise`\<`void`\>

***

### isAvailable()

> `abstract` **isAvailable**(): `boolean`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:54](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L54)

#### Returns

`boolean`

***

### off()

> **off**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:96](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L96)

#### Returns

`Promise`\<`void`\>

***

### onCodecSelected()

> **onCodecSelected**(`code`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:80](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L80)

#### Parameters

##### code

`string`

#### Returns

`Promise`\<`void`\>

***

### onPingError()

> `protected` **onPingError**(`err`): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:171](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L171)

#### Parameters

##### err

[`ExError`](ExError.md)

#### Returns

`void`

***

### selectCodec()

> `abstract` **selectCodec**(`code`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:79](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L79)

#### Parameters

##### code

`string`

#### Returns

`Promise`\<`void`\>

***

### send()

> `abstract` **send**\<`RequestPayload`\>(`request`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:122](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L122)

#### Type Parameters

##### RequestPayload

`RequestPayload`

#### Parameters

##### request

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\<`RequestPayload`\>

#### Returns

`Promise`\<`void`\>

***

### sendCommand()

> **sendCommand**(`command`, `args?`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:131](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L131)

#### Parameters

##### command

[`ConnectorCommand`](../enumerations/ConnectorCommand.md)

##### args?

`unknown`

#### Returns

`Promise`\<`void`\>

***

### sendNotify()

> **sendNotify**(`notify`, `fromId?`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:125](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L125)

#### Parameters

##### notify

[`Notify`](Notify.md)

##### fromId?

`string` \| `null`

#### Returns

`Promise`\<`void`\>

***

### sendPing()

> `protected` **sendPing**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:139](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L139)

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`void`\>

***

### sendPong()

> `protected` **sendPong**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:143](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L143)

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`void`\>

***

### sendRaw()

> `abstract` **sendRaw**(`request`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:123](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L123)

#### Parameters

##### request

`object`

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**(`target`, `codec`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L62)

#### Parameters

##### target

[`IListenerInfo`](../interfaces/IListenerInfo.md)

##### codec

[`Codec`](Codec.md)\<`any`\>

#### Returns

`Promise`\<`void`\>

***

### waitForReady()

> **waitForReady**(`ttlMs`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L57)

#### Parameters

##### ttlMs

`number`

#### Returns

`Promise`\<`void`\>
