[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / TCPConnector

# Class: TCPConnector

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L20)

## Extends

- [`Connector`](Connector.md)

## Constructors

### Constructor

> **new TCPConnector**(`socket?`): `TCPConnector`

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:27](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L27)

#### Parameters

##### socket?

`Socket`

#### Returns

`TCPConnector`

#### Overrides

[`Connector`](Connector.md).[`constructor`](Connector.md#constructor)

## Properties

### codec\_?

> `protected` `optional` **codec\_?**: [`Codec`](Codec.md)\<`any`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:276](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L276)

#### Inherited from

[`Connector`](Connector.md).[`codec_`](Connector.md#codec_)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:274](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L274)

#### Inherited from

[`Connector`](Connector.md).[`lifeCycle_`](Connector.md#lifecycle_)

***

### session\_

> `protected` **session\_**: `string` \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:277](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L277)

#### Inherited from

[`Connector`](Connector.md).[`session_`](Connector.md#session_)

***

### target\_?

> `protected` `optional` **target\_?**: [`IListenerInfo`](../interfaces/IListenerInfo.md)

Defined in: [packages/framework/src/lib/rpc/Connector.ts:275](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L275)

#### Inherited from

[`Connector`](Connector.md).[`target_`](Connector.md#target_)

## Accessors

### dataSubject

#### Get Signature

> **get** **dataSubject**(): `Subject`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:266](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L266)

##### Returns

`Subject`\<[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)\>

#### Inherited from

[`Connector`](Connector.md).[`dataSubject`](Connector.md#datasubject)

***

### protocol

#### Get Signature

> **get** **protocol**(): `string`

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:216](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L216)

##### Returns

`string`

#### Overrides

[`Connector`](Connector.md).[`protocol`](Connector.md#protocol)

***

### scope

#### Get Signature

> **get** **scope**(): [`Scope`](Scope.md)\<`unknown`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:270](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L270)

##### Returns

[`Scope`](Scope.md)\<`unknown`\>

#### Inherited from

[`Connector`](Connector.md).[`scope`](Connector.md#scope)

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

#### Inherited from

[`Connector`](Connector.md).[`session`](Connector.md#session)

***

### state

#### Get Signature

> **get** **state**(): [`ConnectorState`](../enumerations/ConnectorState.md)

Defined in: [packages/framework/src/lib/rpc/Connector.ts:246](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L246)

##### Returns

[`ConnectorState`](../enumerations/ConnectorState.md)

#### Inherited from

[`Connector`](Connector.md).[`state`](Connector.md#state)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:250](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L250)

##### Returns

`BehaviorSubject`\<[`ConnectorState`](../enumerations/ConnectorState.md)\>

#### Inherited from

[`Connector`](Connector.md).[`stateSubject`](Connector.md#statesubject)

***

### target

#### Get Signature

> **get** **target**(): [`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:262](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L262)

##### Returns

[`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

#### Inherited from

[`Connector`](Connector.md).[`target`](Connector.md#target)

## Methods

### connect()

> `protected` **connect**(`listenInfo`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:55](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L55)

#### Parameters

##### listenInfo

[`IListenerInfo`](../interfaces/IListenerInfo.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Connector`](Connector.md).[`connect`](Connector.md#connect)

***

### disablePingPong()

> `protected` **disablePingPong**(): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:178](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L178)

#### Returns

`void`

#### Inherited from

[`Connector`](Connector.md).[`disablePingPong`](Connector.md#disablepingpong)

***

### disconnect()

> `protected` **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:142](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L142)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Connector`](Connector.md).[`disconnect`](Connector.md#disconnect)

***

### enablePingPong()

> `protected` **enablePingPong**(): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:147](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L147)

#### Returns

`void`

#### Inherited from

[`Connector`](Connector.md).[`enablePingPong`](Connector.md#enablepingpong)

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

#### Inherited from

[`Connector`](Connector.md).[`handleCommand`](Connector.md#handlecommand)

***

### handleIncomeMessage()

> `protected` **handleIncomeMessage**(`data`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L187)

#### Parameters

##### data

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`handleIncomeMessage`](Connector.md#handleincomemessage)

***

### isAvailable()

> **isAvailable**(): `boolean`

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:51](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L51)

#### Returns

`boolean`

#### Overrides

[`Connector`](Connector.md).[`isAvailable`](Connector.md#isavailable)

***

### off()

> **off**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:96](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L96)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`off`](Connector.md#off)

***

### onCodecSelected()

> **onCodecSelected**(`code`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:80](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L80)

#### Parameters

##### code

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`onCodecSelected`](Connector.md#oncodecselected)

***

### onPingError()

> `protected` **onPingError**(`err`): `void`

Defined in: [packages/framework/src/lib/rpc/Connector.ts:171](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L171)

#### Parameters

##### err

[`ExError`](ExError.md)

#### Returns

`void`

#### Inherited from

[`Connector`](Connector.md).[`onPingError`](Connector.md#onpingerror)

***

### selectCodec()

> **selectCodec**(`code`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:170](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L170)

#### Parameters

##### code

`string`

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Connector`](Connector.md).[`selectCodec`](Connector.md#selectcodec)

***

### send()

> **send**(`packet`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:150](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L150)

#### Parameters

##### packet

[`IRawNetPacket`](../type-aliases/IRawNetPacket.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Connector`](Connector.md).[`send`](Connector.md#send)

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

#### Inherited from

[`Connector`](Connector.md).[`sendCommand`](Connector.md#sendcommand)

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

#### Inherited from

[`Connector`](Connector.md).[`sendNotify`](Connector.md#sendnotify)

***

### sendPing()

> `protected` **sendPing**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:139](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L139)

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`sendPing`](Connector.md#sendping)

***

### sendPong()

> `protected` **sendPong**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:143](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L143)

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`sendPong`](Connector.md#sendpong)

***

### sendRaw()

> **sendRaw**(`payload`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:158](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L158)

#### Parameters

##### payload

`Buffer`

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Connector`](Connector.md).[`sendRaw`](Connector.md#sendraw)

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

#### Inherited from

[`Connector`](Connector.md).[`start`](Connector.md#start)

***

### waitForReady()

> **waitForReady**(`ttlMs`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Connector.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Connector.ts#L57)

#### Parameters

##### ttlMs

`number`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Connector`](Connector.md).[`waitForReady`](Connector.md#waitforready)

***

### register()

> `static` **register**(`manager?`): `void`

Defined in: [packages/framework/src/lib/tcp/TCPConnector.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPConnector.ts#L21)

#### Parameters

##### manager?

[`ProviderManager`](ProviderManager.md)

#### Returns

`void`
