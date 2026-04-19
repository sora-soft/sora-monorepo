export class ErrorTracer {
  static trace(target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const wrapper = function (this: any, ...args: any[]) {
      const callerStack: {stack: string} = {stack: ''};
      try {
        const result = originalMethod.apply(this, args);
        Error.captureStackTrace(callerStack, wrapper);

        if (result && result instanceof Promise) {
          return result.catch((err) => {
            if (err instanceof Error && err.stack) {
              const callerFrames = callerStack.stack.split('\n').slice(1);

              const uniqueFrames = callerFrames.filter(frame => {
                const locationMatch = frame.match(/(?:\(|at\s+)(.*:\d+:\d+)\)?/);

                if (locationMatch) {
                  return !err.stack!.includes(locationMatch[1]);
                }

                return !err.stack!.includes(frame.trim());
              });

              if (uniqueFrames.length > 0) {
                err.stack += `\n${uniqueFrames.join('\n')}`;
              }
            }
            throw err;
          });
        }
        return result;
      } catch (error) {
        throw error;
      }
    };
    descriptor.value = wrapper;

    return descriptor;
  }
}
