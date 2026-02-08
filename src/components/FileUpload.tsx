import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Paperclip, 
  X, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Video
} from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  maxVideoSizeMB?: number;
  accept?: string;
  className?: string;
}

function isVideoFile(file: File): boolean {
  const type = file.type;
  const name = file.name.toLowerCase();
  return type.startsWith("video/") || 
         name.endsWith(".mp4") || 
         name.endsWith(".webm") || 
         name.endsWith(".mov") || 
         name.endsWith(".avi");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(file: File) {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  if (type.startsWith("video/") || name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov") || name.endsWith(".avi")) {
    return <Video className="w-5 h-5 text-purple-500" />;
  }
  if (type.startsWith("image/")) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  }
  if (
    type.includes("document") ||
    type.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export function FileUpload({
  files,
  onFilesChange,
  maxSizeMB = 20,
  maxVideoSizeMB = 300,
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.mp4,.webm,.mov,.avi",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const maxVideoSizeBytes = maxVideoSizeMB * 1024 * 1024;

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    setError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      const isVideo = isVideoFile(file);
      const maxSize = isVideo ? maxVideoSizeBytes : maxSizeBytes;
      const limitLabel = isVideo ? maxVideoSizeMB : maxSizeMB;
      
      if (file.size > maxSize) {
        errors.push(`${file.name} excede o limite de ${limitLabel}MB`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(". "));
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setError(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Paperclip className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          Clique para anexar arquivos
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ou arraste e solte aqui
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          PDF, imagens, documentos (máx {maxSizeMB}MB) • Vídeos (máx {maxVideoSizeMB}MB)
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { formatFileSize, getFileIcon };
