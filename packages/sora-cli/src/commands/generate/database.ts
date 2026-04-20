import {flags} from '@oclif/command';
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {CodeInserter} from '../../lib/ast/code-inserter';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateDatabase extends BaseCommand {
  static description = 'Generate a new database entity';

  static flags = {
    ...BaseCommand.flags,
    name: flags.string({char: 'n', description: 'Table name', required: true}),
    file: flags.string({char: 'f', description: 'File name', required: true}),
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
    component: flags.string({char: 'c', description: 'Component name'}),
  };

  async run() {
    const {flags} = this.parse(GenerateDatabase);
    await this.loadConfig();

    const databaseName = Utility.camelize(flags.name, true);
    const fileName = Utility.camelize(flags.file, true);
    const databaseFilePath = path.join(this.soraConfig.sora.databaseDir, fileName);
    const databaseFileExPath = databaseFilePath + '.ts';
    const exitedFile = this.fileTree.getFile(databaseFileExPath);
    const data = {databaseName};

    if (exitedFile) {
      const result = template(path.resolve(__dirname, '../../../template/database/ExtendDatabase.ts.art'), data);
      const databaseFile = exitedFile as ScriptFileNode;
      await databaseFile.load();
      let content = exitedFile.getContent();
      if (!content.endsWith(databaseFile.lineSequence))
        content += databaseFile.lineSequence;
      content += databaseFile.lineSequence;
      databaseFile.setContent(Buffer.from(content + result + databaseFile.lineSequence));
      this.fileTree.addFile(databaseFile);
    } else {
      const result = template(path.resolve(__dirname, '../../../template/database/Database.ts.art'), data);
      const databaseFile = this.fileTree.newFile(databaseFileExPath) as ScriptFileNode;
      databaseFile.setContent(Buffer.from(result));
    }

    if (flags.component) {
      const [componentNameFilePath, componentNameEnum] = this.soraConfig.sora.componentNameEnum.split('#');
      const componentNameFileExPath = componentNameFilePath + '.ts';
      const componentNameFile = this.fileTree.getFile(componentNameFileExPath) as ScriptFileNode;
      if (!componentNameFile)
        throw new Error('Component name file not found');
      await componentNameFile.load();

      const componentNameFileAST = new CodeInserter(componentNameFile);
      const componentNameMap = componentNameFileAST.getEnumStringPair(componentNameEnum);
      const componentNameKey = componentNameMap[flags.component];
      if (!componentNameKey)
        throw new Error('Component name not found');

      const [comFilePath, comName] = this.soraConfig.sora.comClass.split('#');
      const comFileExPath = comFilePath + '.ts';
      const comFile = this.fileTree.getFile(comFileExPath) as ScriptFileNode;
      if (!comFile)
        throw new Error('Com file not found');
      await comFile.load();

      const comFileAST = new CodeInserter(comFile);
      const importPath = Utility.resolveImportPath(comFilePath, databaseFilePath);
      comFileAST.addImport(databaseName, importPath);
      comFileAST.addDatabase(comName, componentNameKey, databaseName);
    }

    this.log(`Database entity ${databaseName} generated`);

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }
}
