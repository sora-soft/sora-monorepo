import {Args, Flags} from '@oclif/core';
import inquirer = require('inquirer');
import template = require('art-template');
import path = require('path');

import {BaseCommand, type ConfigFieldRequirement} from '../../Base';
import {CodeInserter} from '../../lib/ast/CodeInserter';
import {ConfigTemplateInserter} from '../../lib/ConfigTemplateInserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

const validListeners = ['tcp', 'websocket', 'http', 'none'];

function parseListeners(raw: string | undefined): string[] {
  if (!raw) return [];
  const items = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const item of items) {
    if (!validListeners.includes(item)) {
      throw new Error(`Invalid listener type: "${item}". Valid types: ${validListeners.join(', ')}`);
    }
  }
  const hasNone = items.includes('none');
  const hasOthers = items.some(i => i !== 'none');
  if (hasNone && hasOthers) {
    throw new Error('"none" is mutually exclusive with other listener types');
  }
  if (hasNone) return [];
  return items;
}

export default class GenerateService extends BaseCommand {
  static description = '生成 Service 脚手架代码';

  static args = {
    name: Args.string({description: 'Service name'}),
  };

  static flags = {
    ...BaseCommand.flags,
    listeners: Flags.string({description: 'Listener types (comma-separated: tcp,websocket,http,none)'}),
    standalone: Flags.boolean({description: 'Generate as SingletonService'}),
    'config-template': Flags.string({description: 'Config template file path (relative to cwd)'}),
  };

  protected requiredConfigFields(): ConfigFieldRequirement[] {
    return [
      {field: 'root'},
      {field: 'serviceDir'},
      {field: 'handlerDir'},
      {field: 'serviceNameEnum', format: 'path#name'},
      {field: 'serviceRegister', format: 'path#class.method'},
    ];
  }

