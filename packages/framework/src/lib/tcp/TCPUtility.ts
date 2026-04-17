import util from 'util';
import zlib from 'zlib';

import {RPCErrorCode} from '../../ErrorCode.js';
import {RPCError} from '../rpc/RPCError.js';

class TCPUtility {
  static async encodeMessage(data: Buffer) {
    // const data = Buffer.from(JSON.stringify(packet));
    const deflated = await util.promisify(zlib.deflate)(data);
    if (deflated.length >= 0xFFFFFFFF) {
      throw new RPCError(RPCErrorCode.ErrRpcPayloadTooLarge, 'rpc payload too large');
    }
    const header = Buffer.alloc(4);
    header.writeUInt32BE(deflated.length);
    return Buffer.concat([header, deflated]);
  }

  static async decodeMessage(buffer: Buffer) {
    const inflated = await util.promisify(zlib.inflate)(buffer);
    return inflated;
    // return JSON.parse(inflated.toString()) as T;
  }
}

export {TCPUtility};
