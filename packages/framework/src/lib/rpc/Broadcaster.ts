import type {Subscription} from 'rxjs';

import {ConnectorState} from '../../Enum.js';
import type {ExError} from '../../utility/ExError.js';
import {Logger} from '../logger/Logger.js';
import {Runtime} from '../Runtime.js';
import type {Connector} from './Connector.js';
import {Notify} from './packet/Notify.js';
import type {ConvertRouteMethod, IRequestOptions} from './provider/ProviderManager.js';
import type {Route} from './Route.js';

class Broadcaster<T extends Route> {
  constructor() {
    this.connectors_ = new Map();
    this.subscriptionMap_ = new WeakMap();
  }

  registerConnector(method: keyof T, connector: Connector) {
    if (!connector.session)
      return;

    let handler = this.connectors_.get(connector.session);
    if (!handler) {
      handler = {
        connector,
        methods: new Set(),
      };
    }

    handler.methods.add(method as string);
    this.connectors_.set(connector.session, handler);

    const sub = connector.stateSubject.subscribe((state) => {
      switch (state) {
        case ConnectorState.Error:
        case ConnectorState.Stopping:
        case ConnectorState.Stopped:
          if (connector.session) {
            this.removeConnector(connector.session);
          }
          break;
      }
    });
    this.subscriptionMap_.set(connector, sub);
  }

  removeConnector(session: string) {
    const unit = this.connectors_.get(session);
    if (!unit)
      return;
    const sub = this.subscriptionMap_.get(unit.connector);
    sub?.unsubscribe();
    this.connectors_.delete(session);
  }

  unregisterConnector(method: string, session: string) {
    const handler = this.connectors_.get(session);
    if (!handler) {
      return;
    }

    handler.methods.delete(method);

    if (!handler.methods.size) {
      this.connectors_.delete(session);
      const sub = this.subscriptionMap_.get(handler.connector);
      sub?.unsubscribe();
    }
  }

  notify(fromId?: string, toSession?: string[]): ConvertRouteMethod<T> {
    return new Proxy<ConvertRouteMethod<T>>({} as ConvertRouteMethod<T>, {
      get: (target, prop: string) => {
        return async (body: unknown, options: IRequestOptions) => {
          for (const [session, handler] of this.connectors_) {
            if (toSession && !toSession.includes(session))
              continue;

            if (!handler.methods.has(prop))
              continue;

            if (!options)
              options = {};

            const notify = new Notify({
              service: '',
              method: prop,
              payload: body,
              headers: options.headers || {},
            });
            await handler.connector.sendNotify(notify, fromId).catch((err: ExError) => {
              Runtime.frameLogger.error('broadcaster', err, {event: 'broadcast-sender-notify', error: Logger.errorMessage(err)});
            });
          }
        };
      },
    });
  }


  private connectors_: Map<string, {connector: Connector; methods: Set<string>}>;
  private subscriptionMap_: WeakMap<Connector, Subscription>;
}

export {Broadcaster};
