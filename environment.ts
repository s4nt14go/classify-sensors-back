declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      UPLOAD_BUCKET: string;
      OUTPUT_BUCKET: string;
    }
  }
}
export {}
