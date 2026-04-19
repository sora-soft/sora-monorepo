import {Connector, ConnectorState, ExError, type IConnectorPingOptions, type IListenerInfo, type IRawNetPacket, Logger, NodeTime, type ProviderManager, Retry, RetryEvent, RPCError, RPCErrorCode, Runtime} from '@sora-soft/framework';
import typia from 'typia';
import util from 'util';
import WebSocket from 'ws';

class WebSocketConnector extends Connector {
  static register(manager?: ProviderManager) {
    (manager || Runtime.pvdManager).registerSender('ws', () => {
      return new WebSocketConnector();
    });
  }

  constructor(socket?: WebSocket, endpoint?: string) {
    super({ping: {enabled: true}});
    this.socket_ = null;
    if (socket && endpoint) {
      this.socket_ = socket;
      this.bindSocketEvent(this.socket_);
      this.lifeCycle_.setState(ConnectorState.Ready);
      this.target_ = {
        protocol: this.protocol,
        endpoint,
        labels: {},
        codecs: [],
      };
    }
  }

  get pingOptions(): IConnectorPingOptions {
    return {
      enabled: true,
      timeout: NodeTime.second(5),
    };
  }

  async selectCodec(code: string) {
    if (!this.socket_)
      throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'websocket socket is not found', {endpoint: this.target_?.endpoint});

    this.socket_.send(`${code}\n`);
  }

  protected async connect(listenInfo: IListenerInfo) {
    if (this.isAvailable())
      return;

    const retry = new Retry(async () => {
      return new Promise<void>((resolve, reject) => {
        Runtime.frameLogger.info('connector.websocket', {event: 'connector-connect', endpoint: listenInfo.endpoint});

        this.socket_ = new WebSocket(listenInfo.endpoint);
        const handlerError = (err: Error) => {
          reject(err);
        };
        this.socket_.once('error', handlerError);
        this.bindSocketEvent(this.socket_);

        this.socket_.on('open', () => {
          if (this.socket_) {
            this.socket_.removeListener('error', handlerError);
          }
          Runtime.frameLogger.success('connector.websocket', {event: 'connect-success', endpoint: listenInfo.endpoint});
          resolve();
        });
      });
    }, {
      maxRetryTimes: 0,
      incrementInterval: true,
      maxRetryIntervalMS: 5000,
      minIntervalMS: 500,
    });

    retry.errorEmitter.on(RetryEvent.Error, (err, nextRetry) => {
      Runtime.frameLogger.error('connector.websocket', err, {event: 'connector-on-error', error: Logger.errorMessage(err), nextRetry});
    });

    await retry.doJob();
  }

  protected async disconnect() {
    if (this.socket_) {
      this.socket_.removeAllListeners();
      this.socket_.close();
    }
    this.socket_ = null;
  }

  async sendRaw(packet: Object): Promise<void> {
    if (!this.socket_)
      throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'websocket socket is not found', {endpoint: this.target_?.endpoint});

    if (!this.isAvailable())
      throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'websocket connector is not available', {endpoint: this.target_?.endpoint});

    await util.promisify<string, void>(this.socket_.send.bind(this.socket_) as (buf: string) => void)(JSON.stringify(packet)).catch((err: Error) => {
      throw new RPCError(RPCErrorCode.ErrRpcSenderInner, err.message);
    });
  }

  async send(packet: IRawNetPacket) {
    return this.sendRaw(packet);
  }

  private onSocketError(socket: WebSocket) {
    return (err: ExError) => {
      if (this.socket_ !== socket)
        return;

      if (this.socket_) {
        this.socket_.removeAllListeners();
      }

      this.socket_ = null;
      this.off().catch((offError: ExError) => {
        Runtime.rpcLogger.error('connector.websocket', offError, {event: 'connect-off-error', error: Logger.errorMessage(offError), reason: err.message});
      });
      return;
    };
  }

  private bindSocketEvent(socket: WebSocket) {
    socket.on('error', this.onSocketError(socket));
    socket.on('close', this.onSocketError(socket));
    socket.on('message', (payload: Buffer) => {
      let packet: IRawNetPacket | null = null;
      try {
        packet = JSON.parse(payload.toString()) as IRawNetPacket;
      } catch (e) {
        const err = ExError.fromError(e as Error);
        Runtime.frameLogger.error('connector.websocket', err, {event: 'connector-decode-message', error: Logger.errorMessage(err)});
      }

      if (!packet)
        return;

      if (!typia.is<IRawNetPacket>(packet)) {
        const err = new RPCError(RPCErrorCode.ErrRpcBodyParseFailed, 'body is not IRawNetPacket');
        Runtime.frameLogger.error('connector.websocket', err, {event: 'connector-body-invalid', packet});
        return;
      }

      this.handleIncomeMessage(packet).catch((err: ExError) => {
        Runtime.frameLogger.error('connector.websocket', err, {event: 'connector-handle-income-message-error', error: Logger.errorMessage(err)});
      });
    });
  }

  isAvailable() {
    return !!(this.socket_ && this.socket_.readyState === WebSocket.OPEN);
  }

  get protocol() {
    return 'ws';
  }

  private socket_: WebSocket | null;
}

export {WebSocketConnector};
