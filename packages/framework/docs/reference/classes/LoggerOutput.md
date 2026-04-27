[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / LoggerOutput

# Abstract Class: LoggerOutput

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:9](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L9)

## Extended by

- [`ConsoleOutput`](ConsoleOutput.md)

## Constructors

### Constructor

> **new LoggerOutput**(`options`): `LoggerOutput`

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:10](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L10)

#### Parameters

##### options

[`ILoggerOutputOptions`](../interfaces/ILoggerOutputOptions.md)

#### Returns

`LoggerOutput`

## Methods

### end()

> `abstract` **end**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:17](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L17)

#### Returns

`Promise`\<`void`\>

***

### log()

> **log**(`log`): `void`

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L18)

#### Parameters

##### log

[`ILoggerData`](../interfaces/ILoggerData.md)

#### Returns

`void`

***

### output()

> `abstract` `protected` **output**(`log`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:16](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L16)

#### Parameters

##### log

[`ILoggerData`](../interfaces/ILoggerData.md)

#### Returns

`Promise`\<`void`\>
