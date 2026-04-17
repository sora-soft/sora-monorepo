import type {IRawNetPacket} from '../../interface/rpc.js';

export abstract class Codec<T> {
  static register(codec: Codec<any>) {
    this.codecMap_.set(codec.code, codec);
  }

  static get(code: string) {
    return this.codecMap_.get(code);
  }

  static has(code: string) {
    return this.codecMap_.has(code);
  }

  private static codecMap_ = new Map<string, Codec<any>>();

  abstract get code(): string;

  abstract decode(raw: T): Promise<IRawNetPacket>;
  abstract encode(packet: IRawNetPacket): Promise<T>;
}
