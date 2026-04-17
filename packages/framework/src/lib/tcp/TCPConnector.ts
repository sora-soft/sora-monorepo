import {TypeGuard} from '@sora-soft/type-guard';
import net from 'net';
import util from 'util';

import {ConnectorState} from '../../Enum.js';
import {RPCErrorCode, TCPErrorCode} from '../../ErrorCode.js';
import {RetryEvent} from '../../Event.js';
import type {IListenerInfo, IRawNetPacket} from '../../interface/rpc.js';
import {ErrorLevel, type ExError} from '../../utility/ExError.js';
import {Retry} from '../../utility/Retry.js';
import {Utility} from '../../utility/Utility.js';
import {Logger} from '../logger/Logger.js';
import {Connector} from '../rpc/Connector.js';
import type {ProviderManager} from '../rpc/provider/ProviderManager.js';
import {RPCError} from '../rpc/RPCError.js';
import {Runtime} from '../Runtime.js';
import {TCPError} from './TCPError.js';
import {TCPUtility} from './TCPUtility.js';

class TCPConnector extends Connector {
  static register(manager?: ProviderManager) {
    (manager || Runtime.pvdManager).registerSender('tcp', () => {
      return new TCPConnector();
    });
  }

  constructor(socket?: net.Socket) {
    super({
      ping: {
        enabled: true,
      },
    });
    this.cache_ = Buffer.alloc(0);
    this.currentPacketLength_ = 0;
    this.socket_ = null;
    if (socket) {
      this.socket_ = socket;
      this.lifeCycle_.setState(ConnectorState.Pending);
      this.target_ = {
        protocol: 'tcp',
        endpoint: `${socket.remoteAddress || 'unknown'}:${socket.remotePort || 'unknown'}`,
        labels: {},
        codecs: [],
      };
      this.waitForCodecSelected(socket);
      this.socket_.on('error', (err: ExError) => { this.onSocketError(socket)(err); });
      this.socket_.on('close', (err: ExError) => { this.onSocketError(socket)(err); });
    }
  }

  isAvailable() {
    return !!(this.socket_ && !this.socket_.destroyed);
  }

  protected async connect(listenInfo: IListenerInfo) {
    if (this.socket_ && !this.socket_.destroyed)
      return;

    const retry = new Retry(async () => {
      return new Promise<boolean>((resolve, reject) => {
        Runtime.frameLogger.info('connector.tcp', {event: 'start-connect', endpoint: listenInfo.endpoint});

        const [ip, portStr] = listenInfo.endpoint.split(':');
        const port = Utility.parseInt(portStr);
        const socket = this.socket_ = new net.Socket();
        const handlerError = (err: Error) => {
          reject(err);
        };
        this.socket_.once('error', handlerError);
        this.waitForCodecSelected(this.socket_);

        this.socket_.connect(port, ip, () => {
          if (this.socket_ === socket) {
            this.socket_.removeListener('error', handlerError);
            this.socket_.on('error', this.onSocketError(this.socket_));
            this.socket_.on('close', this.onSocketError(this.socket_));
          }
          Runtime.frameLogger.success('connector.tcp', {event: 'connect-success', endpoint: listenInfo.endpoint});
          resolve(true);
        });
      });
    }, {
      maxRetryTimes: 3,
      incrementInterval: true,
      maxRetryIntervalMS: 5000,
      minIntervalMS: 500,
    });

    retry.errorEmitter.on(RetryEvent.Error, (err, nextRetry) => {
      Runtime.frameLogger.error('connector.tcp', err, {event: 'connector-on-error', error: Logger.errorMessage(err), nextRetry});
    });

    await retry.doJob();
  }

  private waitForCodecSelected(socket: net.Socket) {
    socket.on('data', async (data: Buffer) => {
      if (this.socket_ !== socket)
        return;

      this.cache_ = Buffer.concat([this.cache_, data], this.cache_.length + data.length);
      const index = this.cache_.indexOf(0x0A);
      if (index === -1)
        return;

      const code = this.cache_.subarray(0, index).toString('utf-8');
      this.cache_ = this.cache_.subarray(index + 1);

      await this.onCodecSelected(code);
      socket.removeAllListeners('data');
      this.bindSocketDataEvent(socket);
    });
  }

