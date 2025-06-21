import SparkMD5 from "spark-md5";

// 哈希工具函数（备用实现）
export const computeHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();
    const chunkSize = 1024 * 1024;

    reader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer);
      resolve(spark.end());
    };

    reader.onerror = reject;

    let offset = 0;
    const readNextChunk = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
      offset += chunkSize;
    };

    readNextChunk();
  });
};
