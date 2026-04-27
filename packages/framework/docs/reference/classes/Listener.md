[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Listener

# Abstract Class: Listener

Defined in: [packages/framework/src/lib/rpc/Listener.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L32)

## Extended by

- [`TCPListener`](TCPListener.md)

## Constructors

### Constructor

> **new Listener**(`callback`, `codecs`, `labels?`): `Listener`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:33](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L33)

#### Parameters

##### callback

[`ListenerCallback`](../type-aliases/ListenerCallback.md)

##### codecs

[`Codec`](Codec.md)\<`any`\>[]

##### labels?

[`ILabels`](../interfaces/ILabels.md) = `{}`

#### Returns

`Listener`

## Properties

### callback\_

> `protected` **callback\_**: [`ListenerCallback`](../type-aliases/ListenerCallback.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:186](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L186)

***

### codecs\_

> `protected` **codecs\_**: [`Codec`](Codec.md)\<`any`\>[]

Defined in: [packages/framework/src/lib/rpc/Listener.ts:182](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L182)

***

### connectionSubject\_

> `protected` **connectionSubject\_**: `Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:181](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L181)

***

### connectors\_

> `protected` **connectors\_**: `Map`\<`string`, [`Connector`](Connector.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:185](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L185)

***

### lifeCycle\_

> `protected` **lifeCycle\_**: [`LifeCycle`](LifeCycle.md)\<[`ListenerState`](../enumerations/ListenerState.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:183](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L183)

***

### weightSubject\_

> `protected` **weightSubject\_**: `BehaviorSubject`\<`number`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:184](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L184)

## Accessors

### connectionSubject

#### Get Signature

> **get** **connectionSubject**(): `Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:165](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L165)

##### Returns

`Subject`\<[`IListenerConnectionEvent`](../interfaces/IListenerConnectionEvent.md)\>

***

### connectors

#### Get Signature

> **get** **connectors**(): `Map`\<`string`, [`Connector`](Connector.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:169](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L169)

##### Returns

`Map`\<`string`, [`Connector`](Connector.md)\>

***

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:150](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L150)

##### Returns

`string`

***

### info

#### Get Signature

> **get** **info**(): [`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:130](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L130)

##### Returns

[`IListenerInfo`](../interfaces/IListenerInfo.md) \| `undefined`

***

### labels

#### Get Signature

> **get** **labels**(): [`ILabels`](../interfaces/ILabels.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:154](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L154)

##### Returns

[`ILabels`](../interfaces/ILabels.md)

***

### metaData

#### Get Signature

> **get** `abstract` **metaData**(): [`IListenerInfo`](../interfaces/IListenerInfo.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:179](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L179)

##### Returns

[`IListenerInfo`](../interfaces/IListenerInfo.md)

***

### scope

#### Get Signature

> **get** **scope**(): [`Scope`](Scope.md)\<`unknown`\> \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:173](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L173)

##### Returns

[`Scope`](Scope.md)\<`unknown`\> \| `undefined`

***

### state

#### Get Signature

> **get** **state**(): [`ListenerState`](../enumerations/ListenerState.md)

Defined in: [packages/framework/src/lib/rpc/Listener.ts:142](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L142)

##### Returns

[`ListenerState`](../enumerations/ListenerState.md)

***

### stateSubject

#### Get Signature

> **get** **stateSubject**(): `BehaviorSubject`\<[`ListenerState`](../enumerations/ListenerState.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:134](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L134)

##### Returns

`BehaviorSubject`\<[`ListenerState`](../enumerations/ListenerState.md)\>

***

### version

#### Get Signature

> **get** `abstract` **version**(): `string`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:177](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L177)

##### Returns

`string`

***

### weight

#### Get Signature

> **get** **weight**(): `number`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:146](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L146)

##### Returns

`number`

***

### weightSubject

#### Get Signature

> **get** **weightSubject**(): `BehaviorSubject`\<`number`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:138](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L138)

##### Returns

`BehaviorSubject`\<`number`\>

## Methods

### closeAllConnector()

> `protected` **closeAllConnector**(): `void`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:108](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L108)

#### Returns

`void`

***

### getConnector()

> **getConnector**(`session`): [`Connector`](Connector.md) \| `undefined`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:114](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L114)

#### Parameters

##### session

`string`

#### Returns

[`Connector`](Connector.md) \| `undefined`

***

### listen()

> `abstract` `protected` **listen**(): `Promise`\<[`IListenerInfo`](../interfaces/IListenerInfo.md)\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:43](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L43)

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

***

### setWeight()

> **setWeight**(`weight`): `void`

Defined in: [packages/framework/src/lib/rpc/Listener.ts:118](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L118)

#### Parameters

##### weight

`number`

#### Returns

`void`

***

### shutdown()

> `abstract` `protected` **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:55](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L55)

#### Returns

`Promise`\<`void`\>

***

### startListen()

> **startListen**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:45](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L45)

#### Returns

`Promise`\<`void`\>

***

### stopListen()

> **stopListen**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/rpc/Listener.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/rpc/Listener.ts#L57)

#### Returns

`Promise`\<`void`\>
