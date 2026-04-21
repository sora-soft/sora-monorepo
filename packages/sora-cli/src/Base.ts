import {Command, flags as oclifFlags} from '@oclif/command';

import {Config} from './lib/Config';
import {FileTree} from './lib/fs/FileTree';

abstract class BaseCommand extends Command {
  static flags = {
    help: oclifFlags.help({char: 'h'}),
  };

  protected soraConfig_: Config | null = null;
  protected fileTree_: FileTree | null = null;

  protected async loadConfig() {
    this.soraConfig_ = new Config();
    await this.soraConfig_.load();
    this.fileTree_ = new FileTree(this.soraConfig_.soraRoot);
    await this.fileTree_.load();
  }

  protected get soraConfig(): Config {
    if (!this.soraConfig_) throw new Error('Config not loaded. Call loadConfig() first.');
    return this.soraConfig_;
  }

  protected get fileTree(): FileTree {
    if (!this.fileTree_) throw new Error('FileTree not loaded. Call loadConfig() first.');
    return this.fileTree_;
  }
}

export {BaseCommand};
