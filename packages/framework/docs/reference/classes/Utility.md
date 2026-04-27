[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Utility

# Class: Utility

Defined in: [packages/framework/src/utility/Utility.ts:6](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L6)

## Constructors

### Constructor

> **new Utility**(): `Utility`

#### Returns

`Utility`

## Methods

### deepCopy()

> `static` **deepCopy**\<`T`\>(`obj`): `T`

Defined in: [packages/framework/src/utility/Utility.ts:110](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L110)

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### obj

`T`

#### Returns

`T`

***

### formatLogTimeString()

> `static` **formatLogTimeString**(): `string`

Defined in: [packages/framework/src/utility/Utility.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L62)

#### Returns

`string`

***

### hideKeys()

> `static` **hideKeys**\<`T`\>(`obj`, `keys`): `Partial`\<`T`\>

Defined in: [packages/framework/src/utility/Utility.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L9)

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### obj

`T`

##### keys

keyof `T`[]

#### Returns

`Partial`\<`T`\>

***

### isMeaningful()

> `static` **isMeaningful**\<`T`\>(`object`): `object is NonUndefined<T>`

Defined in: [packages/framework/src/utility/Utility.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L18)

#### Type Parameters

##### T

`T`

#### Parameters

##### object

`T`

#### Returns

`object is NonUndefined<T>`

***

### isUndefined()

> `static` **isUndefined**(`object`): `object is undefined`

Defined in: [packages/framework/src/utility/Utility.ts:24](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L24)

#### Parameters

##### object

`any`

#### Returns

`object is undefined`

***

### mapToJSON()

> `static` **mapToJSON**\<`T`\>(`map`): `object`

Defined in: [packages/framework/src/utility/Utility.ts:28](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L28)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### map

`Map`\<`string`, `T`\>

#### Returns

`object`

***

### null()

> `static` **null**(): `void`

Defined in: [packages/framework/src/utility/Utility.ts:7](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L7)

#### Returns

`void`

***

### parseInt()

> `static` **parseInt**(`value`): `number`

Defined in: [packages/framework/src/utility/Utility.ts:32](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L32)

#### Parameters

##### value

`string`

#### Returns

`number`

***

### randomInt()

> `static` **randomInt**(`begin`, `end`): `number`

Defined in: [packages/framework/src/utility/Utility.ts:36](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L36)

#### Parameters

##### begin

`number`

##### end

`number`

#### Returns

`number`

***

### randomOne()

> `static` **randomOne**\<`T`\>(`array`): `T`

Defined in: [packages/framework/src/utility/Utility.ts:43](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L43)

#### Type Parameters

##### T

`T`

#### Parameters

##### array

`T`[]

#### Returns

`T`

***

### randomOneByWeight()

> `static` **randomOneByWeight**\<`T`\>(`array`, `weighter`): `T` \| `null`

Defined in: [packages/framework/src/utility/Utility.ts:48](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/utility/Utility.ts#L48)

#### Type Parameters

##### T

`T`

#### Parameters

##### array

`T`[]

##### weighter

(`ele`) => `number`

#### Returns

`T` \| `null`
