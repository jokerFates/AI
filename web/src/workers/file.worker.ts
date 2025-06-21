/// <reference lib="webworker" />

import SparkMD5 from "spark-md5";

self.onmessage = async (event: MessageEvent<File>) => {
  const file = event.data;
  const spark = new SparkMD5.ArrayBuffer();

  try {
    const buffer = await file.arrayBuffer();
    spark.append(buffer);

    self.postMessage({
      type: "result",
      payload: {
        hash: spark.end(),
        algorithm: "md5",
      },
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      payload: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

declare var self: DedicatedWorkerGlobalScope;
