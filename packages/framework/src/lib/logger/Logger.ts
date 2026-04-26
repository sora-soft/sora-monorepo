import ErrorStackParser from 'error-stack-parser';
import path from 'node:path';

import {ErrorLevel, ExError} from '../../utility/ExError.js';
import {Utility} from '../../utility/Utility.js';
import {Context} from '../context/Context.js';
import {LogScope} from '../context/scope/LogScope.js';
import type {LoggerOutput} from './LoggerOutput.js';

export interface ILoggerOptions {
  identify: string;
}

export interface ILoggerData {
  time: Date;
  timeString: string;
  identify: string;
  category: string;
  level: LogLevel;
  error?: Error | null;
  content: string;
  position: string;
  stack: ErrorStackParser.StackFrame[];
  raw: any;
  pid: number;
}

export enum LogLevel {
  Debug = 1,
  Info,
  Success,
  Warn,
  Error,
  Fatal,
}

class CategoryLogger {
  constructor(logger: Logger) {
    this.logger_ = logger;
  }

  debug(content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.debug(scope?.logCategory || '', content, this.debug);
  }

  info(content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.info(scope?.logCategory || '', content, this.info);
  }

  warn(content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.warn(scope?.logCategory || '', content, this.warn);
  }

  success(content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.success(scope?.logCategory || '', content, this.success);
  }

  fatal(error: Error, content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.fatal(scope?.logCategory || '', error, content, this.fatal);
  }

  error(error: Error | ExError, content: unknown) {
    const scope = Context.find(LogScope);
    this.logger_.error(scope?.logCategory || '', error, content, this.error);
  }

  private logger_: Logger;
}

class Logger {
  private static getStack() {
    const my = new Error();
    Error.captureStackTrace(my);
    return ErrorStackParser.parse(my);
  }

  private static normalizePath(windowsPath: string) {
    return windowsPath.split(path.sep).join(path.posix.sep);
  }

  static errorMessage(e: ExError | Error) {
    const err = ExError.fromError(e);
    try {
      const stack = ErrorStackParser.parse(e).map(line => `${this.normalizePath(line.getFileName() || 'unknown')}:${line.getLineNumber()}`);
      return {code: err.code, name: err.name, message: err.message, stack, args: err.args};
    } catch (_) {
      return e;
    }
  }

  constructor(options: ILoggerOptions) {
    this.options_ = options;
    this.output_ = [];
    this.categoryLogger_ = new CategoryLogger(this);
  }

  debug(category: string, content: unknown, boundaryFn: Function = this.debug) {
    this.write(LogLevel.Debug, category, null, content, boundaryFn);
  }

  info(category: string, content: unknown, boundaryFn: Function = this.info) {
    this.write(LogLevel.Info, category, null, content, boundaryFn);
  }

  warn(category: string, content: unknown, boundaryFn: Function = this.warn) {
    this.write(LogLevel.Warn, category, null, content, boundaryFn);
  }

  success(category: string, content: unknown, boundaryFn: Function = this.success) {
    this.write(LogLevel.Success, category, null, content, boundaryFn);
  }

  fatal(category: string, error: Error, content: unknown, boundaryFn: Function = this.fatal) {
    this.write(LogLevel.Fatal, category, error, content, boundaryFn);
  }

  error(category: string, error: Error | ExError, content: unknown, boundaryFn: Function = this.error) {
    switch (error instanceof ExError ? error.level : undefined) {
      case ErrorLevel.Fatal:
        this.write(LogLevel.Fatal, category, error, content, boundaryFn);
        return;
      case ErrorLevel.Expected:
        this.write(LogLevel.Warn, category, error, content, boundaryFn);
        return;
      case ErrorLevel.Silent:
        return;
      default:
        this.write(LogLevel.Error, category, error, content, boundaryFn);
        return;
    }
  }

  pipe(output: LoggerOutput) {
    this.output_.push(output);
    return this;
  }

  async end() {
    await Promise.all(this.output_.map(async (output) => {
      await output.end();
    }));
  }

  private write(level: LogLevel, category: string, error: Error | null | undefined, content: unknown, boundaryFn: Function = this.write) {
    const now = new Date();
    const timeString = Utility.formatLogTimeString();

    const err = new Error();
    Error.captureStackTrace(err, boundaryFn);

    const stackFrames = ErrorStackParser.parse(err);
    const callerFrame = stackFrames[0];
    let position = 'unknown:?';
    if (callerFrame) {
      const fileName = callerFrame.getFileName();
      const baseName = fileName ? path.basename(fileName) : 'unknown';
      const lineNum = callerFrame.getLineNumber() || '?';
      position = `${baseName}:${lineNum}`;
    }

    for (const output of this.output_) {
      output.log({
        time: now,
        identify: this.options_.identify,
        category,
        timeString,
        level,
        error,
        pid: process.pid,
        content: this.generateContent(content),
        stack: Logger.getStack(),
        position,
        raw: content,
      });
    }
  }

  private generateContent(content: unknown) {
    return JSON.stringify(content);
  }

  get category() {
    return this.categoryLogger_;
  }

  private options_: ILoggerOptions;
  private output_: LoggerOutput[];
  private categoryLogger_: CategoryLogger;
}

export {Logger};

