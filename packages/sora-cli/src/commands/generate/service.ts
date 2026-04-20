import {flags} from '@oclif/command';
import inquirer = require('inquirer');
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {CodeInserter} from '../../lib/ast/code-inserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

const VALID_LISTENERS = ['tcp', 'websocket', 'http', 'none'];

function parseListeners(raw: string | undefined): string[] {
  if (!raw) return [];
  const items = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const item of items) {
    if (!VALID_LISTENERS.includes(item)) {
      throw new Error(`Invalid listener type: "${item}". Valid types: ${VALID_LISTENERS.join(', ')}`);
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
  static description = 'Generate a new service';

  static args = [
    {name: 'name', description: 'Service name'},
  ];

  static flags = {
    ...BaseCommand.flags,
    listeners: flags.string({description: 'Listener types (comma-separated: tcp,websocket,http,none)'}),
    standalone: flags.boolean({description: 'Generate as SingletonService'}),
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
  };

  async run() {
    const {args, flags} = this.parse(GenerateService);
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
    const serviceNameServiceRelativePath = Utility.resolveImportPath(serviceFileExPath, serviceNameFilePath);

    const [serviceRegisterFilePath, registerMethodPath] = this.soraConfig.sora.serviceRegister.split('#');
    const [serviceRegisterClass, serviceRegisterMethod] = registerMethodPath.split('.');

    const handlerName = upperCamelCaseServiceName;
    const handlerFilePath = path.join(this.soraConfig.sora.handlerDir, `${handlerName}Handler`);
    const handlerFileExPath = handlerFilePath + '.ts';
    const handlerRelativePath = Utility.resolveImportPath(serviceFileExPath, handlerFilePath);

    const existedFile = this.fileTree.getFile(serviceFileExPath);
    if (existedFile)
      throw new Error('Service file already exists');

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
    const serviceNameFile = this.fileTree.getFile(serviceNameFileExtPath) as ScriptFileNode;
    await serviceNameFile.load();
    const serviceNameFileAST = new CodeInserter(serviceNameFile);
    serviceNameFileAST.insertEnum(serviceNameEnum, upperCamelCaseServiceName, Utility.dashlize(upperCamelCaseServiceName));

    const serviceRegisterFileExtPath = serviceRegisterFilePath + '.ts';
    const serviceRegisterFile = this.fileTree.getFile(serviceRegisterFileExtPath) as ScriptFileNode;
    const serviceRegisterServiceRelativePath = Utility.resolveImportPath(serviceRegisterFilePath, serviceFilePath);
    await serviceRegisterFile.load();
    const serviceRegisterAST = new CodeInserter(serviceRegisterFile);
    serviceRegisterAST.addImport(upperCamelCaseServiceFullName, serviceRegisterServiceRelativePath, false);
    serviceRegisterAST.insertCodeInClassMethod(serviceRegisterClass, serviceRegisterMethod, `\n    ${upperCamelCaseServiceFullName}.register();`);

    this.log(`Service ${upperCamelCaseServiceFullName} generated`);

    if (listeners.length > 0) {
      this.generateHandler(handlerName, handlerFileExPath);
    }

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }

  private generateHandler(handlerName: string, handlerFileExPath: string) {
    const existedFile = this.fileTree.getFile(handlerFileExPath);
    if (existedFile)
      throw new Error('Handler file already exists');

    const data = {handlerName};
    const result = template(path.resolve(__dirname, '../../../template/handler/Handler.ts.art'), data);
    const handlerFile = this.fileTree.newFile(handlerFileExPath) as ScriptFileNode;
    handlerFile.setContent(Buffer.from(result));

    this.log(`Handler ${handlerName}Handler generated`);
  }
}
