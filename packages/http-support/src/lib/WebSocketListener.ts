import {type Codec, type ExError, type ILabels, Listener, type ListenerCallback, ListenerState, Logger, Runtime, Time, Utility} from '@sora-soft/framework';
import http from 'http';
import typia from 'typia';
import util from 'util';
import {v4 as uuid} from 'uuid';
import {WebSocketServer} from 'ws';

import {HTTPError} from './HTTPError.js';
import {HTTPErrorCode} from './HTTPErrorCode.js';
import {WebSocketConnector} from './WebSocketConnector.js';

export interface IWebSocketListenerOptions {
  portRange?: number[];
  port?: number;
  host: string;
  entryPath: string;
  labels?: ILabels;
  exposeHost?: string;
}

class WebSocketListener extends Listener {
  constructor(options: IWebSocketListenerOptions, callback: ListenerCallback, codecs: Codec<any>[], labels: ILabels = {}) {
    super(callback, codecs, labels);

    typia.assert<IWebSocketListenerOptions>(options);
    this.options_ = options;
    this.httpServer_ = http.createServer();
    this.usePort_ = 0;
    this.socketMap_ = new Map();
    this.socketServer_ = null;
  }

  get exposeHost() {
    return this.options_.exposeHost || this.options_.host;
  }

  get metaData() {
    return {
      id: this.id,
      protocol: 'ws',
      endpoint: `ws://${this.exposeHost}:${this.usePort_}${this.options_.entryPath}`,
      state: this.state,
      labels: this.labels,
      codecs: this.codecs_.map(c => c.code),
    };
  }

  getSocket(session: string) {
    return this.socketMap_.get(session);
  }

  protected async listen() {
    if (this.options_.portRange)
      await this.listenRange(this.options_.portRange[0], this.options_.portRange[1]);

    if (this.options_.port) {
      this.usePort_ = this.options_.port;
      await util.promisify<number, string, void>(this.httpServer_.listen.bind(this.httpServer_) as (port: number, host: string) => void)(this.usePort_, this.options_.host);
    }

    this.socketServer_ = new WebSocketServer({server: this.httpServer_, path: this.options_.entryPath});
    this.socketServer_.on('connection', (socket, request) => {
      if (this.state !== ListenerState.Ready) {
        socket.close();
        return;
      }

      const session = uuid();
      const connector = new WebSocketConnector(socket, request.socket.remoteAddress);
      this.newConnector(session, connector);
    });

    this.socketServer_.on('error', (err: ExError) => {
      this.onServerError(err);
    });

    return this.metaData;
  }

  protected async shutdown() {
    // 要等所有 socket 由对方关闭
    if (this.socketServer_)
      await util.promisify(this.socketServer_.close.bind(this.socketServer_) as () => void)();
    this.socketServer_ = null;
  }

  private onServerError(err: Error) {
    this.lifeCycle_.setState(ListenerState.Error);
    Runtime.frameLogger.error('listener.web-socket', err, {event: 'web-socket-server-on-error', error: Logger.errorMessage(err)});
  }

  protected listenRange(min: number, max: number) {
    this.usePort_ = min;
    return new Promise<void>((resolve, reject) => {
      const onError = async (err: ExError) => {
        if (err.code === 'EADDRINUSE') {
          this.usePort_ = this.usePort_ + Utility.randomInt(0, 3);
          if (this.usePort_ > max) {
            reject(new HTTPError(HTTPErrorCode.ErrNoAvailablePort, 'available port not found'));
            return;
          }
          await Time.timeout(100);

          this.httpServer_.listen(this.usePort_, this.options_.host);
        } else {
          throw err;
        }
      };

      this.httpServer_.on('error', onError);

      this.httpServer_.once('listening', () => {
        this.httpServer_.removeListener('error', onError);
        resolve();
      });

      this.httpServer_.listen(this.usePort_, this.options_.host);
    });
  }

  get version() {
    return __VERSION__;
  }

  private options_: IWebSocketListenerOptions;
  private httpServer_: http.Server;
  private socketServer_: WebSocketServer | null;
  private socketMap_: Map<string, WebSocket>;
  private usePort_: number;
}

export {WebSocketListener};
