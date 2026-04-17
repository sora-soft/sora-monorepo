import net from 'net';
import util from 'util';
import {v4 as uuid} from 'uuid';

import {ListenerState} from '../../Enum.js';
import {TCPErrorCode} from '../../ErrorCode.js';
import type {ILabels, ITCPListenerOptions} from '../../interface/config.js';
import type {IListenerInfo} from '../../interface/rpc.js';
import {ErrorLevel, type ExError} from '../../utility/ExError.js';
import {Time} from '../../utility/Time.js';
import {Utility} from '../../utility/Utility.js';
import {Logger} from '../logger/Logger.js';
import type {Codec} from '../rpc/Codec.js';
import type {ListenerCallback} from '../rpc/Listener.js';
import {Listener} from '../rpc/Listener.js';
import {Runtime} from '../Runtime.js';
import {TCPConnector} from './TCPConnector.js';
import {TCPError} from './TCPError.js';

class TCPListener extends Listener {
  constructor(options: ITCPListenerOptions, callback: ListenerCallback, codecs: Codec<any>[], labels: ILabels = {}) {
    super(callback, codecs, labels);
    this.options_ = options;
    this.usePort_ = 0;
    this.server_ = net.createServer();
    this.server_.on('connection', (socket) => {
      this.onSocketConnect(socket);
    });
  }

  private onServerError(err: Error) {
    this.lifeCycle_.setState(ListenerState.Error);
    Runtime.frameLogger.error('listener.tcp', err, {event: 'tcp-server-on-error', error: Logger.errorMessage(err)});
  }

  protected async listen() {
    if (this.options_.portRange)
      return this.listenRange(this.options_.portRange[0], this.options_.portRange[1]);

    if (this.options_.port)
      this.usePort_ = this.options_.port;

    await util.promisify<number, string>(this.server_.listen.bind(this.server_) as (port: number, host: string) => void)(this.usePort_, this.options_.host);

    this.server_.on('error', (err: ExError) => {this.onServerError(err);});

    return this.metaData;
  }

  protected listenRange(min: number, max: number) {
    this.usePort_ = min;
    return new Promise<IListenerInfo>((resolve, reject) => {
      const onError = async (err: ExError) => {
        if (err.code === 'EADDRINUSE') {
          this.usePort_ = this.usePort_ + Utility.randomInt(0, 5);
          if (this.usePort_ > max) {
            reject(new TCPError(TCPErrorCode.ErrNoAvailablePort, 'no available port', ErrorLevel.Unexpected));
          }

          await Time.timeout(100);

          this.server_.listen(this.usePort_, this.options_.host);
        } else {
          throw err;
        }
      };

      this.server_.on('error', onError);

      this.server_.once('listening', () => {
        this.server_.removeListener('error', onError);

        this.server_.on('error', (err: ExError) => {this.onServerError(err);});
        resolve({
          protocol: 'tcp',
          endpoint: `${this.options_.host}:${this.usePort_}`,
          labels: this.labels,
          codecs: this.codecs_.map(codec => codec.code),
        });
      });

      this.server_.listen(this.usePort_, this.options_.host);
    });
  }

  protected async shutdown() {
    // 要等所有 socket 由对方关闭
    await util.promisify(this.server_.close.bind(this.server_) as () => void)();
  }

  private onSocketConnect(socket: net.Socket) {
    if (this.state !== ListenerState.Ready) {
      socket.destroy();
      return;
    }

    const session = uuid();
    const connector = new TCPConnector(socket);
    this.newConnector(session, connector);
  }

  get exposeHost() {
    return this.options_.exposeHost || this.options_.host;
  }

  get metaData() {
    return {
      id: this.id,
      protocol: 'tcp',
      endpoint: `${this.exposeHost}:${this.usePort_}`,
      state: this.state,
      labels: this.labels,
      codecs: this.codecs_.map(codec => codec.code),
    };
  }

  get version() {
    return Runtime.version;
  }

  private usePort_: number;
  private server_: net.Server;
  private options_: ITCPListenerOptions;
}

export {TCPListener};

