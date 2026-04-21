import {type IServiceOptions, Node, Route, Service} from '@sora-soft/framework';
import {HTTPListener, type IHTTPListenerOptions} from '@sora-soft/http-support';
import Koa from '@sora-soft/http-support/koa';
import typia from 'typia';

import {HttpHandler} from '../handler/HttpHandler.js';
import {ServiceName} from './common/ServiceName.js';

export interface IHttpServiceOptions extends IServiceOptions {
  httpListener?: IHTTPListenerOptions;
}

class HttpService extends Service {
  static register() {
    Node.registerService(ServiceName.Http, (options: IHttpServiceOptions) => {
      return new HttpService(ServiceName.Http, options);
    });
  }

  constructor(name: string, options: IHttpServiceOptions) {
    typia.assert<IHttpServiceOptions>(options);
    super(name, options);
  }

  protected async startup() {
    const handler = new HttpHandler();
    const koa = new Koa();

    if (this.options_.httpListener) {
      this.httpListener_ = new HTTPListener(this.options_.httpListener, koa, Route.callback(handler), this.options_.httpListener.labels);
      await this.installListener(this.httpListener_);
    }
  }

  protected async shutdown() {}

  declare protected options_: IHttpServiceOptions;
  private httpListener_?: HTTPListener;
}

export {HttpService};