  private bindSocketDataEvent(socket: net.Socket) {
    socket.on('data', (data: Buffer) => {
      if (this.socket_ !== socket)
        return;
      this.onSocketData(data).catch((err: ExError) => {
        Runtime.rpcLogger.error('connector.tcp', err, {event: 'on-data-error', error: Logger.errorMessage(err)});
      });
    });
  }

  private onSocketError(socket: net.Socket) {
    return (err: ExError) => {
      if (this.socket_ !== socket)
        return;

      if (this.socket_) {
        this.socket_.removeAllListeners();
      }

      this.socket_ = null;
      this.off().catch((offError: ExError) => {
        Runtime.rpcLogger.error('connector.tcp', offError, {event: 'connect-off-error', error: Logger.errorMessage(offError), reason: err.message});
      });
      return;
    };
  }

  protected async disconnect() {
    if (this.socket_) {
      this.socket_.removeAllListeners();
      this.socket_.destroy();
    }
    this.socket_ = null;
  }

  async send(packet: IRawNetPacket) {
    if (!this.codec_)
      throw new RPCError(RPCErrorCode.ErrRpcCodecNotFound, 'codec not found in connector');
    const buffer = await this.codec_.encode(packet);

    return this.sendRaw(buffer);
  }

  async sendRaw(payload: Buffer) {
    const data = await TCPUtility.encodeMessage(payload);
    if (!this.isAvailable())
      throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'rpc tunnel not available', {endpoint: this.target_?.endpoint || 'unknown'});
    if (!this.socket_)
      throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'rpc tunnel not available', {endpoint: this.target_?.endpoint || 'unknown'});

    await util.promisify<Buffer, void>(this.socket_.write.bind(this.socket_) as (buf: Buffer) => void)(data).catch((err: Error) => {
      throw new RPCError(RPCErrorCode.ErrRpcSenderInner, 'rpc sender inner error', {error: err.message});
    });
  }

  async selectCodec(code: string): Promise<void> {
    if (!this.socket_)
      throw new TCPError(TCPErrorCode.ErrSelectCodecBeforeConnect, 'select codec before socket is created', ErrorLevel.Unexpected);

    this.socket_.write(`${code}\n`);
  }

  private async onSocketData(data: Buffer) {
    this.cache_ = Buffer.concat([this.cache_, data], this.cache_.length + data.length);

    while (this.cache_.length >= this.currentPacketLength_ && this.cache_.length) {
      if (!this.currentPacketLength_) {
        this.currentPacketLength_ = this.cache_.readUInt32BE();
        this.cache_ = this.cache_.subarray(4);
      }

      if (this.cache_.length < this.currentPacketLength_)
        break;

      if (!this.codec_)
        throw new RPCError(RPCErrorCode.ErrRpcCodecNotFound, 'codec not found in connector');

      const content = this.cache_.subarray(0, this.currentPacketLength_);
      this.cache_ = this.cache_.subarray(this.currentPacketLength_);
      this.currentPacketLength_ = 0;

      const buffer = await TCPUtility.decodeMessage(content);

      const packet = await this.codec_.decode(buffer).catch((err: ExError) => {
        Runtime.frameLogger.error('connector.tcp', err, {event: 'connector-decode-message', error: Logger.errorMessage(err)});
        return null;
      });

      if (!packet) {
        return;
      }

      if (!TypeGuard.is<IRawNetPacket>(packet)) {
        const err = new RPCError(RPCErrorCode.ErrRpcBodyParseFailed, 'rpc body parse failed');
        Runtime.frameLogger.error('connector.websocket', err, {event: 'connector-body-invalid', packet});
      }

      await this.handleIncomeMessage(packet);
    }
  }

  get protocol() {
    return 'tcp';
  }

  private socket_: net.Socket | null;
  private cache_: Buffer;
  private currentPacketLength_: number;
}

export {TCPConnector};
