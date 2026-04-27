[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / ConsoleOutput

# Class: ConsoleOutput

Defined in: [packages/framework/src/lib/logger/ConsoleOutput.ts:14](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/ConsoleOutput.ts#L14)

## Extends

- [`LoggerOutput`](LoggerOutput.md)

## Constructors

### Constructor

> **new ConsoleOutput**(`options`): `ConsoleOutput`

Defined in: [packages/framework/src/lib/logger/ConsoleOutput.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/ConsoleOutput.ts#L15)

#### Parameters

##### options

[`IConsoleOutputOptions`](../interfaces/IConsoleOutputOptions.md)

#### Returns

`ConsoleOutput`

#### Overrides

[`LoggerOutput`](LoggerOutput.md).[`constructor`](LoggerOutput.md#constructor)

## Properties

### consoleOptions\_

> `protected` **consoleOptions\_**: [`IConsoleOutputOptions`](../interfaces/IConsoleOutputOptions.md)

Defined in: [packages/framework/src/lib/logger/ConsoleOutput.ts:57](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/ConsoleOutput.ts#L57)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/ConsoleOutput.ts:55](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/ConsoleOutput.ts#L55)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`LoggerOutput`](LoggerOutput.md).[`end`](LoggerOutput.md#end)

***

### log()

> **log**(`log`): `void`

Defined in: [packages/framework/src/lib/logger/LoggerOutput.ts:18](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/LoggerOutput.ts#L18)

#### Parameters

##### log

[`ILoggerData`](../interfaces/ILoggerData.md)

#### Returns

`void`

#### Inherited from

[`LoggerOutput`](LoggerOutput.md).[`log`](LoggerOutput.md#log)

***

### output()

> **output**(`data`): `Promise`\<`void`\>

Defined in: [packages/framework/src/lib/logger/ConsoleOutput.ts:20](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/logger/ConsoleOutput.ts#L20)

#### Parameters

##### data

[`ILoggerData`](../interfaces/ILoggerData.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`LoggerOutput`](LoggerOutput.md).[`output`](LoggerOutput.md#output)
