import 'reflect-metadata';

import {describe, expect, it} from '@jest/globals';

import {MockScope} from '../../test/tools/mock/MockScope.js';

describe('Scope', () => {
  describe('id and store', () => {
    it('should have id set from constructor', () => {
      const scope = new MockScope();
      expect(scope.id).toBeDefined();
      expect(typeof scope.id).toBe('string');
    });

    it('should have empty store by default', () => {
      const scope = new MockScope();
      expect(scope.store).toEqual({});
    });

    it('should update store via setStore', () => {
      const scope = new MockScope();
      scope.setStore({key: 'value'});
      expect(scope.store).toEqual({key: 'value'});
    });

    it('should have stack trace', () => {
      const scope = new MockScope();
      expect(scope.stack).toBeDefined();
      expect(typeof scope.stack).toBe('string');
    });
  });
});
