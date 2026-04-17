import {Context} from '../lib/context/Context.js';
import {type Scope} from '../lib/context/Scope.js';
import {TraceScope} from '../lib/context/TraceScope.js';

export type JobExecutor<T = unknown> = () => Promise<T>;

class Executor<S extends Scope<unknown> = Scope<unknown>> {
  constructor(scope?: S) {
    this.scope_ = scope;
  }

  public async doJob<T = unknown>(executor: JobExecutor<T>) {
    return this.runInContext(async () => {
      if (this.isStopped_)
        return;

      const promise = executor().then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.workingPromises_.splice(this.workingPromises_.indexOf(promise), 1);
        return result;
      }).catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.workingPromises_.splice(this.workingPromises_.indexOf(promise), 1);
        throw err;
      });
      this.workingPromises_.push(promise);
      return promise;
    });
  }

  public start() {
    this.isStopped_ = false;
  }

  public async stop() {
    if (this.workingPromises_.length)
      await Promise.all(this.workingPromises_);
    this.isStopped_ = true;
  }

  get isIdle() {
    return !this.workingPromises_.length;
  }

  protected runInContext<T>(callback: () => Promise<T>): Promise<T> {
    if (this.scope_ && !(this.scope_ instanceof TraceScope)) {
      return Context.run(this.scope_, callback);
    } else {
      return callback();
    }
  }

  protected isStopped_ = true;
  private workingPromises_: Promise<unknown>[] = [];
  private scope_?: S;
}

export {Executor};
