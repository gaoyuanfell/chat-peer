export type promiseOutType = {
  promise: Promise<unknown>;
  resolve: (data?: unknown) => void;
  reject: (reason?: unknown) => void;
};
