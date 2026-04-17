import {Context} from '../Context.js';
import {TraceScope} from '../TraceScope.js';

export class RpcClientTraceScope extends TraceScope {
  static create() {
    const trace = Context.find(TraceScope);
    if (!trace) {
      return new RpcClientTraceScope();
    }
    return new RpcClientTraceScope(trace.traceId, trace.spanId, trace.flags, trace.straceState.serialize());
  }
}
