import {TCPConnector} from '@sora-soft/framework';
import {WebSocketConnector} from '@sora-soft/http-support';

class Pvd {
  static registerSenders() {
    TCPConnector.register();
    WebSocketConnector.register();
  }
}

export {Pvd};
