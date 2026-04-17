export enum WorkerState {
  Init = 1,
  Pending,
  Ready,
  Stopping,
  Stopped,
  Error = 100,
}

export enum WorkerStopReason {}

export enum ListenerState {
  Init = 1,
  Pending,
  Ready,
  Stopping,
  Stopped,
  Error = 100,
}

export enum OPCode {
  Request = 1,
  Response = 2,
  Notify = 3,
  Command = 4,
}

export enum ConnectorState {
  Init = 1,
  Connecting,
  Pending, // 等待协商
  Ready,
  Stopping,
  Stopped,
  Error = 100,
}

export enum ConnectorCommand {
  Off = 'off',
  Error = 'error',
  Ping = 'ping',
  Pong = 'pong',
  Close = 'close',
}

