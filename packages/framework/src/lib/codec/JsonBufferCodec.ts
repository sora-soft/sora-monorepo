import type {IRawNetPacket} from '../../interface/rpc.js';
import {Codec} from '../rpc/Codec.js';

export class JsonBufferCodec extends Codec<Buffer> {
  static {
    Codec.register(new JsonBufferCodec());
  }

  get code() {
    return 'json';
  }

  async encode(packet: IRawNetPacket): Promise<Buffer<ArrayBufferLike>> {
    return Buffer.from(JSON.stringify(packet), 'utf-8');
  }

  async decode(raw: Buffer<ArrayBufferLike>): Promise<IRawNetPacket> {
    return JSON.parse(raw.toString('utf-8'));
  }
}
