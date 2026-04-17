import {invalidSpanId, invalidTraceId, TraceScope} from '../TraceScope.js';

export class RpcServerTraceScope extends TraceScope {
  static create(traceparent?: string, tracestate?: string) {
    if (!traceparent)
      return new RpcServerTraceScope();

    // W3C 官方推荐的严格正则校验
    const traceparentRegex = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
    const match = traceparent.match(traceparentRegex);

    if (!match)
      return new RpcServerTraceScope();

    const [, traceId, parentSpanId, traceFlags] = match;
    if (traceId === invalidTraceId || parentSpanId === invalidSpanId) {
      return new RpcServerTraceScope();
    }

    const flags = parseInt(traceFlags, 16);

    return new RpcServerTraceScope(traceId, parentSpanId, flags, tracestate);
  }
}
