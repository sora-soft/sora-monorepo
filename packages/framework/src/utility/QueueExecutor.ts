import type {Scope} from '../lib/context/Scope.js';
import type {JobExecutor} from './Executor.js';
import {Executor} from './Executor.js';
import type {ExError} from './ExError.js';
import {Utility} from './Utility.js';

export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
export interface IQueueExecutorInfo<T> {
  resolve: PromiseResolver<T>;
  reject: (err: Error) => void;
  executor: JobExecutor;
}

class QueueExecutor<S extends Scope<unknown> = Scope<unknown>> extends Executor<S> {
  public async doJob<T = unknown>(executor: JobExecutor<T>) {
    if (this.isStopped_)
      return;

    const promise = new Promise<T>((resolve, reject) => {
      this.executorQueue_.push({
        resolve,
        reject,
        executor,
      });
    });
    this.doJobInQueue().catch(Utility.null);
    return promise;
  }

  public async stop() {
    this.isStopped_ = true;
    if (this.isDoingJob_) {
      const stopPromise = new Promise<void>((resolve) => { this.stopCallback_ = resolve; });
      await stopPromise;
    }
  }

  private async doJobInQueue() {
    if (this.isDoingJob_)
      return;

    this.isDoingJob_ = true;

    await this.runInContext(async () => {
      while(this.executorQueue_.length) {
        const info = this.executorQueue_.shift();
        if (!info)
          break;

        let hasError = false;
        const result = await info.executor().catch((err: ExError) => {
          info.reject(err);
          hasError = true;
        });
        if (!hasError) {
          info.resolve(result);
        }
      }
    });

    if (this.stopCallback_)
      this.stopCallback_();

    this.isDoingJob_ = false;
  }

  get isIdle() {
    return !this.isDoingJob_;
  }

  private executorQueue_: IQueueExecutorInfo<any>[] = [];
  private stopCallback_?: () => void;
  private isDoingJob_ = false;
}

export {QueueExecutor};