  async run() {
    const {args, flags} = await this.parse(GenerateService);
    await this.loadConfig();

    let name: string | undefined = args.name as string | undefined;
    let listeners: string[] | undefined;
    let standalone: boolean | undefined = flags.standalone;

    if (!name) {
      const answers = await inquirer.prompt<{name: string}>([
        {name: 'name', message: 'Service name?'},
      ]);
      name = answers.name;
    }

    if (!flags.listeners) {
      const answers = await inquirer.prompt<{listeners: string[]}>([
        {
          name: 'listeners',
          message: 'Which listeners should be installed?',
          type: 'checkbox',
          choices: [
            {name: 'none', value: 'none'},
            {name: 'tcp', value: 'tcp'},
            {name: 'websocket', value: 'websocket'},
            {name: 'http', value: 'http'},
          ],
        },
      ]);
      listeners = answers.listeners.includes('none') ? [] : answers.listeners;
    } else {
      listeners = parseListeners(flags.listeners);
    }

    if (standalone === undefined) {
      const answers = await inquirer.prompt<{standalone: boolean}>([
        {name: 'standalone', message: 'Standalone mode?', type: 'confirm', default: false},
      ]);
      standalone = answers.standalone;
    }

    const upperCamelCaseServiceName = Utility.camelize(name, true);
    const upperCamelCaseServiceFullName = `${upperCamelCaseServiceName}Service`;

    const [serviceNameFilePath, serviceNameEnum] = this.soraConfig.sora.serviceNameEnum.split('#');
    const serviceFilePath = path.join(this.soraConfig.sora.serviceDir, `${upperCamelCaseServiceName}Service`);
    const serviceFileExPath = path.join(this.soraConfig.sora.serviceDir, `${upperCamelCaseServiceName}Service.ts`);
    const serviceNameServiceRelativePath = Utility.resolveImportPath(serviceFileExPath, serviceNameFilePath) + '.js';

    const [serviceRegisterFilePath, registerMethodPath] = this.soraConfig.sora.serviceRegister.split('#');
    const [serviceRegisterClass, serviceRegisterMethod] = registerMethodPath.split('.');

    const handlerName = upperCamelCaseServiceName;
    const handlerFilePath = path.join(this.soraConfig.sora.handlerDir, `${handlerName}Handler`);
    const handlerFileExPath = handlerFilePath + '.ts';
    const handlerRelativePath = Utility.resolveImportPath(serviceFileExPath, handlerFilePath) + '.js';

    const existedFile = this.fileTree.getFile(serviceFileExPath);
    if (existedFile)
      throw new Error(`Service file already exists: '${serviceFileExPath}'`);

    const data = {
      upperCamelCaseServiceName,
      serviceNameFilePath,
      serviceFileExPath,
      serviceNameServiceRelativePath,
      serviceNameEnum,
      standalone,
      listeners,
      handlerName,
      handlerRelativePath,
    };

    const result = template(path.resolve(__dirname, '../../../template/service/Service.ts.art'), data);
    const serviceFile = this.fileTree.newFile(serviceFileExPath) as ScriptFileNode;
    serviceFile.setContent(Buffer.from(result));

    const serviceNameFileExtPath = serviceNameFilePath + '.ts';
    const serviceNameFile = this.fileTree.getFile(serviceNameFileExtPath);
    if (!serviceNameFile) {
      throw new Error(`File referenced by 'serviceNameEnum' not found: '${serviceNameFileExtPath}'. Check the path in your sora.json.`);
    }
    await (serviceNameFile as ScriptFileNode).load();
    const serviceNameFileAST = new CodeInserter(serviceNameFile as ScriptFileNode);
    serviceNameFileAST.insertEnum(serviceNameEnum, upperCamelCaseServiceName, Utility.dashlize(upperCamelCaseServiceName));

    const serviceRegisterFileExtPath = serviceRegisterFilePath + '.ts';
    const serviceRegisterFile = this.fileTree.getFile(serviceRegisterFileExtPath);
    if (!serviceRegisterFile) {
      throw new Error(`File referenced by 'serviceRegister' not found: '${serviceRegisterFileExtPath}'. Check the path in your sora.json.`);
    }
    const serviceRegisterServiceRelativePath = Utility.resolveImportPath(serviceRegisterFilePath, serviceFilePath) + '.js';
    await (serviceRegisterFile as ScriptFileNode).load();
    const serviceRegisterAST = new CodeInserter(serviceRegisterFile as ScriptFileNode);
    serviceRegisterAST.addImport(upperCamelCaseServiceFullName, serviceRegisterServiceRelativePath, false);
    serviceRegisterAST.insertCodeInClassMethod(serviceRegisterClass, serviceRegisterMethod, `\n    ${upperCamelCaseServiceFullName}.register();`);

    this.log(`Service ${upperCamelCaseServiceFullName} generated`);

    if (listeners.length > 0) {
      this.generateHandler(handlerName, handlerFileExPath);
    }

    await this.fileTree.commit();

    let configTemplatePaths: string[];
    const configTemplateFlag = flags['config-template'];
    if (configTemplateFlag) {
      configTemplatePaths = [path.resolve(process.cwd(), configTemplateFlag)];
    } else {
      const templates = ((this.soraConfig.sora as any).configTemplates as Array<{type: string; path: string}> | undefined)?.filter(t => t.type === 'server') ?? [];
      if (templates.length > 0) {
        const answers = await inquirer.prompt<{configTemplates: string[]}>([
          {
            name: 'configTemplates',
            message: 'Config template files?',
            type: 'checkbox',
            choices: templates.map(t => ({name: t.path, value: t.path})),
          },
        ]);
        configTemplatePaths = answers.configTemplates.map(p => path.resolve(process.cwd(), p));
      } else {
        const answers = await inquirer.prompt<{configTemplate: string}>([
          {name: 'configTemplate', message: 'Config template file?', default: 'run/config.template.yml'},
        ]);
        configTemplatePaths = [path.resolve(process.cwd(), answers.configTemplate)];
      }
    }
    for (const configTemplatePath of configTemplatePaths) {
      await ConfigTemplateInserter.insertConfig(
        configTemplatePath,
        'services',
        Utility.dashlize(upperCamelCaseServiceName),
        listeners,
        (msg) => this.log(msg)
      );
    }
  }

  private generateHandler(handlerName: string, handlerFileExPath: string) {
    const existedFile = this.fileTree.getFile(handlerFileExPath);
    if (existedFile)
      throw new Error(`Handler file already exists: '${handlerFileExPath}'`);

    const data = {handlerName};
    const result = template(path.resolve(__dirname, '../../../template/handler/Handler.ts.art'), data);
    const handlerFile = this.fileTree.newFile(handlerFileExPath) as ScriptFileNode;
    handlerFile.setContent(Buffer.from(result));

    this.log(`Handler ${handlerName}Handler generated`);
  }
}
