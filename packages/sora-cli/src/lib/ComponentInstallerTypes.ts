interface ComponentInstallContext {
  projectRoot: string;
  soraRoot: string;
  soraConfig: Record<string, any>;
  packageVersion: string;
  packageName: string;
}

interface InstallQuestion {
  type: 'input' | 'number' | 'confirm' | 'select' | 'password';
  name: string;
  message: string;
  default?: string | number | boolean;
  choices?: Array<{name: string; value: string}>;
  validate?: (value: any) => boolean | string;
}

interface ComponentInfo {
  importStatement: string;
  enumKey: string;
  enumValue: string;
  staticFieldName: string;
  staticFieldExpression: string;
  registerCall: string;
}

interface ConfigTemplateEntry {
  section: string;
  defines: string[];
  content: string;
}

interface InstallHelpers {
  addComponentToCom(info: ComponentInfo): Promise<void>;
  appendToConfigTemplate(entry: ConfigTemplateEntry): Promise<void>;
  mergeJSON(targetPath: string, data: Record<string, any>): Promise<void>;
  copyFile(from: string, to: string): Promise<void>;
  writeFile(filePath: string, content: string | Buffer): Promise<void>;
  ensureDir(dirPath: string): Promise<void>;
  camelize(str: string, upper?: boolean): string;
  dashlize(str: string): string;
  log(message: string): void;
  warn(message: string): void;
}

interface ComponentInstallScript {
  prepare(ctx: ComponentInstallContext): Promise<InstallQuestion[]>;
  action(
    answers: Record<string, any>,
    ctx: ComponentInstallContext,
    helpers: InstallHelpers
  ): Promise<void>;
}

interface SoraComponentManifest {
  installScript: string;
}

export {
  ComponentInfo,
  ComponentInstallContext,
  ComponentInstallScript,
  ConfigTemplateEntry,
  InstallHelpers,
  InstallQuestion,
  SoraComponentManifest,
};
