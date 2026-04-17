export enum FrameworkErrorCode {
  ErrFrameworkUnknown = 'ERR_FRAMEWORK_UNKNOWN',
  ErrServiceNotFound = 'ERR_SERVICE_NOT_FOUND',
  ErrWorkerNotFound = 'ERR_WORKER_NOT_FOUND',
  ErrNodeServiceCannotBeClosed = 'ERR_NODE_SERVICE_CANNOT_BE_CLOSED',
  ErrNodeServiceCannotBeCreated = 'ERR_NODE_SERVICE_CANNOT_BE_CREATED',
  ErrComponentOptionsNotSet = 'ERR_COMPONENT_OPTIONS_NOT_SET',
  ErrDuplicatedComponent = 'ERR_DUPLICATED_COMPONENT',
  ErrWorkerState = 'ERR_WORKER_STATE_NOT_READY',
  ErrConnectorDuplicateEnableResponse = 'ERR_CONNECTOR_DUPLICATE_ENABLE_RESPONSE',
  ErrConnectorConnectFailed = 'ERR_CONNECTOR_CONNECT_FAILED',
  ErrSessionNotFound = 'ERR_SESSION_NOT_FOUND',
  ErrRpcMethodNotFound = 'ERR_RPC_METHOD_NOT_FOUND',
  ErrCodecNotFound = 'ERR_CODEC_NOT_FOUND',
  ErrProviderConnectStrategy = 'ERR_PROVIDER_CONNECT_STRATEGY',
  ErrTraceScopeNotFound = 'Err_TRACE_SCOPE_NOT_FOUND',
  ErrWorkerScopeNotFound = 'ERR_WORKER_SCOPE_NOT_FOUND',
}

export enum RPCErrorCode {
  ErrRpcUnknown = 'ERR_RPC_UNKNOWN',
  ErrRpcTimeout = 'ERR_RPC_TIMEOUT',
  ErrRpcTunnelNotAvailable = 'ERR_RPC_TUNNEL_NOT_AVAILABLE',
  ErrRpcSenderNotFound = 'ERR_RPC_SENDER_NOT_FOUND',
  ErrRpcSenderCanNotConnect = 'ERR_RPC_SENDER_CAN_NOT_CONNECT',
  ErrRpcSenderInner = 'ERR_RPC_SENDER_INNER',
  ErrRpcProviderNotAvailable = 'ERR_RPC_PROVIDER_NOT_AVAILABLE',
  ErrRpcMethodNotFound = 'ERR_RPC_METHOD_NOT_FOUND',
  ErrRpcParameterInvalid = 'ERR_RPC_PARAMETER_INVALID',
  ErrRpcServiceNotFound = 'ERR_RPC_SERVICE_NOT_FOUND',
  ErrRpcBodyParseFailed = 'ERR_RPC_BODY_PARSE_FAILED',
  ErrRpcPayloadTooLarge = 'ERR_RPC_PAYLOAD_TOO_LARGE',
  ErrRpcNotSupportOpcode = 'ERR_RPC_NOT_SUPPORT_OPCODE',
  ErrRpcEmptyResponse = 'ERR_RPC_EMPTY_RESPONSE',
  ErrRpcInvalidResponse = 'ERR_RPC_INVALID_RESPONSE',
  ErrRpcRegisterProvider = 'ERR_RPC_PROVIDER_METHOD_NOT_FOUND',
  ErrRpcRegisterMiddleware = 'ERR_RPC_REGISTER_MIDDLEWARE',
  ErrRpcIdNotFound = 'ERR_RPC_ID_NOT_FOUND',
  ErrRpcPingError = 'ERR_RPC_PING_ERROR',
  ErrRpcCodecNotFound = 'ERR_RPC_CODEC_NOT_FOUND',
  ErrRpcConnectorNull = 'ERR_RPC_CONNECTOR_NULL',
}

export enum RetryErrorCode {
  ErrRetryTooManyRetry = 'ERR_RETRY_TOO_MANY_RETRY',
}

export enum TCPErrorCode {
  ErrNoAvailablePort = 'ERR_NO_AVAILABLE_PORT',
  ErrSelectCodecBeforeConnect = 'ERR_SELECT_CODE_BEFORE_CONNECT',
}

export enum TraceErrorCode {
  ErrDuplicateScopeRun = 'ERR_DUPLICATE_SCOPE_RUN',
  ErrDuplicateScopeStart = 'ERR_DUPLICATE_SCOPE_START',
  ErrDuplicateTraceEnd = 'ERR_DUPLICATE_SCOPE_END',
}
