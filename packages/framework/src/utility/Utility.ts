import ErrorStackParser from 'error-stack-parser';
import path from 'path';

type NonUndefined<T> = T extends undefined ? never : T;

class Utility {
  static null() {}

  static hideKeys<T extends { [key: string] : unknown }>(obj: T, keys: (keyof T)[]) {
    const result: Partial<T> = {};
    Object.entries(obj).forEach(([key, value]: [keyof T, unknown]) => {
      if (!keys.includes(key))
        result[key] = value as T[keyof T];
    });
    return result;
  }

  static isMeaningful<T>(object: T): object is NonUndefined<T> {
    if (typeof object === 'number')
      return !isNaN(object);
    return !this.isUndefined(object);
  }

  static isUndefined(object: any): object is undefined {
    return object === undefined;
  }

  static mapToJSON(map: Map<string, unknown>) {
    return Object.fromEntries(map);
  }

  static parseInt(value: string) {
    return Number.parseInt(value, 10) || 0;
  }

  static randomInt(begin: number, end: number) {
    if (begin >= end)
      return begin;

    return Math.floor(begin + (end - begin) * Math.random());
  }

  static randomOne<T>(array: T[]) {
    const index = this.randomInt(0, array.length);
    return array[index];
  }

  static randomOneByWeight<T>(array: T[], weighter: (ele: T) => number) {
    const weightList = array.map((ele) => weighter(ele));
    const totalWeight = weightList.reduce((pre, ele) => pre + ele, 0);
    const resultWeight = this.randomInt(0, totalWeight);
    let currentWeight = 0;
    for (const [idx, ele] of array.entries()) {
      currentWeight += weightList[idx];
      if (currentWeight > resultWeight) {
        return ele;
      }
    }
    return null;
  }

  static formatLogTimeString() {
    const timezoneOffsetMin = new Date().getTimezoneOffset();
    const offsetHrsNum = Math.abs(timezoneOffsetMin / 60);
    const offsetMinNum = Math.abs(timezoneOffsetMin % 60);
    let offsetHrs = '';
    let offsetMin = '';
    let timezoneStandard = '';

    if(offsetHrsNum < 10)
      offsetHrs = `0${offsetHrsNum}`;

    if(offsetMinNum < 10)
      offsetMin = `0${offsetMinNum}`;

    // Add an opposite sign to the offset
    // If offset is 0, it means timezone is UTC
    if(timezoneOffsetMin < 0)
      timezoneStandard = '+' + offsetHrs + ':' + offsetMin;
    else if(timezoneOffsetMin > 0)
      timezoneStandard = '-' + offsetHrs + ':' + offsetMin;
    else if(timezoneOffsetMin == 0)
      timezoneStandard = 'Z';


    const dt = new Date();
    const currentDate = dt.getDate();
    const currentMonth = dt.getMonth() + 1;
    const currentYear = dt.getFullYear();
    const currentHrs = dt.getHours();
    const currentMins = dt.getMinutes();
    const currentSecs = dt.getSeconds();
    // const current_datetime;

    // Add 0 before date, month, hrs, mins or secs if they are less than 0
    const currentDateStr = currentDate < 10 ? `0${currentDate}` : currentDate;
    const currentMonthStr = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
    const currentHrsStr = currentHrs < 10 ? `0${currentHrs}` : currentHrs;
    const currentMinsStr = currentMins < 10 ? `0${currentMins}` : currentMins;
    const currentSecsStr = currentSecs < 10 ? `0${currentSecs}` : currentSecs;

    // Current datetime
    // String such as 2016-07-16T19:20:30
    const currentDateTime = `${currentYear}-${currentMonthStr}-${currentDateStr}T${currentHrsStr}:${currentMinsStr}:${currentSecsStr}`;
    // Timezone difference in hours and minutes
    // String such as +5:30 or -6:00 or Z
    return currentDateTime + timezoneStandard;
  }

