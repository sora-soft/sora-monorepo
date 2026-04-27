[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Logger

# Class: Logger

Defined in: [packages/framework/src/lib/logger/Logger.ts:75](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L75)

## Extended by

- [`FrameworkLogger`](FrameworkLogger.md)
- [`RPCLogger`](RPCLogger.md)

## Constructors

### Constructor

> **new Logger**(`options`): `Logger`

Defined in: [packages/framework/src/lib/logger/Logger.ts:96](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L96)

#### Parameters

##### options

[`ILoggerOptions`](../interfaces/ILoggerOptions.md)

#### Returns

`Logger`

## Accessors

### category

#### Get Signature

> **get** **category**(): `CategoryLogger`

Defined in: [packages/framework/src/lib/logger/Logger.ts:187](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L187)

##### Returns

`CategoryLogger`

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

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/Logger.ts:143](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L143)

#### Returns

`Promise`\<`void`\>

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

***

### pipe()

> **pipe**(`output`): `Logger`

Defined in: [packages/framework/src/lib/logger/Logger.ts:138](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L138)

#### Parameters

##### output

[`LoggerOutput`](LoggerOutput.md)

#### Returns

`Logger`

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

***

### errorMessage()

> `static` **errorMessage**(`e`): `Error` \| [`ExError`](ExError.md) \| \{ `args`: [`ErrorArgs`](../type-aliases/ErrorArgs.md); `code`: `string`; `message`: `string`; `name`: `string`; `stack`: `string`[]; \}

Defined in: [packages/framework/src/lib/logger/Logger.ts:86](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/Logger.ts#L86)

#### Parameters

##### e

`Error` \| [`ExError`](ExError.md)

#### Returns

`Error` \| [`ExError`](ExError.md) \| \{ `args`: [`ErrorArgs`](../type-aliases/ErrorArgs.md); `code`: `string`; `message`: `string`; `name`: `string`; `stack`: `string`[]; \}
