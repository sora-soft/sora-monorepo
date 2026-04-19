import {Provider, TCPConnector} from '@sora-soft/framework';
import {WebSocketConnector} from '@sora-soft/http-support';

import {type AuthHandler} from '../app/handler/AuthHandler.js';
import {ServiceName} from '../app/service/common/ServiceName.js';

class Pvd {
  static registerSenders() {
    TCPConnector.register();
    WebSocketConnector.register();
  }

  static auth = new Provider<AuthHandler>(ServiceName.Auth);
}

export {Pvd};
