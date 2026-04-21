/**
 * @soraExport
 */
export enum AppErrorCode {
  ErrUnknown = 'ERR_UNKNOWN',
  ErrLoadConfig = 'ERR_LOAD_CONFIG',
  ErrConfigNotFound = 'ERR_CONFIG_NOT_FOUND',
  ErrCommandNotFound = 'ERR_COMMAND_NOT_FOUND',
  ErrServiceNotCreated = 'ERR_SERVICE_NOT_CREATED',
  ErrWorkerNotCreated = 'ERR_WORKER_NOT_CREATED',
  ErrComponentNotFound = 'ERR_COMPONENT_NOT_FOUND',
}

/**
 * @soraExport
 */
export enum UserErrorCode {
  ErrParametersInvalid = 'ERR_PARAMETERS_INVALID',
}