  static deepCopy<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

class UnixTime {
  static fromNodeTime(ms: number) {
    return Math.floor(ms / 1000);
  }

  static fromDate(date: Date) {
    return Math.floor(date.getTime() / 1000);
  }

  static now() {
    return this.fromDate(new Date());
  }

  static day(days: number) {
    return days * this.hour(24);
  }

  static hour(hours: number) {
    return hours * this.minute(60);
  }

  static minute(minutes: number) {
    return minutes * this.second(60);
  }

  static second(seconds: number) {
    return seconds;
  }
}

class NodeTime {
  static fromUnixTime(second: number) {
    return second * 1000;
  }

  static fromDate(date: Date) {
    return date.getTime();
  }

  static now() {
    return new Date().getTime();
  }

  static day(days: number) {
    return days * this.hour(24);// 60 * 60 * 24 * days * 1000;
  }

  static hour(hours: number) {
    return hours * this.minute(60);
  }

  static minute(minutes: number) {
    return minutes * this.second(60);
  }

  static second(seconds: number) {
    return seconds * 1000;
  }
}

export class NanoTime {
  private static readonly originEpochNanos: bigint = BigInt(Date.now()) * 1_000_000n;
  private static readonly originHrTimeNanos: bigint = process.hrtime.bigint();

  static now(): bigint {
    const currentHrTime = process.hrtime.bigint();
    // 计算自启动以来经过的真实纳秒数
    const elapsedNanos = currentHrTime - this.originHrTimeNanos;

    // 绝对起始时间 + 真实经过时间 = 当前精确的绝对纳秒时间
    return this.originEpochNanos + elapsedNanos;
  }
}

class ArrayMap<K, T> extends Map<K, T[]> {
  constructor() {
    super();
  }

  append(k: K, value: T) {
    let pre = this.get(k);
    if (!pre) {
      pre = [];
      this.set(k, pre);
    }
    pre.push(value);
  }

  sureGet(k: K) {
    return this.get(k) || [] as T[];
  }

  remove(k: K, value: T) {
    const pre = this.get(k);
    if (!pre)
      return;
    const index = pre.indexOf(value);
    if (index >= 0) {
      pre.splice(index, 1);
    }
  }
}

class StackUtility {
  static getStack() {
    const my = new Error();
    Error.captureStackTrace(my);
    const stack = ErrorStackParser.parse(my);
    return stack.slice(1).map(line => `${this.formatFileName(line.getFileName())}:${line.getLineNumber()}`);
  }

  static getStackPosition(depth: number) {
    const my = new Error();
    Error.captureStackTrace(my);
    const line = ErrorStackParser.parse(my)[depth + 1];
    return this.normalizePath(`${this.normalizePath(line.getFileName())}:${line.getLineNumber()}`);
  }

  static getStackFile(depth: number) {
    const my = new Error();
    Error.captureStackTrace(my);
    const line = ErrorStackParser.parse(my)[depth + 1];
    return this.normalizePath(line.getFileName());
  }

  static findNearestStack(out: string) {
    const my = new Error();
    Error.captureStackTrace(my);
    const stack = ErrorStackParser.parse(my);
    for (const line of stack.slice(1)) {
      const fileName = this.normalizePath(line.getFileName());
      if (fileName !== out)
        return line;
    }
    return stack[1];
  }

  static getInstantiationStack(targetConstructor: Function) {
    const my = new Error();
    Error.captureStackTrace(my, targetConstructor);

    const stack = ErrorStackParser.parse(my);
    // 因为内部的栈帧都被抹除了，此时的栈顶 [0] 就是外部真正调用 new 的位置
    return stack[0];
  }

  static formatFileName(filePath: string) {
    return this.normalizePath(filePath);
  }

  private static normalizePath(windowsPath: string) {
    return windowsPath.split(path.sep).join(path.posix.sep);
  }
}

export {ArrayMap, NodeTime, StackUtility, UnixTime, Utility};
