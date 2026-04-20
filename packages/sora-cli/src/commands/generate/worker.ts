import {flags} from '@oclif/command';
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {CodeInserter} from '../../lib/ast/code-inserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateWorker extends BaseCommand {
  static description = 'Generate a new worker';

  static flags = {
    ...BaseCommand.flags,
    name: flags.string({char: 'n', description: 'Worker name', required: true}),
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
  };

  async run() {
    const {flags} = this.parse(GenerateWorker);
    await this.loadConfig();

    const [workerNameFilePath, workerNameEnum] = this.soraConfig.sora.workerNameEnum.split('#');
    const workerFileName = `${Utility.camelize(flags.name, true)}Worker.ts`;
    const workerFilePath = path.join(this.soraConfig.sora.workerDir, `${Utility.camelize(flags.name, true)}Worker`);
    const workerFileExPath = path.join(this.soraConfig.sora.workerDir, workerFileName);
    const workerNameWorkerRelativePath = Utility.resolveImportPath(workerFileExPath, workerNameFilePath);
    const upperCamelCaseWorkerName = Utility.camelize(flags.name, true);
    const upperCamelCaseWorkerFullName = `${upperCamelCaseWorkerName}Worker`;
    const [workerRegisterFilePath, registerMethodPath] = this.soraConfig.sora.workerRegister.split('#');
    const [workerRegisterClass, workerRegisterMethod] = registerMethodPath.split('.');

    const exitedFile = this.fileTree.getFile(workerFileExPath);
    if (exitedFile)
      throw new Error('Worker file exited');

    const data = {
      upperCamelCaseWorkerName,
      workerNameFilePath,
      workerFileExPath,
      workerNameWorkerRelativePath,
      workerNameEnum,
    };

    const result = template(path.resolve(__dirname, '../../../template/worker/Worker.ts.art'), data);
    const workerFile = this.fileTree.newFile(workerFileExPath) as ScriptFileNode;
    workerFile.setContent(Buffer.from(result));

    const workerNameFileExtPath = workerNameFilePath + '.ts';
    const workerNameFile = this.fileTree.getFile(workerNameFileExtPath) as ScriptFileNode;
    await workerNameFile.load();
    const workerNameFileAST = new CodeInserter(workerNameFile);
    workerNameFileAST.insertEnum(workerNameEnum, upperCamelCaseWorkerName, Utility.dashlize(upperCamelCaseWorkerName));

    const workerRegisterFileExtPath = workerRegisterFilePath + '.ts';
    const workerRegisterFile = this.fileTree.getFile(workerRegisterFileExtPath) as ScriptFileNode;
    const workerRegisterServiceRelativePath = Utility.resolveImportPath(workerRegisterFilePath, workerFilePath);
    await workerRegisterFile.load();
    const workerRegisterAST = new CodeInserter(workerRegisterFile);
    workerRegisterAST.addImport(upperCamelCaseWorkerFullName, workerRegisterServiceRelativePath, false);
    workerRegisterAST.insertCodeInClassMethod(workerRegisterClass, workerRegisterMethod, `\n    ${upperCamelCaseWorkerFullName}.register();`);

    this.log(`Worker ${upperCamelCaseWorkerFullName} generated`);

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }
}
