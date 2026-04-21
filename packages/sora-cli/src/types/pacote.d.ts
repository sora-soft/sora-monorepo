declare module 'pacote' {
  function extract(spec: string, dest: string, opts?: Record<string, unknown>): Promise<void>;
  export {extract};
}
