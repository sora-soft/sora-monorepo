import chalk, {type ChalkInstance} from 'chalk';

import type {ILoggerData} from './Logger.js';
import {LogLevel} from './Logger.js';
import type {ILoggerOutputOptions} from './LoggerOutput.js';
import {LoggerOutput} from './LoggerOutput.js';

export interface IConsoleOutputOptions extends ILoggerOutputOptions {
  colors?: {
    [key in LogLevel]?: ChalkInstance;
  };
}

class ConsoleOutput extends LoggerOutput {
  constructor(options: IConsoleOutputOptions) {
    super(options);
    this.consoleOptions_ = options;
  }

  async output(data: ILoggerData) {
    let wrapper: ChalkInstance | undefined = chalk.white;
    if (this.consoleOptions_.colors && this.consoleOptions_.colors[data.level]) {
      wrapper = this.consoleOptions_.colors[data.level];
    } else {
      switch(data.level) {
        case LogLevel.Debug:
          wrapper = chalk.grey;
          break;
        case LogLevel.Warn:
          wrapper = chalk.yellow;
          break;
        case LogLevel.Info:
          wrapper = chalk.cyan;
          break;
        case LogLevel.Success:
          wrapper = chalk.green;
          break;
        case LogLevel.Error:
          wrapper = chalk.red;
          break;
        case LogLevel.Fatal:
          wrapper = chalk.bgRed;
          break;
      }
    }

    if (!wrapper) {
      wrapper = chalk.white;
    }

    // eslint-disable-next-line no-console
    console.log(wrapper(`${data.timeString},${data.level},${data.identify},${data.category},${data.position},${data.content}`));
  }

  async end() {}

  protected consoleOptions_: IConsoleOutputOptions;
}

export {ConsoleOutput};
