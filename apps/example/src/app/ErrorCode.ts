export enum AppErrorCode {
  ErrUnknown = 'ERR_UNKNOWN',
  ErrLoadConfig = 'ERR_LOAD_CONFIG',
  ErrDatabase = 'ERR_DATABASE',
  ErrConfigNotFound = 'ERR_CONFIG_NOT_FOUND',
  ErrCommandNotFound = 'ERR_COMMAND_NOT_FOUND',
  ErrServiceNotCreated = 'ERR_SERVICE_NOT_CREATED',
  ErrWorkerNotCreated = 'ERR_WORKER_NOT_CREATED',
  ErrComponentNotFound = 'ERR_COMPONENT_NOT_FOUND',
  ErrNoSession = 'ERR_NO_SESSION',
  ErrOauth2TypeNotSupport = 'ERR_OAUTH2_TYPE_NOT_SUPPORT',
  ErrAccountNotFound = 'ERR_ACCOUNT_NOT_FOUND',
  ErrServerInternal = 'ERR_SERVER_INTERNAL',
}

export enum UserErrorCode {
  ErrDuplicateRegister = 'ERR_DUPLICATE_REGISTER',
  ErrUsernameNotFound = 'ERR_USERNAME_NOT_FOUND',
  ErrWrongPassword = 'ERR_WRONG_PASSWORD',
  ErrParametersInvalid = 'ERR_PARAMETERS_INVALID',
  ErrNotLogin = 'ERR_NOT_LOGIN',
  ErrProtectedGroup = 'ERR_PROTECTED_GROUP',
  ErrCanNotCreateRoot = 'ERR_CANT_CREATE_ROOT',
  ErrDuplicateNickname = 'ERR_DUPLICATE_NICKNAME',
  ErrAccountNotFound = 'ERR_ACCOUNT_NOT_FOUND',
  ErrWrongEmailCode = 'ERR_WRONG_EMAIL_CODE',
  ErrAccountDisabled = 'ERR_ACCOUNT_DISABLED',
  ErrDisableSelf = 'ERR_DISABLE_SELF',

  ErrAuthGroupNotFound = 'ERR_AUTH_GROUP_NOT_FOUND',
  ErrAuthGroupNotEmpty = 'ERR_AUTH_GROUP_NOT_EMPTY',

  ErrAuthDeny = 'ERR_AUTH_DENY',

  ErrDatabaseNotFound = 'ERR_DB_NOT_FOUND',
}
