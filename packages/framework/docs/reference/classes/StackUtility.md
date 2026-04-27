[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / StackUtility

# Class: StackUtility

Defined in: [packages/framework/src/utility/Utility.ts:218](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L218)

## Constructors

### Constructor

> **new StackUtility**(): `StackUtility`

#### Returns

`StackUtility`

## Methods

### findNearestStack()

> `static` **findNearestStack**(`out`): `StackFrame`

Defined in: [packages/framework/src/utility/Utility.ts:240](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L240)

#### Parameters

##### out

`string`

#### Returns

`StackFrame`

***

### formatFileName()

> `static` **formatFileName**(`filePath`): `string`

Defined in: [packages/framework/src/utility/Utility.ts:261](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L261)

#### Parameters

##### filePath

`string`

#### Returns

`string`

***

### getInstantiationStack()

> `static` **getInstantiationStack**(`targetConstructor`): `StackFrame`

Defined in: [packages/framework/src/utility/Utility.ts:252](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L252)

#### Parameters

##### targetConstructor

`Function`

#### Returns

`StackFrame`

***

### getStack()

> `static` **getStack**(): `string`[]

Defined in: [packages/framework/src/utility/Utility.ts:219](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L219)

#### Returns

`string`[]

***

### getStackFile()

> `static` **getStackFile**(`depth`): `string`

Defined in: [packages/framework/src/utility/Utility.ts:233](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L233)

#### Parameters

##### depth

`number`

#### Returns

`string`

***

### getStackPosition()

> `static` **getStackPosition**(`depth`): `string`

Defined in: [packages/framework/src/utility/Utility.ts:226](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L226)

#### Parameters

##### depth

`number`

#### Returns

`string`
