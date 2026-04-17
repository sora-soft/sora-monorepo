import type {IListenerMetaData} from '../../../interface/discovery.js';
import {ArrayMap} from '../../../utility/Utility.js';
import type {Discovery} from '../../discovery/Discovery.js';
import {Codec} from '../Codec.js';
import type {Connector} from '../Connector.js';
import type {Response} from '../packet/Response.js';
import type {Route} from '../Route.js';
import type {Provider} from './Provider.js';

export type SenderBuilder = () => Connector;
export interface IRequestOptions {
  headers?: {
    [k: string]: any;
  };
  timeout?: number;
}

export type UndefinedToVoid<T> = T extends undefined ? void : T;
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type TypeOfClassMethod<T, M extends keyof T> = T[M] extends (...args: any) => any ? T[M] : never;
export type RawRouteRPCMethod<T extends Route, K extends keyof T> = (body: UndefinedToVoid<Parameters<TypeOfClassMethod<T, K>>[0]>, options?: IRequestOptions, raw?: true) => Promise<Response<ThenArg<ReturnType<TypeOfClassMethod<T, K>>>>>;
export type RouteRPCMethod<T extends Route, K extends keyof T> = (body: UndefinedToVoid<Parameters<TypeOfClassMethod<T, K>>[0]>, options?: IRequestOptions, raw?: false) => ReturnType<TypeOfClassMethod<T, K>>;
export type ConvertRPCRouteMethod<T extends Route> = {
  [K in keyof T]: RouteRPCMethod<T, K> & RawRouteRPCMethod<T, K>;
}
export type RouteMethod<T extends Route, K extends keyof T> = (body: UndefinedToVoid<Parameters<TypeOfClassMethod<T, K>>[0]>, options?: IRequestOptions) => Promise<void>;
export type ConvertRouteMethod<T extends Route> = {
  [K in keyof T]: RouteMethod<T, K>
}
export type PacketCodecBuilder<T> = () => Codec<T>;

class ProviderManager {
  constructor(discovery: Discovery) {
    this.discovery_ = discovery;
  }

  registerSender(protocol: string, builder: SenderBuilder) {
    this.senderBuilder_.set(protocol, builder);
  }

  connectorFactory(target: IListenerMetaData) {
    const builder = this.senderBuilder_.get(target.protocol);
    if (!builder)
      return null;

    return builder();
  }

  findAvailableCodec(codes: string[]) {
    for (const code of codes) {
      const codec = Codec.get(code);
      if (codec)
        return codec;
    }
    return null;
  }

  addProvider(provider: Provider) {
    this.providerMap_.append(provider.name, provider);
  }

  removeProvider(provider: Provider) {
    this.providerMap_.remove(provider.name, provider);
  }

  getAllProviders() {
    return [...this.providerMap_].map(([_, providers]) => providers).flat();
  }

  get discovery() {
    return this.discovery_;
  }

  private discovery_: Discovery;
  private senderBuilder_: Map<string, SenderBuilder> = new Map();
  private providerMap_: ArrayMap<string /* service name */, Provider> = new ArrayMap();
}

export {ProviderManager};
