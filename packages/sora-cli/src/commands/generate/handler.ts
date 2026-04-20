import {flags} from '@oclif/command';
import template = require('art-template');
import path = require('path');

import {BaseCommand} from '../../base';
import {type ScriptFileNode} from '../../lib/fs/ScriptFileNode';
import {Utility} from '../../lib/Utility';

export default class GenerateHandler extends BaseCommand {
  static description = 'Generate a new handler';

  static flags = {
    ...BaseCommand.flags,
    name: flags.string({char: 'n', description: 'Handler name', required: true}),
    'dry-run': flags.boolean({description: 'Show what would be generated without writing'}),
  };

  async run() {
    const {flags} = this.parse(GenerateHandler);
    await this.loadConfig();

    await this.generateHandler(flags.name, flags['dry-run']);

    if (!flags['dry-run']) {
      await this.fileTree.commit();
    } else {
      this.log('Dry run - no files written');
    }
  }

  async generateHandler(name: string, dryRun?: boolean) {
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
