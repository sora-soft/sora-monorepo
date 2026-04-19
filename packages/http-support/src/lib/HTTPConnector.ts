import {Connector, ConnectorState, ExError, type IListenerInfo, type IRawNetPacket, type IRawReqPacket, type IRawResPacket, type IResPayloadPacket, Logger, OPCode, type ProviderManager, RPCError, RPCErrorCode, RPCHeader, Runtime} from '@sora-soft/framework';
import axios, {type AxiosHeaders, type AxiosInstance} from 'axios';
import type Koa from 'koa';
import typia from 'typia';

import {HTTPBodyParser} from './HTTPBodyParser.js';
import {HTTPCookieManager} from './HTTPCookieManager.js';
import {HTTPError} from './HTTPError.js';
import {HTTPErrorCode} from './HTTPErrorCode.js';
import {HTTPHeader} from './HTTPHeader.js';

export type KOAContext = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>;
export interface IHttpRawResponse<T> {
  status: number;
  headers: {
    [k: string]: string;
  };
  payload: T;
}

export interface IHttpConnectorOptions {
  bodyLimit: string;
}

class HTTPConnector extends Connector {
  static register(manager?: ProviderManager) {
    (manager || Runtime.pvdManager).registerSender('http', () => {
      return new HTTPConnector();
    });
  }

  constructor(ctx?: KOAContext, options?: IHttpConnectorOptions) {
    super({
      ping: {enabled: false},
    });
    this.ctx_ = null;
    this.client_ = null;
    this.ctxPromise_ = null;
    if (ctx) {
      this.ctx_ = ctx;

      this.lifeCycle_.setState(ConnectorState.Ready);
      this.target_ = {
        protocol: 'http',
        endpoint: `${ctx.request.ip}`,
        labels: {},
        codecs: [],
      };

      this.ctxPromise_ = new Promise<void>((resolve) => {
        this.endCallback_ = resolve;
      });

      this.handleCtx(ctx).catch(() => {});
    }

    if (options) {
      this.bodyLimit_ = options.bodyLimit;
    }

    this.onCodecSelected('http').catch(() => {});
  }

  isAvailable() {
    return true;
  }

  async selectCodec(code: string) {
    return;
    // throw new Error('Method not implemented.');
  }

  protected async connect(listenInfo: IListenerInfo) {
    this.client_ = axios.create({
      baseURL: `${listenInfo.protocol}://${listenInfo.endpoint}`,
      withCredentials: true,
    });
    return;
  }

  protected async disconnect(): Promise<void> {
    this.client_ = null;
  }

  async sendRaw(packet: IHttpRawResponse<unknown>) {
    if (this.ctx_) {
      this.ctx_.cookies.set('sora-http-session', this.session);
      for (const [header, value] of Object.entries(packet.headers)) {
        this.ctx_.res.setHeader(header, value);
      }
      this.ctx_.status = packet.status;
      this.ctx_.body = packet.payload;
    } else {
      throw new HTTPError(HTTPErrorCode.ErrHttpNotSupportRaw, 'ERR_HTTP_NOT_SUPPORT_RAW');
    }
  }

