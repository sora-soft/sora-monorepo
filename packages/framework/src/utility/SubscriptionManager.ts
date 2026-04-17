import type {Subscription} from 'rxjs';

class SubscriptionManager {
  constructor() {
    this.subscriptions_ = new Set();
    this.idMap_ = new Map();
  }

  register(sub: Subscription, id?: any) {
    this.subscriptions_.add(sub);
    if (id) {
      this.idMap_.set(id, sub);
    }
  }

  unregister(sub: Subscription) {
    this.subscriptions_.delete(sub);
    for (const [id, s] of this.idMap_.entries()) {
      if (s === sub)
        this.idMap_.delete(id);
    }
  }

  unregisterById(id: any) {
    const sub = this.idMap_.get(id);
    if (sub) {
      this.unregister(sub);
    }
  }

  destroy() {
    for (const sub of this.subscriptions_) {
      sub.unsubscribe();
    }
    this.subscriptions_.clear();
  }

  private subscriptions_: Set<Subscription>;
  private idMap_: Map<any, Subscription>;
}

export {SubscriptionManager};
