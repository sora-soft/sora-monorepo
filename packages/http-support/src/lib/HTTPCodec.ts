import {Codec, type IRawNetPacket} from '@sora-soft/framework';

export class HTTPCodec extends Codec<Object> {
  static {
    Codec.register(new HTTPCodec());
  }

  get code(): string {
    return 'http';
  }

  async decode(raw: Object): Promise<IRawNetPacket> {
    return raw as IRawNetPacket;
  }

  async encode(packet: IRawNetPacket): Promise<Object> {
    return packet;
  }
}
