import {type IServiceOptions, JsonBufferCodec, Node, Service} from '@sora-soft/framework';
import {HTTPListener, type IHTTPListenerOptions, type IWebSocketListenerOptions, WebSocketListener} from '@sora-soft/http-support';
import Koa from '@sora-soft/http-support/koa';
import typia from 'typia';

import {Com} from '../../lib/Com.js';
import {Pvd} from '../../lib/Provider.js';
import {ForwardRoute} from '../../lib/route/ForwardRoute.js';
import {AccountWorld} from '../account/AccountWorld.js';
import {Application} from '../Application.js';
import {TraefikWorld} from '../traefik/TraefikWorld.js';
import {ServiceName} from './common/ServiceName.js';

export interface IHttpGatewayOptions extends IServiceOptions {
  httpListener?: IHTTPListenerOptions;
  websocketListener?: IWebSocketListenerOptions;
  skipAuthCheck?: boolean;
  traefik?: {
    prefix: string;
    name?: string;
  };
}

class HttpGatewayService extends Service {
  static register() {
    Node.registerService(ServiceName.HttpGateway, (options: IHttpGatewayOptions) => {
      return new HttpGatewayService(ServiceName.HttpGateway, options);
    });
  }

  constructor(name: string, options: IHttpGatewayOptions) {
    super(name, options);
    typia.assert<IHttpGatewayOptions>(options);
    this.gatewayOptions_ = options;
  }

  protected async startup() {
    await this.connectComponents([Com.businessDB, Com.businessRedis, Com.etcd, Com.aliCloud]);
    await this.registerProviders([Pvd.auth]);

    const route = new ForwardRoute(this, {
      [ServiceName.Auth]: Pvd.auth,
    });
    const koa = new Koa();
    if (this.gatewayOptions_.httpListener) {
      this.httpListener_ = new HTTPListener(this.gatewayOptions_.httpListener, koa, ForwardRoute.callback(route), this.gatewayOptions_.httpListener.labels);
    }
    if (this.gatewayOptions_.websocketListener) {
      this.websocketListener_ = new WebSocketListener(this.gatewayOptions_.websocketListener, ForwardRoute.callback(route), [new JsonBufferCodec()], this.gatewayOptions_.websocketListener.labels);
    }

    this.registerTraefikListener();

    if (this.httpListener_) {
      await this.installListener(this.httpListener_);
    }

    if (this.websocketListener_) {
      await this.installListener(this.websocketListener_);
    }
  }

  private registerTraefikListener() {
    if (this.gatewayOptions_.traefik) {
      const nameInTraefik = `${this.gatewayOptions_.traefik.name || Application.appName.replace('@', '-')}:${this.name}`;
      if (this.httpListener_) {
        TraefikWorld.registerTraefikListener(this.gatewayOptions_.traefik.prefix, 'http', `${nameInTraefik}:http`, this.httpListener_);
      }
      if (this.websocketListener_) {
        TraefikWorld.registerTraefikListener(this.gatewayOptions_.traefik.prefix, 'http', `${nameInTraefik}:websocket`, this.websocketListener_);
      }
    }
  }

  protected async shutdown() {
    await AccountWorld.shutdown();
  }

  private gatewayOptions_: IHttpGatewayOptions;
  private httpListener_?: HTTPListener;
  private websocketListener_?: WebSocketListener;
}

export {HttpGatewayService};
