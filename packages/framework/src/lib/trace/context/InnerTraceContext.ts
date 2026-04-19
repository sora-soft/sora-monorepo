import {Trace} from '../Trace.js';
import {TraceContext} from '../TraceContext.js';

export class InnerTraceContext extends TraceContext {
  static create() {
    const trace = Trace.current();
    if (trace) {
      return new InnerTraceContext(trace.traceId, trace.spanId, trace.flags, trace.traceState.serialize());
    }
    return new InnerTraceContext();
  }
}
