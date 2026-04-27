[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Component

# Abstract Class: Component

Defined in: [packages/framework/src/lib/Component.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L15)

## Constructors

### Constructor

> **new Component**(): `Component`

Defined in: [packages/framework/src/lib/Component.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L16)

#### Returns

`Component`

## Properties

### id\_

> `protected` **id\_**: `string`

Defined in: [packages/framework/src/lib/Component.ts:98](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L98)

***

### name\_

> `protected` **name\_**: `string`

Defined in: [packages/framework/src/lib/Component.ts:99](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L99)

***

### options\_

> `protected` **options\_**: [`IComponentOptions`](../interfaces/IComponentOptions.md)

Defined in: [packages/framework/src/lib/Component.ts:100](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L100)

***

### ref\_

> `protected` **ref\_**: [`LifeRef`](LifeRef.md)\<`void`\>

Defined in: [packages/framework/src/lib/Component.ts:101](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L101)

## Accessors

### id

#### Get Signature

> **get** **id**(): `string`

Defined in: [packages/framework/src/lib/Component.ts:65](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L65)

##### Returns

`string`

***

### meta

#### Get Signature

> **get** **meta**(): [`IComponentMetaData`](../interfaces/IComponentMetaData.md)

Defined in: [packages/framework/src/lib/Component.ts:85](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L85)

##### Returns

[`IComponentMetaData`](../interfaces/IComponentMetaData.md)

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/Component.ts:69](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L69)

##### Returns

`string`

#### Set Signature

> **set** **name**(`value`): `void`

Defined in: [packages/framework/src/lib/Component.ts:73](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L73)

##### Parameters

###### value

`string`

##### Returns

`void`

***

### options

#### Get Signature

> **get** **options**(): [`IComponentOptions`](../interfaces/IComponentOptions.md)

Defined in: [packages/framework/src/lib/Component.ts:81](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L81)

##### Returns

[`IComponentOptions`](../interfaces/IComponentOptions.md)

***

### ready

#### Get Signature

> **get** **ready**(): `boolean`

Defined in: [packages/framework/src/lib/Component.ts:77](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L77)

##### Returns

`boolean`

***

### scope

#### Get Signature

> **get** **scope**(): [`ComponentScope`](ComponentScope.md)

Defined in: [packages/framework/src/lib/Component.ts:94](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L94)

##### Returns

[`ComponentScope`](ComponentScope.md)

***

### version

#### Get Signature

> **get** `abstract` **version**(): `string`

Defined in: [packages/framework/src/lib/Component.ts:63](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L63)

##### Returns

`string`

## Methods

### connect()

> `abstract` `protected` **connect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Component.ts:31](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L31)

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> `abstract` `protected` **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Component.ts:46](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L46)

#### Returns

`Promise`\<`void`\>

***

### loadOptions()

> **loadOptions**(`options`): `void`

Defined in: [packages/framework/src/lib/Component.ts:26](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L26)

#### Parameters

##### options

[`IComponentOptions`](../interfaces/IComponentOptions.md)

#### Returns

`void`

***

### setOptions()

> `abstract` `protected` **setOptions**(`options`): `void`

Defined in: [packages/framework/src/lib/Component.ts:25](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L25)

#### Parameters

##### options

[`IComponentOptions`](../interfaces/IComponentOptions.md)

#### Returns

`void`

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Component.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L32)

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Component.ts:47](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Component.ts#L47)

#### Returns

`Promise`\<`void`\>
