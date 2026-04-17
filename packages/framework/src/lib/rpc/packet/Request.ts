import {OPCode} from '../../../Enum.js';
import type {IRawNetPacket, IRawReqPacket} from '../../../interface/rpc.js';
import {Utility} from '../../../utility/Utility.js';
import {RawPacket} from './RawPacket.js';

class Request<T = unknown> extends RawPacket<T> {
  constructor(packet: Omit<IRawReqPacket<T>, 'opcode'>) {
    super(OPCode.Request, packet);
    this.service_ = packet.service;
    this.method_ = packet.method;
    this.payload = packet.payload;
    this.loadHeaders(packet.headers);
  }

  toPacket(): IRawNetPacket<T> {
    return {
      opcode: OPCode.Request,
      method: this.method_,
      service: this.service_,
      headers: Utility.mapToJSON(this.headers_),
      payload: this.payload,
    };
  }

  get method() {
    return this.method_;
  }

  get service() {
    return this.service_;
  }

  private method_: string;
  private service_: string;
}

export {Request};
