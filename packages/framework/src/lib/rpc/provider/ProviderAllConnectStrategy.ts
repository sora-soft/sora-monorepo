import {ListenerState} from '../../../Enum.js';
import type {IListenerMetaData} from '../../../interface/discovery.js';
import {Utility} from '../../../utility/Utility.js';
import type {Provider} from './Provider.js';
import {ProviderStrategy} from './ProviderStrategy.js';
import type {RPCSender} from './RPCSender.js';

export class ProviderAllConnectStrategy extends ProviderStrategy {
  init() {}

  async selectListener(provider: Provider, listeners: IListenerMetaData[]) {
    return listeners.filter((listener) => {
      return [ListenerState.Ready, ListenerState.Stopping].includes(listener.state);
    });
  }

  async selectSender(provider: Provider, senders: RPCSender[], toId?: string) {
    const sender = Utility.randomOneByWeight(senders.filter((s) => {
      return !toId || s.targetId === toId;
    }), (ele) => ele.weight);

    return sender;
  }

  isBroadcastEnabled() {
    return true;
  }
}
