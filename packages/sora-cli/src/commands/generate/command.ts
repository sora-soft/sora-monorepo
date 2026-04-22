import {Args, Flags} from '@oclif/core';
import inquirer = require('inquirer');
import template = require('art-template');
import path = require('path');

import {BaseCommand, type ConfigFieldRequirement} from '../../Base';
import {CodeInserter} from '../../lib/ast/CodeInserter';
import {ConfigTemplateInserter} from '../../lib/ConfigTemplateInserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateCommand extends BaseCommand {
  static description = '生成 脚手架代码';

  static args = {
    name: Args.string({description: 'Command name'}),
  };

  static flags = {
    ...BaseCommand.flags,
    'config-template': Flags.string({description: 'Config template file path (relative to cwd)'}),
  };

  protected requiredConfigFields(): ConfigFieldRequirement[] {
    return [
      {field: 'root'},
      {field: 'workerDir'},
      {field: 'workerNameEnum', format: 'path#name'},
      {field: 'workerRegister', format: 'path#class.method'},
    ];
  }

  async run() {
    const {args, flags} = await this.parse(GenerateCommand);
    await this.loadConfig();

    let name: string | undefined = args.name as string | undefined;

    if (!name) {
      const answers = await inquirer.prompt<{name: string}>([
        {name: 'name', message: 'Command name?'},
      ]);
      name = answers.name;
    }

    const upperCamelCaseWorkerName = Utility.camelize(name, true);
    const upperCamelCaseWorkerFullName = `${upperCamelCaseWorkerName}CommandWorker`;

    const [workerNameFilePath, workerNameEnum] = this.soraConfig.sora.workerNameEnum.split('#');
    const workerFilePath = path.join(this.soraConfig.sora.workerDir, `${upperCamelCaseWorkerName}CommandWorker`);
    const workerFileExPath = path.join(this.soraConfig.sora.workerDir, `${upperCamelCaseWorkerName}CommandWorker.ts`);
    const workerNameWorkerRelativePath = Utility.resolveImportPath(workerFileExPath, workerNameFilePath) + '.js';

    const [workerRegisterFilePath, registerMethodPath] = this.soraConfig.sora.workerRegister.split('#');
    const [workerRegisterClass, workerRegisterMethod] = registerMethodPath.split('.');

    const existedFile = this.fileTree.getFile(workerFileExPath);
    if (existedFile)
      throw new Error(`Command worker file already exists: '${workerFileExPath}'`);

    const data = {
      upperCamelCaseWorkerName,
      workerNameFilePath,
      workerFileExPath,
      workerNameWorkerRelativePath,
      workerNameEnum,
    };

    const result = template(path.resolve(__dirname, '../../../template/command/CommandWorker.ts.art'), data);
    const workerFile = this.fileTree.newFile(workerFileExPath) as ScriptFileNode;
    workerFile.setContent(Buffer.from(result));

    const workerNameFileExtPath = workerNameFilePath + '.ts';
    const workerNameFile = this.fileTree.getFile(workerNameFileExtPath);
    if (!workerNameFile) {
      throw new Error(`File referenced by 'workerNameEnum' not found: '${workerNameFileExtPath}'. Check the path in your sora.json.`);
    }
    await (workerNameFile as ScriptFileNode).load();
    const workerNameFileAST = new CodeInserter(workerNameFile as ScriptFileNode);
    workerNameFileAST.insertEnum(workerNameEnum, `${upperCamelCaseWorkerName}Command`, Utility.dashlize(`${upperCamelCaseWorkerName}Command`));

    const workerRegisterFileExtPath = workerRegisterFilePath + '.ts';
    const workerRegisterFile = this.fileTree.getFile(workerRegisterFileExtPath);
    if (!workerRegisterFile) {
      throw new Error(`File referenced by 'workerRegister' not found: '${workerRegisterFileExtPath}'. Check the path in your sora.json.`);
    }
    const workerRegisterServiceRelativePath = Utility.resolveImportPath(workerRegisterFilePath, workerFilePath) + '.js';
    await (workerRegisterFile as ScriptFileNode).load();
    const workerRegisterAST = new CodeInserter(workerRegisterFile as ScriptFileNode);
    workerRegisterAST.addImport(upperCamelCaseWorkerFullName, workerRegisterServiceRelativePath, false);
    workerRegisterAST.insertCodeInClassMethod(workerRegisterClass, workerRegisterMethod, `\n    ${upperCamelCaseWorkerFullName}.register();`);

    this.log(`Command ${upperCamelCaseWorkerFullName} generated`);

    await this.fileTree.commit();

    let configTemplate = flags['config-template'];
    if (!configTemplate) {
      const defaultTemplate = ((this.soraConfig.sora as any).configTemplates as Array<{type: string; path: string}> | undefined)?.find(t => t.type === 'command')?.path ?? 'run/config-command.template.yml';
      const answers = await inquirer.prompt<{configTemplate: string}>([
        {name: 'configTemplate', message: 'Config template file?', default: defaultTemplate},
      ]);
      configTemplate = answers.configTemplate;
    }
    const configTemplatePath = path.resolve(process.cwd(), configTemplate);
    await ConfigTemplateInserter.insertConfig(
      configTemplatePath,
      'workers',
      Utility.dashlize(`${upperCamelCaseWorkerName}Command`),
      [],
      (msg) => this.log(msg)
    );
  }
}
