import {Route} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';

export interface IReqParamsValid {
  numberValue: number;
  stringValue: string;
}

/**
 * @soraExport route
 */
class HttpHandler extends Route {
  @Route.method
  async test(body: void) {
    return {
      result: 'sora is here!',
    };
  }

  /**
   * 参数验证接口
   * @description 通过@guard自动验证参数，如果请求体验证失败会返回 ERR_RPC_PARAMETER_INVALID 报错
   */
  @Route.method
  async paramsValid(@guard body: IReqParamsValid) {
    return {
      result: 'param is valid!',
    };
  }
}

export {HttpHandler};
