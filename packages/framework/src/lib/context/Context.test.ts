import 'reflect-metadata';

import {describe, expect, it} from '@jest/globals';

import {MockScope} from '../../test/tools/mock/MockScope.js';
import {Context} from './Context.js';
import {RootScope} from './scope/RootScope.js';

describe('Context', () => {
  describe('run() + current()', () => {
    it('should set scope as current inside callback', () => {
      const scope = new MockScope();
      Context.run(scope, () => {
        expect(Context.current()).toBe(scope);
      });
    });

    it('should return root when outside any scope', () => {
      expect(Context.current()).toBe(Context.root);
    });

    it('should restore previous scope after callback', () => {
      const outer = new MockScope();
      const inner = new MockScope();
      Context.run(outer, () => {
        Context.run(inner, () => {
          expect(Context.current()).toBe(inner);
        });
        expect(Context.current()).toBe(outer);
      });
    });

    it('should build chain from root to current', () => {
      const parent = new MockScope();
      const child = new MockScope();
      Context.run(parent, () => {
        Context.run(child, () => {
          const chain = Context.chain();
          expect(chain).toHaveLength(3);
          expect(chain[0]).toBe(Context.root);
          expect(chain[1]).toBe(parent);
          expect(chain[2]).toBe(child);
        });
      });
    });

    it('should not re-enter same scope if already in chain', () => {
      const scope = new MockScope();
      Context.run(scope, () => {
        const beforeId = Context.current().id;
        Context.run(scope, () => {
          expect(Context.current().id).toBe(beforeId);
        });
      });
    });
  });

  describe('find()', () => {
    it('should find current scope by class', () => {
      const scope = new MockScope();
      Context.run(scope, () => {
        expect(Context.find(MockScope)).toBe(scope);
      });
    });

    it('should find parent scope class in chain', () => {
      const scope = new MockScope();
      Context.run(scope, () => {
        expect(Context.find(RootScope)).toBe(Context.root);
      });
    });

    it('should return null when no match in chain', () => {
      expect(Context.find(MockScope)).toBeNull();
    });

    it('should return first match walking up from current', () => {
      const outer = new MockScope();
      const inner = new MockScope();
      Context.run(outer, () => {
        Context.run(inner, () => {
          expect(Context.find(MockScope)).toBe(inner);
        });
      });
    });
  });

  describe('chain()', () => {
    it('should return [root] when outside any scope', () => {
      expect(Context.chain()).toEqual([Context.root]);
    });

    it('should return chain from root to current', () => {
      const outer = new MockScope();
      const inner = new MockScope();
      Context.run(outer, () => {
        Context.run(inner, () => {
          const chain = Context.chain();
          expect(chain).toHaveLength(3);
          expect(chain[0]).toBe(Context.root);
          expect(chain[1]).toBe(outer);
          expect(chain[2]).toBe(inner);
        });
      });
    });
  });

  describe('bind()', () => {
    it('should bind scope to function', () => {
      const scope = new MockScope();
      const fn = Context.bind(scope, () => Context.current());
      expect(fn()).toBe(scope);
    });

    it('should work outside Context.run', () => {
      const scope = new MockScope();
      const fn = Context.bind(scope, () => Context.current());
      expect(fn()).toBe(scope);
    });

    it('should pass arguments through', () => {
      const scope = new MockScope();
      const fn = Context.bind(scope, (a: number, b: number) => {
        return {scope: Context.current(), sum: a + b};
      });
      const result = fn(1, 2);
      expect(result.scope).toBe(scope);
      expect(result.sum).toBe(3);
    });
  });

  describe('wrap()', () => {
    it('should run function in current scope at call time', () => {
      const fn = Context.wrap(() => Context.current());
      expect(fn()).toBe(Context.root);

      const scope = new MockScope();
      Context.run(scope, () => {
        expect(fn()).toBe(scope);
      });
    });

    it('should pass arguments through', () => {
      const fn = Context.wrap((a: number) => ({scope: Context.current(), a}));
      const result = fn(42);
      expect(result.scope).toBe(Context.root);
      expect(result.a).toBe(42);
    });
  });

  describe('@Context.scopeClass', () => {
    @Context.scopeClass
    class TestSubject {
      scope?: MockScope;
      publicValue = 100;

      getCurrentScopeId(): string | undefined {
        return Context.current()?.id;
      }

      async asyncGetCurrentScopeId(): Promise<string | undefined> {
        await new Promise(r => setTimeout(r, 5));
        return Context.current()?.id;
      }
    }

    it('should enter scope on method call', () => {
      const instance = new TestSubject();
      const scope = new MockScope();
      instance.scope = scope;
      expect(instance.getCurrentScopeId()).toBe(scope.id);
    });

    it('should work without scope set', () => {
      const instance = new TestSubject();
      expect(instance.getCurrentScopeId()).toBe(Context.root.id);
    });

    it('should preserve scope across async boundary', async () => {
      const instance = new TestSubject();
      const scope = new MockScope();
      instance.scope = scope;
      expect(await instance.asyncGetCurrentScopeId()).toBe(scope.id);
    });

    it('should not trigger trap on property access', () => {
      const instance = new TestSubject();
      const scope = new MockScope();
      instance.scope = scope;
      expect(instance.publicValue).toBe(100);
      expect(instance.scope).toBe(scope);
    });

    it('method scope overrides outer Context.run scope', () => {
      const instance = new TestSubject();
      const methodScope = new MockScope();
      instance.scope = methodScope;

      const outerScope = new MockScope();
      Context.run(outerScope, () => {
        expect(instance.getCurrentScopeId()).toBe(methodScope.id);
      });
    });

    it('should support nested scopeClass methods', async () => {
      @Context.scopeClass
      class Outer {
        scope?: MockScope;

        callInner(inner: { getCurrentScopeId: () => string | undefined }) {
          return inner.getCurrentScopeId();
        }

        getOwnScopeId(): string | undefined {
          return Context.current()?.id;
        }
      }

      @Context.scopeClass
      class Inner {
        scope?: MockScope;

        getCurrentScopeId(): string | undefined {
          return Context.current()?.id;
        }
      }

      const outer = new Outer();
      const outerScope = new MockScope();
      outer.scope = outerScope;

      const innerInst = new Inner();
      const innerScope = new MockScope();
      innerInst.scope = innerScope;

      const result = outer.callInner(innerInst);
      expect(result).toBe(innerScope.id);
    });
  });
});
