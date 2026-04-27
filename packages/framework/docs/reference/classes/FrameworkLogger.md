[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / FrameworkLogger

# Class: FrameworkLogger

Defined in: [packages/framework/src/lib/FrameworkLogger.ts:3](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/FrameworkLogger.ts#L3)

## Extends

- [`Logger`](Logger.md)

## Constructors

### Constructor

> **new FrameworkLogger**(): `FrameworkLogger`

Defined in: [packages/framework/src/lib/FrameworkLogger.ts:4](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/FrameworkLogger.ts#L4)

#### Returns

`FrameworkLogger`

#### Overrides

[`Logger`](Logger.md).[`constructor`](Logger.md#constructor)

## Accessors

### category

#### Get Signature

> **get** **category**(): `CategoryLogger`

Defined in: [packages/framework/src/lib/logger/Logger.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L187)

##### Returns

`CategoryLogger`

#### Inherited from

[`Logger`](Logger.md).[`category`](Logger.md#category)

## Methods

### debug()

> **debug**(`category`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:102](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L102)

#### Parameters

##### category

`string`

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`debug`](Logger.md#debug)

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/Logger.ts:143](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L143)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Logger`](Logger.md).[`end`](Logger.md#end)

***

### error()

> **error**(`category`, `error`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:122](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L122)

#### Parameters

##### category

`string`

##### error

`Error` \| [`ExError`](ExError.md)

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`error`](Logger.md#error)

***

### fatal()

> **fatal**(`category`, `error`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:118](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L118)

#### Parameters

##### category

`string`

##### error

`Error`

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`fatal`](Logger.md#fatal)

***

### info()

> **info**(`category`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:106](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L106)

#### Parameters

##### category

`string`

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`info`](Logger.md#info)

***

### pipe()

> **pipe**(`output`): `FrameworkLogger`

Defined in: [packages/framework/src/lib/logger/Logger.ts:138](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L138)

#### Parameters

##### output

[`LoggerOutput`](LoggerOutput.md)

#### Returns

`FrameworkLogger`

#### Inherited from

[`Logger`](Logger.md).[`pipe`](Logger.md#pipe)

***

### success()

> **success**(`category`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:114](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L114)

#### Parameters

##### category

`string`

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`success`](Logger.md#success)

***

### warn()

> **warn**(`category`, `content`, `boundaryFn?`): `void`

Defined in: [packages/framework/src/lib/logger/Logger.ts:110](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L110)

#### Parameters

##### category

`string`

##### content

`unknown`

##### boundaryFn?

`Function` = `...`

#### Returns

`void`

#### Inherited from

[`Logger`](Logger.md).[`warn`](Logger.md#warn)

***

### errorMessage()

> `static` **errorMessage**(`e`): `Error` \| [`ExError`](ExError.md) \| \{ `args`: [`ErrorArgs`](../type-aliases/ErrorArgs.md); `code`: `string`; `message`: `string`; `name`: `string`; `stack`: `string`[]; \}

Defined in: [packages/framework/src/lib/logger/Logger.ts:86](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L86)

#### Parameters

##### e

`Error` \| [`ExError`](ExError.md)

#### Returns

`Error` \| [`ExError`](ExError.md) \| \{ `args`: [`ErrorArgs`](../type-aliases/ErrorArgs.md); `code`: `string`; `message`: `string`; `name`: `string`; `stack`: `string`[]; \}

#### Inherited from

[`Logger`](Logger.md).[`errorMessage`](Logger.md#errormessage)
