import path = require('node:path');
import {promises as fsp} from 'node:fs';
import fs = require('node:fs');
import template = require('art-template');

import {CodeInserter} from './ast/CodeInserter';
import {type ComponentInfo, type ConfigTemplateEntry} from './ComponentInstallerTypes';
import {type Config} from './Config';
import {ConfigTemplateInserter} from './ConfigTemplateInserter';
import {type FileTree} from './fs/FileTree';
import {type ScriptFileNode} from './fs/ScriptFileNode';
import {Utility} from './Utility';
import inquirer = require('inquirer');

class InstallHelpersImpl {
  constructor(
    fileTree: FileTree,
    soraConfig: Config,
    logFn: (msg: string) => void,
    warnFn: (msg: string) => void
  ) {
    this.fileTree_ = fileTree;
    this.soraConfig_ = soraConfig;
    this.logFn_ = logFn;
    this.warnFn_ = warnFn;
  }

  async addComponentToCom(info: ComponentInfo): Promise<void> {
    const [comFilePath, comClassName] = this.soraConfig_.sora.comClass.split('#');
    const [enumFilePath, enumName] = this.soraConfig_.sora.componentNameEnum.split('#');

    const comFileExtPath = comFilePath + '.ts';
    const enumFileExtPath = enumFilePath + '.ts';

    const comFile = this.fileTree_.getFile(comFileExtPath);
    if (!comFile) {
      throw new Error(`Com file not found: '${comFileExtPath}'. Check 'comClass' in sora.json.`);
    }
    const enumFile = this.fileTree_.getFile(enumFileExtPath);
    if (!enumFile) {
      throw new Error(`Enum file not found: '${enumFileExtPath}'. Check 'componentNameEnum' in sora.json.`);
    }

    await (comFile as ScriptFileNode).load();
    await (enumFile as ScriptFileNode).load();

    const importMatch = info.importStatement.match(/from\s+['"]([^'"]+)['"]/);
    const importFrom = importMatch ? importMatch[1] : '';
    const importNameMatch = info.importStatement.match(/import\s+\{([^}]+)\}\s+from/);
    const importName = importNameMatch ? importNameMatch[1].trim() : '';

    new CodeInserter(comFile as ScriptFileNode).addImport(importName, importFrom, false);
    new CodeInserter(comFile as ScriptFileNode).addImport('Runtime', '@sora-soft/framework', false);

    new CodeInserter(enumFile as ScriptFileNode).insertEnum(enumName, info.enumKey, info.enumValue);

    new CodeInserter(comFile as ScriptFileNode).insertStaticField(comClassName, info.staticFieldName, info.staticFieldExpression);

    new CodeInserter(comFile as ScriptFileNode).insertCodeInClassMethod(comClassName, 'register', `\n    ${info.registerCall};`);

