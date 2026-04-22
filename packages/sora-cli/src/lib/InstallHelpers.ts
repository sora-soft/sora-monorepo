import path = require('path');
import {promises as fsp} from 'fs';
import fs = require('fs');

import {CodeInserter} from './ast/CodeInserter';
import {type ComponentInfo, type ConfigTemplateEntry} from './ComponentInstallerTypes';
import {type Config} from './Config';
import {ConfigTemplateInserter} from './ConfigTemplateInserter';
import {type FileTree} from './fs/FileTree';
import {type ScriptFileNode} from './fs/ScriptFileNode';
import {Utility} from './Utility';

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
    const relativePath = path.relative(this.fileTree_.rootPath, absolutePath).replace(/\\/g, '/');
    const gitkeepPath = path.join(relativePath, '.gitkeep');
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

  private fileTree_: FileTree;
  private soraConfig_: Config;
  private logFn_: (msg: string) => void;
  private warnFn_: (msg: string) => void;
}

export {InstallHelpersImpl};
