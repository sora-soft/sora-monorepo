declare module 'libnpmconfig' {
  interface FiggyPudding {
    get(key: string): string | undefined;
    toJSON(): Record<string, unknown>;
  }
  function read(): FiggyPudding;
  export {read};
}