    this.logFn_(`Component ${info.enumKey} added to Com.ts`);
  }

  async mergeJSON(targetPath: string, data: Record<string, any>): Promise<void> {
    const absolutePath = path.resolve(this.fileTree_.rootPath, targetPath);
    let existing: Record<string, any> = {};
    try {
      const content = await fsp.readFile(absolutePath, 'utf-8');
      existing = JSON.parse(content);
    } catch {
      // File doesn't exist yet, will be created
    }

    const merged = this.deepMerge(existing, data, targetPath);
    const mergedContent = JSON.stringify(merged, null, 2) + '\n';

    const relativePath = path.relative(this.fileTree_.rootPath, absolutePath).replace(/\\/g, '/');
    const file = this.fileTree_.newFile(relativePath) as ScriptFileNode;
    file.setContent(Buffer.from(mergedContent));

    this.logFn_(`Merged JSON into ${targetPath}`);
  }

  async appendToConfigTemplate(entry: ConfigTemplateEntry): Promise<void> {
    const configTemplatePath = this.findConfigTemplate();
    if (!configTemplatePath) {
      this.warnFn_('No config template file found, skipping config insertion');
      return;
    }

    await ConfigTemplateInserter.appendToConfigTemplateEntry(
      configTemplatePath,
      entry,
      this.logFn_
    );
  }

  async copyFile(from: string, to: string): Promise<void> {
    const content = await fsp.readFile(from);
    const relativeTo = path.relative(this.fileTree_.rootPath, to).replace(/\\/g, '/');
    const file = this.fileTree_.newFile(relativeTo) as ScriptFileNode;
    file.setContent(Buffer.from(content));
  }

  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    const relativePath = path.relative(this.fileTree_.rootPath, filePath).replace(/\\/g, '/');
    const file = this.fileTree_.newFile(relativePath) as ScriptFileNode;
    file.setContent(Buffer.isBuffer(content) ? content : Buffer.from(content));
  }

  async ensureDir(dirPath: string): Promise<void> {
    const absolutePath = path.resolve(this.fileTree_.rootPath, dirPath);
    await fsp.mkdir(absolutePath, {recursive: true});

    const relativePath = path.relative(this.fileTree_.rootPath, absolutePath).replace(/\\/g, '/');
    const gitkeepPath = path.join(relativePath, '.gitkeep').replace(/\\/g, '/');
    const file = this.fileTree_.newFile(gitkeepPath) as ScriptFileNode;
    file.setContent(Buffer.from(''));
  }

  camelize(str: string, upper = false): string {
    return Utility.camelize(str, upper);
  }

  dashlize(str: string): string {
    return Utility.dashlize(str);
  }

  log(message: string): void {
    this.logFn_(message);
  }

  warn(message: string): void {
    this.warnFn_(message);
  }

  async addWorkerToProject(options: {
    templatePath: string;
    templateData: Record<string, any>;
    workerNameKey: string;
    workerNameValue: string;
    workerClassName: string;
  }): Promise<void> {
    const [workerNameFilePath, workerNameEnum] = this.soraConfig_.sora.workerNameEnum.split('#');
    const [workerRegisterFilePath, registerMethodPath] = this.soraConfig_.sora.workerRegister.split('#');
    const [workerRegisterClass, workerRegisterMethod] = registerMethodPath.split('.');

    const workerDir = this.soraConfig_.sora.workerDir;
    const workerFileExPath = path.join(workerDir, `${options.workerClassName}.ts`);
    const workerFilePath = path.join(workerDir, options.workerClassName);

    const existedFile = this.fileTree_.getFile(workerFileExPath);
    if (existedFile) {
      throw new Error(`Worker file already exists: '${workerFileExPath}'`);
    }

    const result = template(options.templatePath, options.templateData);
    const workerFile = this.fileTree_.newFile(workerFileExPath) as ScriptFileNode;
    workerFile.setContent(Buffer.from(result));

    const workerNameFileExtPath = workerNameFilePath + '.ts';
    const workerNameFile = this.fileTree_.getFile(workerNameFileExtPath);
    if (!workerNameFile) {
      throw new Error(`File referenced by 'workerNameEnum' not found: '${workerNameFileExtPath}'. Check the path in your sora.json.`);
    }
    await (workerNameFile as ScriptFileNode).load();
    new CodeInserter(workerNameFile as ScriptFileNode).insertEnum(workerNameEnum, options.workerNameKey, options.workerNameValue);

    const workerRegisterFileExtPath = workerRegisterFilePath + '.ts';
    const workerRegisterFile = this.fileTree_.getFile(workerRegisterFileExtPath);
    if (!workerRegisterFile) {
      throw new Error(`File referenced by 'workerRegister' not found: '${workerRegisterFileExtPath}'. Check the path in your sora.json.`);
    }
    const workerRegisterRelativePath = Utility.resolveImportPath(workerRegisterFilePath, workerFilePath) + '.js';
    await (workerRegisterFile as ScriptFileNode).load();
    const workerRegisterAST = new CodeInserter(workerRegisterFile as ScriptFileNode);
    workerRegisterAST.addImport(options.workerClassName, workerRegisterRelativePath, false);
    workerRegisterAST.insertCodeInClassMethod(workerRegisterClass, workerRegisterMethod, `\n    ${options.workerClassName}.register();`);

    this.logFn_(`Worker ${options.workerClassName} added to project`);
  }

  async mergePackageScripts(scripts: Record<string, string>): Promise<void> {
    const relativePath = path.relative(this.fileTree_.rootPath, path.resolve(path.dirname(this.fileTree_.rootPath), 'package.json')).replace(/\\/g, '/');
    const pkg = await this.readPackageJson(relativePath);

    if (!pkg.scripts) {
      pkg.scripts = {};
    }

    for (const [key, value] of Object.entries(scripts)) {
      if (key in pkg.scripts) {
        if (pkg.scripts[key] === value) {
          continue;
        }
        this.warnFn_(`Script '${key}' already exists in package.json with different value, keeping existing`);
        continue;
      }
      pkg.scripts[key] = value;
    }

    this.writePackageJson(relativePath, pkg);
    this.logFn_(`Merged scripts into package.json`);
  }

  async mergePackageDependencies(deps: { dependencies?: Record<string, string> }): Promise<void> {
    const relativePath = path.relative(this.fileTree_.rootPath, path.resolve(path.dirname(this.fileTree_.rootPath), 'package.json')).replace(/\\/g, '/');
    const pkg = await this.readPackageJson(relativePath);

    if (!pkg.dependencies) {
      pkg.dependencies = {};
    }

    const devDeps = new Set(Object.keys(pkg.devDependencies || {}));
    const existingDeps = new Set(Object.keys(pkg.dependencies));

    if (deps.dependencies) {
      for (const [key, value] of Object.entries(deps.dependencies)) {
        if (existingDeps.has(key) || devDeps.has(key)) {
          continue;
        }
        pkg.dependencies[key] = value;
      }
    }

    this.writePackageJson(relativePath, pkg);
    this.logFn_(`Merged dependencies into package.json`);
  }

  private async readPackageJson(relativePath: string): Promise<Record<string, any>> {
    const existing = this.fileTree_.getFile(relativePath);
    if (existing) {
      const content = (existing as ScriptFileNode).getContent() as string;
      return JSON.parse(content);
    }

    const absolutePath = path.resolve(this.fileTree_.rootPath, relativePath);
    try {
      const content = await fsp.readFile(absolutePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      this.warnFn_('package.json not found');
      return {};
    }
  }

  private writePackageJson(relativePath: string, pkg: Record<string, any>): void {
    const existing = this.fileTree_.getFile(relativePath);
    if (existing) {
      (existing as ScriptFileNode).setContent(Buffer.from(JSON.stringify(pkg, null, 2) + '\n'));
    } else {
      const file = this.fileTree_.newFile(relativePath) as ScriptFileNode;
      file.setContent(Buffer.from(JSON.stringify(pkg, null, 2) + '\n'));
    }
  }

  async appendToCommandConfigTemplate(entry: ConfigTemplateEntry, createIfMissing = false): Promise<void> {
    const projectRoot = path.dirname(this.fileTree_.rootPath);
    const commandTemplate = this.getConfigTemplatePath('command');
    const templateRelPath = commandTemplate || 'run/config-command.template.yml';
    const templatePath = path.resolve(projectRoot, templateRelPath);

    if (!fs.existsSync(templatePath)) {
      if (!createIfMissing) {
        const answers = await inquirer.prompt<{create: boolean}>([
          {name: 'create', message: `Command config template '${templateRelPath}' not found. Create it?`, type: 'confirm', default: true},
        ]);
        if (!answers.create) {
          this.warnFn_(`Skipped command config template creation`);
          return;
        }
      }

      await fsp.mkdir(path.dirname(templatePath), {recursive: true});

      const defineStrings = entry.defines.map(d => ConfigTemplateInserter.buildDefineString(d));
      const definesBlock = defineStrings.join('\n');
      const yamlBlock = ConfigTemplateInserter.serializeContentToYaml(entry.content);
      const initialContent = definesBlock ? `${definesBlock}\n\n${yamlBlock}\n` : `${yamlBlock}\n`;

      const relativePath = path.relative(this.fileTree_.rootPath, templatePath).replace(/\\/g, '/');
      const file = this.fileTree_.newFile(relativePath) as ScriptFileNode;
      file.setContent(Buffer.from(initialContent));

      this.logFn_(`Created command config template: ${templateRelPath}`);
      return;
    }

    await ConfigTemplateInserter.appendToConfigTemplateEntry(
      templatePath,
      entry,
      this.logFn_
    );
  }

  private deepMerge(target: Record<string, any>, source: Record<string, any>, filePath: string): Record<string, any> {
    const result = {...target};
    for (const [key, value] of Object.entries(source)) {
      if (key in result) {
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])
          && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          result[key] = this.deepMerge(result[key], value, filePath);
        } else if (JSON.stringify(result[key]) === JSON.stringify(value)) {
          // Same value, skip
        } else {
          this.warnFn_(`Field '${key}' already exists in ${filePath} with different value, keeping existing`);
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  private findConfigTemplate(): string | null {
    const projectRoot = path.dirname(this.fileTree_.rootPath);

    const configured = this.getConfigTemplatePath('server');
    if (configured) {
      const resolved = path.resolve(projectRoot, configured);
      try {
        fs.accessSync(resolved);
        return resolved;
      } catch {
        // Fall through to defaults
      }
    }

    const candidates = [
      path.join(projectRoot, 'run', 'config.template.yml'),
      path.join(projectRoot, 'run', 'config.template.yaml'),
    ];
    for (const candidate of candidates) {
      try {
        fs.accessSync(candidate);
        return candidate;
      } catch {
        // Try next
      }
    }
    return null;
  }

  private getConfigTemplatePath(type: string): string | undefined {
    const templates: Array<{type: string; path: string}> | undefined = (this.soraConfig_.sora as any).configTemplates;
    if (!templates || !Array.isArray(templates)) return undefined;
    const entry = templates.find(t => t.type === type);
    return entry?.path;
  }

  private fileTree_: FileTree;
  private soraConfig_: Config;
  private logFn_: (msg: string) => void;
  private warnFn_: (msg: string) => void;
}

export {InstallHelpersImpl};
