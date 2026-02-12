'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinary-loader';
import { ProjectImageType } from '@/lib/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = '.jpg, .jpeg, .png, .webp';

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface ImageData {
  src: string;
  width: number;
  height: number;
}

export interface ImageUploadProps {
  initialImage?: ProjectImageType;
  onUploadSuccess: (image: ImageData) => void;
  onRemove: () => void;
}

export default function ImageUpload({ initialImage, onUploadSuccess, onRemove }: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>(
    initialImage?.src ? 'uploaded' : 'idle'
  );
  const [imageData, setImageData] = useState<ImageData | null>(
    initialImage?.src
      ? { src: initialImage.src, width: initialImage.width, height: initialImage.height }
      : null
  );
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Cleanup XHR on unmount
  useEffect(() => {
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const ext = file.name.split('.').pop() || file.type;
      return `Unsupported file type: .${ext}. Please use JPEG, PNG, or WebP.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      xhrRef.current = null;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: ImageData = JSON.parse(xhr.responseText);
          setImageData(result);
          setStatus('uploaded');
          setProgress(100);
          onUploadSuccess(result);
        } catch {
          setStatus('error');
          setErrorMessage('Upload failed. Invalid server response.');
        }
      } else {
        let message = 'Upload failed. Please try again.';
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.message) {
            message = body.message;
          }
        } catch {
        }
        setStatus('error');
        setErrorMessage(message);
      }
    });

    xhr.addEventListener('error', () => {
      xhrRef.current = null;
      setStatus('error');
      setErrorMessage('Upload failed. Please check your connection and try again.');
    });

    xhr.addEventListener('abort', () => {
      xhrRef.current = null;
      setStatus('idle');
      setProgress(0);
    });

    xhr.open('POST', '/api/upload/cloudinary');
    xhr.send(formData);
  }, [validateFile, onUploadSuccess]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }, [uploadFile]);

  const handleClick = useCallback(() => {
    if (status === 'uploading') return;
    fileInputRef.current?.click();
  }, [status]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && status !== 'uploading') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, [status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'uploading') {
      setIsDragOver(true);
    }
  }, [status]);


  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (status === 'uploading') return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [status, uploadFile]);

  const handleRemove = useCallback(() => {
    setStatus('idle');
    setImageData(null);
    setProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove();
  }, [onRemove]);


  // Uploaded state: show thumbnail preview
  if (status === 'uploaded' && imageData) {
    const aspectRatio = imageData.width / imageData.height;
    const previewWidth = Math.min(400, imageData.width);
    const previewHeight = Math.round(previewWidth / aspectRatio);

    return (
      <div className="flex flex-col gap-3">
        <div className="relative inline-block self-start rounded-sm overflow-hidden border border-[#171717]/20">
          <Image
            loader={ cloudinaryLoader }
            src={ imageData.src }
            alt="Uploaded image preview"
            width={ previewWidth }
            height={ previewHeight }
            className="block max-w-full h-auto"
            style={ { maxWidth: '400px' } }
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={ handleRemove }
            className="px-3 py-1.5 text-xs rounded-sm border border-red-300 text-red-500 hover:bg-red-50 transition-colors duration-200"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={ handleClick }
            className="px-3 py-1.5 text-xs rounded-sm border border-[#171717]/20 text-[#8d8d8d] hover:bg-[#171717]/5 transition-colors duration-200"
          >
            Replace
          </button>
        </div>
      </div>
    );
  }

  // Idle, uploading, or error state: show drop zone
  const isError = status === 'error';
  const isUploading = status === 'uploading';

  const borderClass = isError
    ? 'border-[#c97c7c]'
    : isDragOver
      ? 'border-[#b997ce] bg-[#b997ce]/5'
      : 'border-[#171717]/20';

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={ 0 }
        onClick={ handleClick }
        onKeyDown={ handleKeyDown }
        onDragOver={ handleDragOver }
        onDragEnter={ handleDragOver }
        onDragLeave={ handleDragLeave }
        onDrop={ handleDrop }
        className={ `
          relative flex flex-col items-center justify-center gap-3 p-8
          border-2 border-dashed rounded-sm
          transition-colors duration-200
          ${borderClass}
          ${isUploading ? 'cursor-default pointer-events-none opacity-70' : 'cursor-pointer hover:border-[#b997ce] hover:bg-[#b997ce]/5'}
          focus:outline-none focus:ring-2 focus:ring-[#b997ce] focus:border-transparent
        ` }
        aria-label="Image upload area. Drag and drop an image or click to browse."
      >
        { isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <svg
              className="w-8 h-8 text-[#b997ce] animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <div className="w-full bg-[#171717]/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#b997ce] h-full rounded-full transition-all duration-300"
                style={ { width: `${progress}%` } }
              />
            </div>
            <span
              className="text-sm text-[#8d8d8d]"
              aria-live="polite"
            >
              Uploading... { progress }%
            </span>
          </div>
        ) : (
          <>
            <svg
              className="w-10 h-10 text-[#8d8d8d]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={ 1.5 }
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm text-[#8d8d8d]">
              Drag image here or click to browse
            </span>
            <span className="text-xs text-[#8d8d8d]/60">
              JPEG, PNG, or WebP
            </span>
          </>
        ) }
      </div>

      { isError && errorMessage && (
        <p role="alert" className="text-sm text-[#c97c7c]">
          { errorMessage }
        </p>
      ) }

      <input
        ref={ fileInputRef }
        type="file"
        accept={ ACCEPTED_EXTENSIONS }
        onChange={ (e) => handleFileSelect(e.target.files) }
        className="hidden"
        aria-label="Choose an image file to upload"
      />
    </div>
  );
}
