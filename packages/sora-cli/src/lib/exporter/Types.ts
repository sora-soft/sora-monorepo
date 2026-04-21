export enum ExportStrategy {
  Route = 'route',
  Entity = 'entity',
}

export interface ExportClassInfo {
  filePath: string;
  className: string;
  strategy: ExportStrategy;
  modes: string[];
}

export type SimpleExportKind = 'class' | 'enum' | 'interface' | 'type';

export interface ExportSimpleInfo {
  filePath: string;
  name: string;
  kind: SimpleExportKind;
  modes: string[];
}

export interface ExportPlan {
  routes: ExportClassInfo[];
  entities: ExportClassInfo[];
  simple: ExportSimpleInfo[];
}

export interface RouteExportInfo {
  className: string;
  methods: Array<{
    name: string;
    params: Array<{name: string; type: any}>;
    returnType: any;
  }>;
}

export interface EntityExportInfo {
  className: string;
  properties: Array<{name: string; type: any}>;
}

export interface GenericExportInfo {
  className: string;
  methods: Array<{name: string; type: any}>;
  properties: Array<{name: string; type: any}>;
}
