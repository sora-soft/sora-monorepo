import type {AsyncLocalStorage} from 'async_hooks';
import crypto from 'crypto';

import {TraceErrorCode} from '../../ErrorCode.js';
import {ExError} from '../../utility/ExError.js';
import {NanoTime} from '../../utility/Utility.js';
import {Trace} from './Trace.js';
import {TraceError} from './TraceError.js';

export interface ITraceScopeStore {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceState: TraceState;
}

export const invalidTraceId = '00000000000000000000000000000000';
export const invalidSpanId = '0000000000000000';

export enum TraceFlag {
  Sampled = 1,
  NotSampled = 0,
}

class TraceIdGenerator {
  static generateTraceId(): string {
    let traceId = crypto.randomBytes(16).toString('hex');
    while (traceId === invalidTraceId) {
      traceId = crypto.randomBytes(16).toString('hex');
    }

    return traceId;
  }

  static generateSpanId(): string {
    let spanId = crypto.randomBytes(8).toString('hex');

    while (spanId === invalidSpanId) {
      spanId = crypto.randomBytes(8).toString('hex');
    }

    return spanId;
  }
}

export class TraceState {
  private static readonly MaxKeyValuePairs = 32;

  private states: Array<{ key: string; value: string }> = [];

  constructor(headerValue?: string) {
    if (headerValue) {
      this.parse(headerValue);
    }
  }

  private parse(headerValue: string): void {
    const pairs = headerValue.split(',').map(s => s.trim()).filter(s => s.length > 0);

    for (const pair of pairs) {
      const equalIndex = pair.indexOf('=');
      if (equalIndex === -1) continue; // 非法格式，忽略

      const key = pair.substring(0, equalIndex).trim();
      const value = pair.substring(equalIndex + 1).trim();

      // 基本校验：简单的非空校验。严格的 W3C 校验对字符范围有要求，这里做轻量级处理
      if (key && value && this.states.length < TraceState.MaxKeyValuePairs) {
        this.states.push({key, value});
      }
    }
  }

  serialize(): string {
    return this.states.map(s => `${s.key}=${s.value}`).join(',');
  }

  get(key: string): string | undefined {
    const state = this.states.find(s => s.key === key);
    return state?.value;
  }

  set(key: string, value: string): void {
    this.remove(key);

    this.states.unshift({key, value});

    if (this.states.length > TraceState.MaxKeyValuePairs) {
      this.states.pop();
    }
  }

  remove(key: string): void {
    const index = this.states.findIndex(s => s.key === key);
    if (index !== -1) {
      this.states.splice(index, 1);
    }
  }

  isEmpty(): boolean {
    return this.states.length === 0;
  }
}

export abstract class TraceContext {
  constructor(traceId?: string, parentSpanId?: string, flags?: number, traceState?: string) {
    if (!parentSpanId) {
      const parent = Trace.current();
      if (parent) {
        parentSpanId = parent.spanId;
        traceId = parent.traceId;
      }
    }
    if (!traceId) {
      traceId = TraceIdGenerator.generateTraceId();
    }

    this.traceId_ = traceId;
    this.spanId_ = TraceIdGenerator.generateSpanId();
    this.parentSpanId_ = parentSpanId;
    this.traceState_ = new TraceState(traceState);
    this.flags_ = flags ?? TraceFlag.Sampled;
    this.startNanoTime_ = 0n;
    this.endNanoTime_ = 0n;
    this.attribute_ = new Map();
  }

  toRPCTraceParentHeader() {
    return `00-${this.traceId}-${this.spanId}-${this.flags.toString(16).padStart(2, '0')}`;
  }

  toRPCTraceStateHeader() {
    return this.traceState_.serialize();
  }

  run<R>(storage: AsyncLocalStorage<TraceContext>, callback: () => R): R {
    this.onStart();
    try {
      const ret = storage.run(this, callback);
      if (ret instanceof Promise) {
        ret.catch((err) => {
          this.onError(err);
        }).finally(() => {
          this.onEnd();
        });
      } else {
        this.onEnd();
      }

      return ret;
    } catch (err) {
      this.onError(ExError.fromError(err as Error));
      throw err;
    }
  }

  private onStart() {
    if (this.endNanoTime_) {
      throw new TraceError(TraceErrorCode.ErrDuplicateScopeStart, 'trace scope.start can only be called once');
    }
    this.startNanoTime_ = NanoTime.now();
  }

  private onEnd() {
    if (this.endNanoTime_) {
      throw new TraceError(TraceErrorCode.ErrDuplicateTraceEnd, 'trace scope.end can only be called once');
    }
    this.endNanoTime_ = NanoTime.now();
  }

  private onError(err: ExError) {
    this.error_ = err;
  }

  get traceId() {
    return this.traceId_;
  }

  get spanId() {
    return this.spanId_;
  }

  get parentSpanId() {
    return this.parentSpanId_;
  }

  get flags() {
    return this.flags_;
  }

  set flags(value: TraceFlag) {
    this.flags_ = value;
  }

  get finished() {
    return this.endNanoTime_ > 0n;
  }

  get traceState() {
    return this.traceState_;
  }

  get startNanoTime() {
    return this.startNanoTime_;
  }

  get endNanoTime() {
    return this.endNanoTime_;
  }

  get error() {
    return this.error_;
  }

  get attribute() {
    return this.attribute_;
  }

  private traceId_: string;
  private spanId_: string;
  private parentSpanId_?: string;
  private traceState_: TraceState;
  private flags_: TraceFlag;
  private startNanoTime_: bigint;
  private endNanoTime_: bigint;
  private error_?: ExError;
  private attribute_: Map<string, string>;
}
