[**@sora-soft/framework API Reference v2.0.0**](../README.md)

***

[@sora-soft/framework API Reference](../globals.md) / Context

# Class: Context

Defined in: [packages/framework/src/lib/context/Context.ts:14](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L14)

## Constructors

### Constructor

> **new Context**(): `Context`

#### Returns

`Context`

## Properties

### root

> `static` **root**: [`RootScope`](RootScope.md)

Defined in: [packages/framework/src/lib/context/Context.ts:50](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L50)

## Methods

### bind()

> `static` **bind**\<`T`, `Args`, `R`\>(`scope`, `func`): (...`args`) => `R`

Defined in: [packages/framework/src/lib/context/Context.ts:66](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L66)

#### Type Parameters

##### T

`T` *extends* [`Scope`](Scope.md)\<`unknown`\>

##### Args

`Args` *extends* `any`[]

##### R

`R`

#### Parameters

##### scope

`T`

##### func

(...`args`) => `R`

#### Returns

(...`args`) => `R`

***

### chain()

> `static` **chain**(): [`Scope`](Scope.md)\<`unknown`\>[]

Defined in: [packages/framework/src/lib/context/Context.ts:93](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L93)

#### Returns

[`Scope`](Scope.md)\<`unknown`\>[]

***

### current()

> `static` **current**\<`T`\>(): [`Scope`](Scope.md)\<`T`\>

Defined in: [packages/framework/src/lib/context/Context.ts:62](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L62)

#### Type Parameters

##### T

`T`

#### Returns

[`Scope`](Scope.md)\<`T`\>

***

### find()

> `static` **find**\<`T`\>(`targetClass`): `T` \| `null`

Defined in: [packages/framework/src/lib/context/Context.ts:78](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L78)

#### Type Parameters

##### T

`T`

#### Parameters

##### targetClass

`AbstractConstructor`\<`T`\>

#### Returns

`T` \| `null`

***

### run()

> `static` **run**\<`T`, `R`\>(`scope`, `callback`): `R`

Defined in: [packages/framework/src/lib/context/Context.ts:52](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L52)

#### Type Parameters

##### T

`T`

##### R

`R`

#### Parameters

##### scope

[`Scope`](Scope.md)\<`T`\>

##### callback

() => `R`

#### Returns

`R`

***

### scopeClass()

> `static` **scopeClass**\<`T`\>(`target`): `T`

Defined in: [packages/framework/src/lib/context/Context.ts:15](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L15)

#### Type Parameters

##### T

`T` *extends* [`AbstractConstructorWithScope`](../type-aliases/AbstractConstructorWithScope.md)

#### Parameters

##### target

`T`

#### Returns

`T`

***

### wrap()

> `static` **wrap**\<`Args`, `R`\>(`func`): (...`args`) => `R`

Defined in: [packages/framework/src/lib/context/Context.ts:72](https://github.com/sora-soft/sora-node/blob/b502ee5b534689cc7d2350abf8d8b0ff780961fe/packages/framework/src/lib/context/Context.ts#L72)

#### Type Parameters

##### Args

`Args` *extends* `any`[]

##### R

`R`

#### Parameters

##### func

(...`args`) => `R`

#### Returns

(...`args`) => `R`
