import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  DocumentIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useUploadFile, useUploadFiles, useDeleteFile } from '@/lib/queries';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface UploadedFile {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at?: string;
}

interface FileUploadPreview {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded?: UploadedFile;
  error?: string;
}

const FOLDER_OPTIONS = [
  { value: 'projects', label: 'Projects' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'profile', label: 'Profile' },
  { value: 'general', label: 'General' },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function FilePreview({
  file,
  onRemove,
  onRetry
}: {
  file: FileUploadPreview;
  onRemove: () => void;
  onRetry?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [showUrlTooltip, setShowUrlTooltip] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowUrlTooltip(true);
      setTimeout(() => setShowUrlTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const isImage = file.file.type.startsWith('image/');

  return (
    <motion.div
      className="relative bg-card border border-border rounded-lg p-4"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
      >
        <XMarkIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* File preview */}
      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {isImage ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <DocumentIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* File info */}
      <div className="space-y-2">
        <h3 className="font-medium text-foreground text-sm truncate" title={file.file.name}>
          {file.file.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {/* Upload status */}
        {file.uploading && (
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse w-1/2" />
            </div>
            <p className="text-xs text-primary">Uploading...</p>
          </div>
        )}

        {file.error && (
          <div className="space-y-2">
            <p className="text-xs text-destructive">{file.error}</p>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry} className="w-full">
                Retry
              </Button>
            )}
          </div>
        )}

        {file.uploaded && (
          <div className="space-y-2">
            <p className="text-xs text-green-600 dark:text-green-400">Uploaded successfully</p>

            {/* Upload details */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Format: {file.uploaded.format.toUpperCase()}</p>
              {file.uploaded.width && file.uploaded.height && (
                <p>Size: {file.uploaded.width} × {file.uploaded.height}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(file.uploaded!.secure_url)}
                  className="flex-1"
                >
                  <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                  Copy URL
                </Button>

                {showUrlTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap">
                    Copied!
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(file.uploaded!.secure_url, '_blank')}
              >
                <EyeIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function UploadManagerPage() {
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [uploadQueue, setUploadQueue] = useState<FileUploadPreview[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const uploadFileMutation = useUploadFile();
  const uploadFilesMutation = useUploadFiles();
  const deleteFileMutation = useDeleteFile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileUploadPreview[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));

    setUploadQueue((prev) => [...prev, ...newFiles]);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const uploadFiles = async () => {
    const filesToUpload = uploadQueue.filter(f => !f.uploading && !f.uploaded && !f.error);

    if (filesToUpload.length === 0) return;

    // Mark files as uploading
    setUploadQueue(prev =>
      prev.map(file =>
        filesToUpload.find(f => f.id === file.id)
          ? { ...file, uploading: true, error: undefined }
          : file
      )
    );

    try {
      if (filesToUpload.length === 1) {
        // Single file upload
        const file = filesToUpload[0];
        const result = await uploadFileMutation.mutateAsync({
          file: file.file,
          folder: selectedFolder,
        });

        setUploadQueue(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, uploading: false, uploaded: result.data }
              : f
          )
        );

        setRecentUploads(prev => [result.data, ...prev]);
      } else {
        // Multiple file upload
        const files = filesToUpload.map(f => f.file);
        const result = await uploadFilesMutation.mutateAsync({
          files,
          folder: selectedFolder,
        });

        result.data.files.forEach((uploadedFile: UploadedFile, index: number) => {
          const originalFile = filesToUpload[index];
          setUploadQueue(prev =>
            prev.map(f =>
              f.id === originalFile.id
                ? { ...f, uploading: false, uploaded: uploadedFile }
                : f
            )
          );
        });

        setRecentUploads(prev => [...result.data.files, ...prev]);
      }
    } catch (error) {
      console.error('Upload failed:', error);

      setUploadQueue(prev =>
        prev.map(file =>
          filesToUpload.find(f => f.id === file.id)
            ? {
              ...file,
              uploading: false,
              error: error instanceof Error ? error.message : 'Upload failed'
            }
            : file
        )
      );
    }
  };

  const removeFromQueue = (fileId: string) => {
    setUploadQueue(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const clearCompleted = () => {
    setUploadQueue(prev => {
      const toRemove = prev.filter(f => f.uploaded || f.error);
      toRemove.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return prev.filter(f => !f.uploaded && !f.error);
    });
  };

  const retryUpload = (fileId: string) => {
    setUploadQueue(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, error: undefined }
          : file
      )
    );
  };

  const pendingUploads = uploadQueue.filter(f => !f.uploaded && !f.error);
  const completedUploads = uploadQueue.filter(f => f.uploaded || f.error);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload Manager</h1>
        <p className="text-muted-foreground">
          Upload and manage images and documents for your portfolio
        </p>
      </motion.div>

      {/* Upload Settings */}
      <motion.div
        className="bg-card border border-border rounded-lg p-6"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <FolderIcon className="h-5 w-5 text-muted-foreground" />
          <label htmlFor="folder" className="text-sm font-medium text-foreground">
            Upload to folder:
          </label>
          <select
            id="folder"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {FOLDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive && !isDragReject && 'border-primary bg-primary/5',
            isDragReject && 'border-destructive bg-destructive/5',
            !isDragActive && 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          {isDragActive ? (
            isDragReject ? (
              <p className="text-destructive">Some files are not supported</p>
            ) : (
              <p className="text-primary">Drop files here...</p>
            )
          ) : (
            <div>
              <p className="text-foreground font-medium mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: Images (JPEG, PNG, GIF, WebP) and PDF files up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Actions */}
        {uploadQueue.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {uploadQueue.length} file(s) in queue
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCompleted}
                disabled={completedUploads.length === 0}
              >
                Clear Completed
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={pendingUploads.length === 0 || uploadQueue.some(f => f.uploading)}
              >
                Upload {pendingUploads.length} File(s)
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground">Upload Queue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {uploadQueue.map((file) => (
                <FilePreview
                  key={file.id}
                  file={file}
                  onRemove={() => removeFromQueue(file.id)}
                  onRetry={file.error ? () => retryUpload(file.id) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {recentUploads.slice(0, 10).map((upload) => (
              <div key={upload.public_id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {upload.resource_type === 'image' ? (
                    <img
                      src={buildCloudinaryUrl(upload.public_id, cloudinaryTransforms.thumbnail)}
                      alt="Upload"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DocumentIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {upload.public_id.split('/').pop()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(upload.bytes)} • {upload.format.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(upload.secure_url)}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(upload.secure_url, '_blank')}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFileMutation.mutate(upload.public_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
