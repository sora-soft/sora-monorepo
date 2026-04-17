import type {OPCode} from '../../../Enum.js';
import type {IRawNetPacket, IRawReqPacket, IRawResPacket} from '../../../interface/rpc.js';
import {Utility} from '../../../utility/Utility.js';

abstract class RawPacket<T> {
  constructor(opCode: OPCode, data: Omit<IRawReqPacket<T> | IRawResPacket<T>, 'opcode'>) {
    this.headers_ = new Map();
    this.opCode_ = opCode;
    this.payload_ = data.payload as T;
  }

  getHeader<H>(header: string): H | undefined {
    return this.headers_.get(header) as H | undefined;
  }

  loadHeaders(headers: {
    [key: string]: any;
  }) {
    for (const key of Object.keys(headers)) {
      this.headers_.set(key, headers[key]);
    }
  }

  setHeader(header: string, value: any) {
    this.headers_.set(header, value);
  }

  abstract toPacket(): IRawNetPacket<T>;

  get opCode() {
    return this.opCode_;
  }


  get payload() {
    return this.payload_;
  }

  set payload(value: T) {
    this.payload_ = value;
  }

  get headers() {
    return Utility.mapToJSON(this.headers_);
  }

  protected headers_: Map<string, any>;
  private opCode_: OPCode;
  private payload_: T;
}

export {RawPacket};
