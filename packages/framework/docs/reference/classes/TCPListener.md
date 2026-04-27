[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / TCPListener

# Class: TCPListener

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L20)

## Extends

- [`Listener`](Listener.md)

## Constructors

### Constructor

> **new TCPListener**(`options`, `callback`, `codecs`, `labels?`): `TCPListener`

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:21](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L21)

#### Parameters

##### options

[`ITCPListenerOptions`](../interfaces/ITCPListenerOptions.md)

##### callback

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

##### codecs

[`Codec`](Codec.md)\<`any`\>[]

##### labels?

[`ILabels`](../interfaces/ILabels.md) = `{}`

#### Returns

`TCPListener`

#### Overrides

[`Listener`](Listener.md).[`constructor`](Listener.md#constructor)

## Properties

### callback\_

> `protected` **callback\_**: [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:186](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L186)

#### Inherited from

[`Listener`](Listener.md).[`callback_`](Listener.md#callback_)

***

### codecs\_

> `protected` **codecs\_**: [`Codec`](Codec.md)\<`any`\>[]

Defined in: [packages/framework/src/lib/rpc/Listener.ts:182](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L182)

#### Inherited from

[`Listener`](Listener.md).[`codecs_`](Listener.md#codecs_)

***

### connectionSubject\_

> `protected` **connectionSubject\_**: `Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:181](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L181)

#### Inherited from

[`Listener`](Listener.md).[`connectionSubject_`](Listener.md#connectionsubject_)

***

### connectors\_

> `protected` **connectors\_**: `Map`\<`string`, [`Connector`](Connector.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:185](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L185)

#### Inherited from

[`Listener`](Listener.md).[`connectors_`](Listener.md#connectors_)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`ListenerState`](../enumerations/ListenerState.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:183](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L183)

#### Inherited from

[`Listener`](Listener.md).[`lifeCycle_`](Listener.md#lifecycle_)

***

### weightSubject\_

> `protected` **weightSubject\_**: `BehaviorSubject`\<`number`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:184](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L184)

#### Inherited from

[`Listener`](Listener.md).[`weightSubject_`](Listener.md#weightsubject_)

## Accessors

### connectionSubject

#### Get Signature

> **get** **connectionSubject**(): `Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:165](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L165)

##### Returns

`Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

#### Inherited from

[`Listener`](Listener.md).[`connectionSubject`](Listener.md#connectionsubject)

***

### connectors

#### Get Signature

> **get** **connectors**(): `Map`\<`string`, [`Connector`](Connector.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:169](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L169)

##### Returns

`Map`\<`string`, [`Connector`](Connector.md)\>

#### Inherited from

[`Listener`](Listener.md).[`connectors`](Listener.md#connectors)

***

### exposeHost

#### Get Signature

> **get** **exposeHost**(): `string`

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:102](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L102)

##### Returns

`string`

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:150](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L150)

##### Returns

`string`

#### Inherited from

[`Listener`](Listener.md).[`id`](Listener.md#id)

***

### info

#### Get Signature

> **get** **info**(): [`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:130](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L130)

##### Returns

[`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

#### Inherited from

[`Listener`](Listener.md).[`info`](Listener.md#info)

***

### labels

#### Get Signature

> **get** **labels**(): [`ILabels`](../interfaces/ILabels.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:154](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L154)

##### Returns

[`ILabels`](../interfaces/ILabels.md)

#### Inherited from

[`Listener`](Listener.md).[`labels`](Listener.md#labels)

***

### metaData

#### Get Signature

> **get** **metaData**(): `object`

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:106](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L106)

##### Returns

`object`

###### codecs

> **codecs**: `string`[]

###### endpoint

> **endpoint**: `string`

###### id

> **id**: `string`

###### labels

> **labels**: [`ILabels`](../interfaces/ILabels.md)

###### protocol

> **protocol**: `string` = `'tcp'`

###### state

> **state**: [`ListenerState`](../enumerations/ListenerState.md)

#### Overrides

[`Listener`](Listener.md).[`metaData`](Listener.md#metadata)

***

### scope

#### Get Signature

> **get** **scope**(): [`Scope`](Scope.md)\<`unknown`\> \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:173](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L173)

##### Returns

[`Scope`](Scope.md)\<`unknown`\> \| `undefined`

#### Inherited from

[`Listener`](Listener.md).[`scope`](Listener.md#scope)

***

### state

#### Get Signature

> **get** **state**(): [`ListenerState`](../enumerations/ListenerState.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:142](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L142)

##### Returns

[`ListenerState`](../enumerations/ListenerState.md)

#### Inherited from

[`Listener`](Listener.md).[`state`](Listener.md#state)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`ListenerState`](../enumerations/ListenerState.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:134](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L134)

##### Returns

`BehaviorSubject`\<[`ListenerState`](../enumerations/ListenerState.md)\>

#### Inherited from

[`Listener`](Listener.md).[`stateSubject`](Listener.md#statesubject)

***

### version

#### Get Signature

> **get** **version**(): `string`

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:117](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L117)

##### Returns

`string`

#### Overrides

[`Listener`](Listener.md).[`version`](Listener.md#version)

***

### weight

#### Get Signature

> **get** **weight**(): `number`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:146](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L146)

##### Returns

`number`

#### Inherited from

[`Listener`](Listener.md).[`weight`](Listener.md#weight)

***

### weightSubject

#### Get Signature

> **get** **weightSubject**(): `BehaviorSubject`\<`number`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:138](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L138)

##### Returns

`BehaviorSubject`\<`number`\>

#### Inherited from

[`Listener`](Listener.md).[`weightSubject`](Listener.md#weightsubject)

## Methods

### closeAllConnector()

> `protected` **closeAllConnector**(): `void`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L108)

#### Returns

`void`

#### Inherited from

[`Listener`](Listener.md).[`closeAllConnector`](Listener.md#closeallconnector)

***

### getConnector()

> **getConnector**(`session`): [`Connector`](Connector.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:114](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L114)

#### Parameters

##### session

`string`

#### Returns

[`Connector`](Connector.md) \| `undefined`

#### Inherited from

[`Listener`](Listener.md).[`getConnector`](Listener.md#getconnector)

***

### listen()

> `protected` **listen**(): `Promise`\<[`IListenerInfo`](../interfaces/IListenerInfo.md)\>

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:36](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L36)

#### Returns

`Promise`\<[`IListenerInfo`](../interfaces/IListenerInfo.md)\>

#### Overrides

[`Listener`](Listener.md).[`listen`](Listener.md#listen)

***

### listenRange()

> `protected` **listenRange**(`min`, `max`): `Promise`\<[`IListenerInfo`](../interfaces/IListenerInfo.md)\>

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:50](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L50)

#### Parameters

##### min

`number`

##### max

`number`

#### Returns

`Promise`\<[`IListenerInfo`](../interfaces/IListenerInfo.md)\>

***

### newConnector()

> `protected` **newConnector**(`session`, `connector`): `void`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:66](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L66)

#### Parameters

##### session

`string`

##### connector

[`Connector`](Connector.md)

#### Returns

`void`

#### Inherited from

[`Listener`](Listener.md).[`newConnector`](Listener.md#newconnector)

***

### setWeight()

> **setWeight**(`weight`): `void`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:118](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L118)

#### Parameters

##### weight

`number`

#### Returns

`void`

#### Inherited from

[`Listener`](Listener.md).[`setWeight`](Listener.md#setweight)

***

### shutdown()

> `protected` **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/tcp/TCPListener.ts:86](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/tcp/TCPListener.ts#L86)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Listener`](Listener.md).[`shutdown`](Listener.md#shutdown)

***

### startListen()

> **startListen**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L45)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Listener`](Listener.md).[`startListen`](Listener.md#startlisten)

***

### stopListen()

> **stopListen**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L57)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Listener`](Listener.md).[`stopListen`](Listener.md#stoplisten)
