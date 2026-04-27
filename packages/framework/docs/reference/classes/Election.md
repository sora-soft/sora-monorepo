[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Election

# Abstract Class: Election

Defined in: [packages/framework/src/lib/Election.ts:3](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L3)

## Constructors

### Constructor

> **new Election**(`name`): `Election`

Defined in: [packages/framework/src/lib/Election.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L4)

#### Parameters

##### name

`string`

#### Returns

`Election`

## Accessors

### id

#### Get Signature

> **get** **id**(): `string` \| `undefined`

Defined in: [packages/framework/src/lib/Election.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L17)

##### Returns

`string` \| `undefined`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/framework/src/lib/Election.ts:13](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L13)

##### Returns

`string`

## Methods

### campaign()

> `abstract` **campaign**(`id`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Election.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L8)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### leader()

> `abstract` **leader**(): `Promise`\<`string` \| `undefined`\>

Defined in: [packages/framework/src/lib/Election.ts:10](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L10)

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### observer()

> `abstract` **observer**(): `BehaviorSubject`\<`string` \| `undefined`\>

Defined in: [packages/framework/src/lib/Election.ts:11](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L11)

#### Returns

`BehaviorSubject`\<`string` \| `undefined`\>

***

### resign()

> `abstract` **resign**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/Election.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/Election.ts#L9)

#### Returns

`Promise`\<`void`\>
