import {flags} from '@oclif/command';
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {CodeInserter} from '../../lib/ast/code-inserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateService extends BaseCommand {
  static description = 'Generate a new service';

  static flags = {
    ...BaseCommand.flags,
    name: flags.string({char: 'n', description: 'Service name', required: true}),
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
    'with-handler': flags.boolean({description: 'Also generate a handler for the service'}),
  };

  async run() {
    const {flags} = this.parse(GenerateService);
    await this.loadConfig();

    const [serviceNameFilePath, serviceNameEnum] = this.soraConfig.sora.serviceNameEnum.split('#');
    const serviceFileName = `${Utility.camelize(flags.name, true)}Service.ts`;
    const serviceFilePath = path.join(this.soraConfig.sora.serviceDir, `${Utility.camelize(flags.name, true)}Service`);
    const serviceFileExPath = path.join(this.soraConfig.sora.serviceDir, serviceFileName);
    const serviceNameServiceRelativePath = Utility.resolveImportPath(serviceFileExPath, serviceNameFilePath);
    const upperCamelCaseServiceName = Utility.camelize(flags.name, true);
    const upperCamelCaseServiceFullName = `${upperCamelCaseServiceName}Service`;
    const [serviceRegisterFilePath, registerMethodPath] = this.soraConfig.sora.serviceRegister.split('#');
    const [serviceRegisterClass, serviceRegisterMethod] = registerMethodPath.split('.');

    const exitedFile = this.fileTree.getFile(serviceFileExPath);
    if (exitedFile)
      throw new Error('Service file exited');

    const data = {
      upperCamelCaseServiceName,
      serviceNameFilePath,
      serviceFileExPath,
      serviceNameServiceRelativePath,
      serviceNameEnum,
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

    if (flags['with-handler']) {
      await this.generateHandlerInternal(flags.name, flags['dry-run']);
    }

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }

  private async generateHandlerInternal(name: string, dryRun?: boolean) {
    const handlerName = Utility.camelize(name, true);
    const handlerFilePath = path.join(this.soraConfig.sora.handlerDir, `${handlerName}Handler`);
    const handlerFileExPath = handlerFilePath + '.ts';

    const exitedFile = this.fileTree.getFile(handlerFileExPath);
    if (exitedFile)
      throw new Error('Handler file exited');

    const data = {handlerName};
    const result = template(path.resolve(__dirname, '../../../template/handler/Handler.ts.art'), data);
    const handlerFile = this.fileTree.newFile(handlerFileExPath) as ScriptFileNode;
    handlerFile.setContent(Buffer.from(result));

    this.log(`Handler ${handlerName}Handler generated`);
  }
}
