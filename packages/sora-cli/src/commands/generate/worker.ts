import {Args, Flags} from '@oclif/core';
import inquirer = require('inquirer');
import template = require('art-template');
import path = require('path');

import {BaseCommand, type ConfigFieldRequirement} from '../../Base';
import {CodeInserter} from '../../lib/ast/CodeInserter';
import {ConfigTemplateInserter} from '../../lib/ConfigTemplateInserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateWorker extends BaseCommand {
  static description = '生成 Worker 脚手架代码';

  static args = {
    name: Args.string({description: 'Worker name'}),
  };

  static flags = {
    ...BaseCommand.flags,
    standalone: Flags.boolean({description: 'Generate as SingletonWorker'}),
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
    const {args, flags} = await this.parse(GenerateWorker);
    await this.loadConfig();

    let name: string | undefined = args.name as string | undefined;
    let standalone: boolean | undefined = flags.standalone;

    if (!name) {
      const answers = await inquirer.prompt<{name: string}>([
        {name: 'name', message: 'Worker name?'},
      ]);
      name = answers.name;
    }

    if (standalone === undefined) {
      const answers = await inquirer.prompt<{standalone: boolean}>([
        {name: 'standalone', message: 'Standalone mode?', type: 'confirm', default: false},
      ]);
      standalone = answers.standalone;
    }

    const upperCamelCaseWorkerName = Utility.camelize(name, true);
    const upperCamelCaseWorkerFullName = `${upperCamelCaseWorkerName}Worker`;

    const [workerNameFilePath, workerNameEnum] = this.soraConfig.sora.workerNameEnum.split('#');
    const workerFilePath = path.join(this.soraConfig.sora.workerDir, `${upperCamelCaseWorkerName}Worker`);
    const workerFileExPath = path.join(this.soraConfig.sora.workerDir, `${upperCamelCaseWorkerName}Worker.ts`);
    const workerNameWorkerRelativePath = Utility.resolveImportPath(workerFileExPath, workerNameFilePath) + '.js';

    const [workerRegisterFilePath, registerMethodPath] = this.soraConfig.sora.workerRegister.split('#');
    const [workerRegisterClass, workerRegisterMethod] = registerMethodPath.split('.');

    const existedFile = this.fileTree.getFile(workerFileExPath);
    if (existedFile)
      throw new Error(`Worker file already exists: '${workerFileExPath}'`);

    const data = {
      upperCamelCaseWorkerName,
      workerNameFilePath,
      workerFileExPath,
      workerNameWorkerRelativePath,
      workerNameEnum,
      standalone,
    };

    const result = template(path.resolve(__dirname, '../../../template/worker/Worker.ts.art'), data);
    const workerFile = this.fileTree.newFile(workerFileExPath) as ScriptFileNode;
    workerFile.setContent(Buffer.from(result));

    const workerNameFileExtPath = workerNameFilePath + '.ts';
    const workerNameFile = this.fileTree.getFile(workerNameFileExtPath);
    if (!workerNameFile) {
      throw new Error(`File referenced by 'workerNameEnum' not found: '${workerNameFileExtPath}'. Check the path in your sora.json.`);
    }
    await (workerNameFile as ScriptFileNode).load();
    const workerNameFileAST = new CodeInserter(workerNameFile as ScriptFileNode);
    workerNameFileAST.insertEnum(workerNameEnum, upperCamelCaseWorkerName, Utility.dashlize(upperCamelCaseWorkerName));

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

    this.log(`Worker ${upperCamelCaseWorkerFullName} generated`);

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
        'workers',
        Utility.dashlize(upperCamelCaseWorkerName),
        [],
        (msg) => this.log(msg)
      );
    }
  }
}
