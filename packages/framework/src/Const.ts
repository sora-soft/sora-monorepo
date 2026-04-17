class RPCHeader {
  static readonly RpcIdHeader = 'x-sora-rpc-id';
  static readonly RpcFromIdHeader = 'x-sora-rpc-from-id';
  static readonly RpcSessionHeader = 'x-sora-rpc-session';
  static readonly RPCTraceParent = 'traceparent';
  static readonly RPCTraceState = 'tracestate';
  static readonly RpcServiceId = 'x-sora-rpc-service-id';
}

export {RPCHeader};
