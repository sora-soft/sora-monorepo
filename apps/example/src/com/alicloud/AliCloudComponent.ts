import {Component, type IComponentOptions} from '@sora-soft/framework';
import typia from 'typia';

import {AliCloudError, AliCloudErrorCode} from './AliCloudError.js';
import {AliCloudPop, type IAliCloudPopConfig} from './AliCloudPop.js';
import {type IAliCloudCommonConfig} from './AliCloudType.js';

export interface IAliCloudComponentOptions extends IComponentOptions, IAliCloudCommonConfig {
  pop?: IAliCloudPopConfig;
}

class AliCloudComponent extends Component {
  protected setOptions(options: IAliCloudComponentOptions) {
    typia.assert<IAliCloudComponentOptions>(options);
    this.aliCloudOptions_ = options;
  }

  protected async connect() {
    if (this.aliCloudOptions_?.pop) {
      this.pop_ = new AliCloudPop({
        accessKeyId: this.aliCloudOptions_.accessKeyId,
        accessKeySecret: this.aliCloudOptions_.accessKeySecret,
      }, this.aliCloudOptions_.pop);
    }
  }

  protected async disconnect() {
  }

  get pop() {
    if (!this.pop_)
      throw new AliCloudError(AliCloudErrorCode.ErrSubNotLoaded, 'ERR_SUB_NOT_LOADED, module=pop');

    return this.pop_;
  }

  get version() {
    return '0.0.0';
  }

  private aliCloudOptions_?: IAliCloudComponentOptions;
  private pop_?: AliCloudPop;
}

export {AliCloudComponent};
