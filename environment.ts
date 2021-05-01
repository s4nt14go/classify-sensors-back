declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BUCKET_OUTPUT: string;
    }
  }
}
export {}
