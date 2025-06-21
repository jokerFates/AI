import { useState, useRef, useCallback } from "react";
import { AxiosResponse } from "axios";
import request from "@/services";
import {
  checkFileExists,
  checkUploadedChunks,
  mergeChunks,
} from "@/services/api/book";
import { computeHash } from "@/utils/hash.util";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import { changeIsUploading, getBookListAction } from "@/stores/slice/book";

const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB切片
const CONCURRENT_NUM = 3; // 并发数

const useFileUploader = () => {
  const fileRef = useRef<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedChunks, setUploadedChunks] = useState<Set<number>>(new Set());
  const { user } = useSelector((state: RootState) => state);
  const hashRef = useRef<string>("");
  const totalSizeRef = useRef<number>(0);
  const uploadedSizeRef = useRef<number>(1);
  const dispatch = useDispatch<AppDispatch>();
  // const { hash, status, calculateHash } = useFileHash();

  // 创建切片
  const createChunks = (file: File) => {
    const chunks: File[] = [];
    let cur = 0;
    while (cur < file.size) {
      const chunk = file.slice(cur, cur + CHUNK_SIZE);
      const newFile = new File([chunk], file.name, { type: file.type });
      chunks.push(newFile);
      cur += CHUNK_SIZE;
    }
    return chunks;
  };

  // 初始化上传
  const initUpload = async (file: File) => {
    fileRef.current = file;
    totalSizeRef.current = file.size;
    uploadedSizeRef.current = 0;

    const hash = await computeHash(file);
    hashRef.current = hash;

    // 向服务端查询已上传切片（断点续传）
    const res = await checkUploadedChunks(hash);
    const ids = Object.keys(res.data).map(Number);
    setUploadedChunks(new Set(ids));

    // 计算已上传的大小
    const uploadedSize = ids.reduce((sum, id) => {
      const chunkIndex = id;
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      return sum + (end - start);
    }, 0);

    uploadedSizeRef.current = uploadedSize;
    setProgress((uploadedSize / file.size) * 100);
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const hash = hashRef.current;
      const chunks = createChunks(file);
      const queue: Promise<AxiosResponse<any, any>>[] = [];
      let completedChunks = uploadedChunks.size;

      const isExistRes = await checkFileExists(hash, user.username);
      dispatch(changeIsUploading(true));

      if (isExistRes.data) {
        dispatch(changeIsUploading(false));
        return;
      }

      for (let i = 0; i < chunks.length; i++) {
        if (uploadedChunks.has(i)) continue;

        const formData = new FormData();
        formData.append("file", chunks[i]);
        formData.append("md5", hash);
        formData.append("chunkNumber", i.toString());
        formData.append("totalChunks", chunks.length.toString());
        formData.append("user", localStorage.getItem("username") || "");

        const promise = request.post("/book/upload", formData).catch((err) => {
          console.error(`Chunk ${i} failed:`, err);
          return Promise.reject(err);
        });

        queue.push(promise);
        uploadedSizeRef.current += chunks[i].size;

        // 控制并发数
        if (queue.length >= CONCURRENT_NUM || i === chunks.length - 1) {
          await Promise.allSettled(queue);

          completedChunks += queue.length;
          // 计算整体进度
          const newProgress = Math.round(
            (uploadedSizeRef.current / totalSizeRef.current) * 100
          );
          setProgress(newProgress);
          queue.length = 0;
        }
      }

      const fileType = file.name.substring(file.name.lastIndexOf(".") + 1);

      const mimeType = file.type;

      const mergeParams: Book.MergeParams = {
        md5: hash,
        totalChunks: chunks.length,
        user: localStorage.getItem("username") || "",
        fileName: file.name.split(`.${fileType}`)[0],
        fileType: mimeType,
        fileExtension: fileType,
      };

      await mergeChunks(mergeParams);
      dispatch(changeIsUploading(false));
      setProgress(0);
      dispatch(getBookListAction(user.username));
    },
    [uploadedChunks]
  );

  return { initUpload, progress, uploadedChunks, handleUpload, setProgress };
};

export default useFileUploader;
