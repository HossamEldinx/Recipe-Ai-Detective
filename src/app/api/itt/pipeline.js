import { pipeline } from "@xenova/transformers";



const P = () =>
  class PipelineSingleton {
    static task = "image-to-text";
    static model = "Salesforce/blip2-opt-2.7b";
    static instance = null;

    static async getInstance(progress_callback = null) {
      if (this.instance === null) {
        this.instance = pipeline(this.task, this.model, { progress_callback });
      }
      return this.instance;
    }
  }

let PipelineSingleton;
if (process.env.NODE_ENV !== "production") {
  // When running in development mode, attach the pipeline to the
  // global object so that it's preserved between hot reloads.
  // For more information, see https://vercel.com/guides/nextjs-prisma-postgres
  if (!global.PipelineSingleton) {
    global.PipelineSingleton = P();
  }
  PipelineSingleton = global.PipelineSingleton;
} else {
  PipelineSingleton = P();
}
export default PipelineSingleton;
