import {flags} from '@oclif/command';
import inquirer = require('inquirer');
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {CodeInserter} from '../../lib/ast/code-inserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateCommand extends BaseCommand {
  static description = 'Generate a new command worker';

  static args = [
    {name: 'name', description: 'Command name'},
  ];

  static flags = {
    ...BaseCommand.flags,
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
  };

  async run() {
    const {args, flags} = this.parse(GenerateCommand);
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
    const workerNameWorkerRelativePath = Utility.resolveImportPath(workerFileExPath, workerNameFilePath);

    const [workerRegisterFilePath, registerMethodPath] = this.soraConfig.sora.workerRegister.split('#');
    const [workerRegisterClass, workerRegisterMethod] = registerMethodPath.split('.');

    const existedFile = this.fileTree.getFile(workerFileExPath);
    if (existedFile)
      throw new Error('Command worker file already exists');

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
    const workerNameFile = this.fileTree.getFile(workerNameFileExtPath) as ScriptFileNode;
    await workerNameFile.load();
    const workerNameFileAST = new CodeInserter(workerNameFile);
    workerNameFileAST.insertEnum(workerNameEnum, `${upperCamelCaseWorkerName}Command`, Utility.dashlize(`${upperCamelCaseWorkerName}Command`));

    const workerRegisterFileExtPath = workerRegisterFilePath + '.ts';
    const workerRegisterFile = this.fileTree.getFile(workerRegisterFileExtPath) as ScriptFileNode;
    const workerRegisterServiceRelativePath = Utility.resolveImportPath(workerRegisterFilePath, workerFilePath);
    await workerRegisterFile.load();
    const workerRegisterAST = new CodeInserter(workerRegisterFile);
    workerRegisterAST.addImport(upperCamelCaseWorkerFullName, workerRegisterServiceRelativePath, false);
    workerRegisterAST.insertCodeInClassMethod(workerRegisterClass, workerRegisterMethod, `\n    ${upperCamelCaseWorkerFullName}.register();`);

    this.log(`Command ${upperCamelCaseWorkerFullName} generated`);

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }
}
