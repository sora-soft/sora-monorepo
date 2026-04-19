import {Trace} from '../Trace.js';
import {TraceContext} from '../TraceContext.js';

export class RpcClientTraceContext extends TraceContext {
  static create() {
    const trace = Trace.current();
    if (!trace) {
      return new RpcClientTraceContext();
    }
    return new RpcClientTraceContext(trace.traceId, trace.spanId, trace.flags, trace.traceState.serialize());
  }
}
