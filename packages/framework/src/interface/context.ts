import type {Scope} from '../lib/context/Scope.js';

export type ScopeBuilder<S extends Scope<unknown> = Scope<unknown>> = () => S;
