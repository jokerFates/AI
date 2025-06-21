import { useState, useCallback, useEffect, useRef } from 'react';

export type HashStatus = 'idle' | 'processing' | 'error' | 'completed';

interface UseFileHashReturnType {
  hash: string;
  status: HashStatus;
  calculateHash: (file: File) => void;
}

export const useFileHash = (): UseFileHashReturnType => {
  const [hash, setHash] = useState('');
  const [status, setStatus] = useState<HashStatus>('idle');
  const workerRef = useRef<Worker>();

  const createWorker = useCallback(() => {
    return new Worker(
      new URL('@/workers/file.worker.ts', import.meta.url),
      { type: 'module' }
    );
  }, []);

  const calculateHash = useCallback((file: File) => {
    if (!file) return;

    setStatus('processing');
    setHash('');
    
    const worker = createWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'result') {
        setHash(e.data.payload.hash);
        setStatus('completed');
      } else {
        setStatus('error');
      }
    };

    worker.onerror = () => setStatus('error');
    
    worker.postMessage(file);
  }, [createWorker]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return { hash, status, calculateHash };
};