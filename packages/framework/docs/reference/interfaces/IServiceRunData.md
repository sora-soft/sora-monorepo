[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / IServiceRunData

# Interface: IServiceRunData

Defined in: [packages/framework/src/interface/discovery.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L18)

## Extends

- [`IServiceMetaData`](IServiceMetaData.md)

## Properties

### alias?

> `readonly` `optional` **alias?**: `string`

Defined in: [packages/framework/src/interface/discovery.ts:8](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L8)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`alias`](IServiceMetaData.md#alias)

***

### id

> `readonly` **id**: `string`

Defined in: [packages/framework/src/interface/discovery.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L7)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`id`](IServiceMetaData.md#id)

***

### labels

> `readonly` **labels**: [`ILabels`](ILabels.md)

Defined in: [packages/framework/src/interface/discovery.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L15)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`labels`](IServiceMetaData.md#labels)

***

### listeners

> `readonly` **listeners**: `Omit`\<[`IListenerMetaData`](IListenerMetaData.md), `"targetName"` \| `"targetId"`\>[]

Defined in: [packages/framework/src/interface/discovery.ts:19](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L19)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/framework/src/interface/discovery.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L6)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`name`](IServiceMetaData.md#name)

***

### nodeId

> `readonly` **nodeId**: `string`

Defined in: [packages/framework/src/interface/discovery.ts:10](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L10)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`nodeId`](IServiceMetaData.md#nodeid)

***

### startTime

> `readonly` **startTime**: `number`

Defined in: [packages/framework/src/interface/discovery.ts:11](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L11)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`startTime`](IServiceMetaData.md#starttime)

***

### state

> `readonly` **state**: [`WorkerState`](../enumerations/WorkerState.md)

Defined in: [packages/framework/src/interface/discovery.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/interface/discovery.ts#L9)

#### Inherited from

[`IServiceMetaData`](IServiceMetaData.md).[`state`](IServiceMetaData.md#state)
