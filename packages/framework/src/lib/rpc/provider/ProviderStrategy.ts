import type {IListenerMetaData} from '../../../interface/discovery.js';
import type {Provider} from './Provider.js';
import type {RPCSender} from './RPCSender.js';

export abstract class ProviderStrategy {
  abstract init(provider: Provider): void;

  abstract selectListener(provider: Provider, list: IListenerMetaData[], senders: RPCSender[]): Promise<IListenerMetaData[]>;

  abstract selectSender(provider: Provider, senders: RPCSender[], toId?: string | null): Promise<RPCSender | null>;

  abstract isBroadcastEnabled(provider: Provider): boolean;
}