  async send(packet: IRawNetPacket) {
    if (this.ctx_) {
      if (!typia.is<IRawResPacket<unknown>>(packet)) {
        throw new HTTPError(HTTPErrorCode.ErrHttpListenerNotSupportSendRequest, 'ERR_HTTP_NOT_SUPPORT_SEND_REQUEST');
      }
      this.ctx_.res.setHeader('Content-Type', 'application/json');
      if (this.session)
        this.ctx_.res.setHeader('sora-http-session', this.session);

      for (const [header, content] of Object.entries(packet.headers)) {
        if (header === HTTPHeader.HttpResStatusCodeHeader) {
          this.ctx_.status = parseInt(content, 10);
          continue;
        }
        this.ctx_.res.setHeader(header, content as string);
      }
      this.ctx_.body = JSON.stringify(packet.payload || {});
      await this.endCtx();
    } else {
      if (!this.client_) {
        throw new RPCError(RPCErrorCode.ErrRpcTunnelNotAvailable, 'client not found', {target: this.target_});
      }

      if (!typia.is<IRawReqPacket>(packet)) {
        throw new HTTPError(HTTPErrorCode.ErrHttpClientOnlySupportRequest, 'http connector only support request');
      }

      const headers = packet.headers;
      if (this.session) {
        const cookies = HTTPCookieManager.parseCookies((headers.cookie as string) || '');
        cookies.set('sora-http-session', this.session);
        headers.cookie = HTTPCookieManager.serializeCookies(cookies);
      }

      const res = await this.client_.post(`${packet.service}/${packet.method}`, packet.payload, {
        headers: headers as AxiosHeaders,
      });

      if (res.status !== axios.HttpStatusCode.Ok) {
        throw new RPCError(RPCErrorCode.ErrRpcUnknown, res.statusText);
      }

      if (res.headers['set-cookie']) {
        const setCookies = HTTPCookieManager.parseSetCookieHeader(res.headers['set-cookie'] as string | string[]);
        const sessionCookie = setCookies.find((c: {name: string}) => c.name === 'sora-http-session');
        if (sessionCookie) {
          this.session_ = sessionCookie.value;
        }
      }

      const response: IRawResPacket = {
        opcode: OPCode.Response,
        headers: JSON.parse(JSON.stringify(res.headers)),
        payload: res.data as IResPayloadPacket<unknown>,
      };
      this.handleIncomeMessage(response).catch(() => {});
    }
  }

  private async handleCtx(ctx: KOAContext) {
    if (ctx.method === 'OPTIONS') {
      ctx.response.status = 200;
      await this.endCtx();
      return;
    }

    let payload: unknown = {};
    switch(ctx.method) {
      case 'GET': {
        payload = ctx.query;
        break;
      }
      case 'PUT':
      case 'POST': {
        try {
          const result = await HTTPBodyParser.parse(ctx.req, {
            limit: this.bodyLimit_,
          });
          payload = {
            ...(result.body as object || {}),
            ...ctx.query,
          };
        } catch (e) {
          const err = ExError.fromError(e as Error);
          Runtime.frameLogger.debug('connector.http', {event: 'parse-body-failed', error: Logger.errorMessage(err)});
          ctx.body = {
            error: {
              code: RPCErrorCode.ErrRpcBodyParseFailed,
              level: err.level,
              message: RPCErrorCode.ErrRpcBodyParseFailed,
              name: err.name,
            },
            result: null,
          };
          await this.endCtx();
          return;
        }
        break;
      }
    }

    const req = ctx.req;
    if (!req.url) {
      Runtime.frameLogger.debug('connector.http', {event: 'req-no-url'});
      await this.endCtx();
      return;
    }

    const reqURL = new URL(req.url, 'https://sora-software.com/');
    const pathArray = reqURL.pathname.split('/');
    const method = pathArray.at(-1);
    const service = pathArray.at(-2) || '';
    if (!method) {
      Runtime.frameLogger.debug('connector.http', {event: 'parse-url-failed', url: req.url});
      return;
    }

    const packet: IRawNetPacket = {
      opcode: OPCode.Request,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? JSON.stringify(v) : v as string])
        ),
        [RPCHeader.RpcIdHeader]: '1',
        [HTTPHeader.HttpMethodHeader]: ctx.method.toLocaleLowerCase(),
      },
      method,
      service,
      payload,
    };

    await this.handleIncomeMessage(packet);

    // await this.endCtx();
  }

  private async endCtx() {
    if (this.endCallback_) {
      this.endCallback_();
    }
    await this.off();
  }

  get promise() {
    return this.ctxPromise_;
  }

  get protocol() {
    return 'http';
  }

  private ctx_: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any> | null;
  private ctxPromise_: Promise<void> | null;
  private client_: AxiosInstance | null;
  private endCallback_?: () => void;
  private bodyLimit_: string | number = '20mb';
}

export {HTTPConnector};
