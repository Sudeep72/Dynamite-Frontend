import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

interface QueuedFile extends File {
  uploadStatus: "pending" | "ready" | "failed" | "queued";
  id: number;
  previewURL: string;
}

export const UploadView: React.FC = () => {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "bmp", "webp"];
  let fileIdCounter = useRef(0);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewURL) URL.revokeObjectURL(file.previewURL);
      });
    };
  }, [files]);

  const isAllowedFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearMessages = () => {
    setMessage(null);
    setMessageType(null);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    clearMessages();
    if (!selectedFiles) return;

    const selectedFilesArray = Array.from(selectedFiles);

    const validFiles = selectedFilesArray.filter(isAllowedFile);
    const invalidFiles = selectedFilesArray.filter((f) => !isAllowedFile(f));

    if (invalidFiles.length > 0) {
      setMessageType("warning");
      setMessage(
        `${
          invalidFiles.length
        } file(s) rejected. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}.`
      );
    }

    const newQueuedFiles: QueuedFile[] = validFiles.map((file) => ({
      ...file,
      id: fileIdCounter.current++,
      uploadStatus: "queued",
      previewURL: URL.createObjectURL(file),
    }));

    setFiles((prevFiles) => [...prevFiles, ...newQueuedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: number) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === id);
      if (fileToRemove && fileToRemove.previewURL)
        URL.revokeObjectURL(fileToRemove.previewURL);
      return prevFiles.filter((f) => f.id !== id);
    });
    clearMessages();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessageType("warning");
      setMessage("Please select at least one file before uploading.");
      return;
    }

    clearMessages();
    setUploading(true);

    if (!API_BASE_URL) {
      setMessageType("error");
      setMessage("Server configuration error. API base URL is missing.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    const uploadEndpoint = `${API_BASE_URL}/upload`;

    try {
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessageType("success");
        setMessage(`Successfully uploaded ${files.length} file(s)!`);
        files.forEach((file) => URL.revokeObjectURL(file.previewURL));
        setFiles([]);
      } else {
        setMessageType("error");
        setMessage("Upload failed. Please try again.");
      }
    } catch {
      setMessageType("error");
      setMessage(`Network Error: Failed to reach server.`);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSelect = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getStatusIcon = (status: QueuedFile["uploadStatus"]) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "queued":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusText = (status: QueuedFile["uploadStatus"]) => {
    switch (status) {
      case "ready":
        return (
          <span className="text-green-600 text-base font-semibold ml-4 flex-shrink-0">
            Complete
          </span>
        );
      case "queued":
        return (
          <span className="text-gray-600 text-base font-semibold ml-4 flex-shrink-0">
            Queued
          </span>
        );
      case "pending":
        return (
          <span className="text-blue-600 text-base font-semibold ml-4 flex-shrink-0">
            Uploading...
          </span>
        );
      case "failed":
        return (
          <span className="text-red-600 text-base font-semibold ml-4 flex-shrink-0">
            Failed
          </span>
        );
      default:
        return (
          <span className="text-gray-600 text-base font-semibold ml-4 flex-shrink-0">
            Processing
          </span>
        );
    }
  };

  const getMessageIcon = (type: typeof messageType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto cursor-default">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Upload Images
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Add training images to your dataset
      </p>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
            messageType === "success"
              ? "bg-green-100 border border-green-300"
              : messageType === "error"
              ? "bg-red-100 border border-red-300"
              : "bg-yellow-100 border border-yellow-300"
          }`}
        >
          {getMessageIcon(messageType)}
          <p
            className={`font-medium ${
              messageType === "success"
                ? "text-green-800"
                : messageType === "error"
                ? "text-red-800"
                : "text-yellow-800"
            }`}
          >
            {message}
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        multiple
        accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
      />

      <div
        onDragEnter={() => {
          setIsDragging(true);
          clearMessages();
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-4 border-dashed rounded-xl p-16 text-center transition-colors ${
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-blue-300 bg-white"
        }`}
      >
        <Upload className="w-14 h-14 text-blue-500 mx-auto mb-4" />
        <h3 className="text-gray-900 text-xl font-bold mb-3">
          Drag & Drop Images Here
        </h3>
        <p className="text-base text-gray-600 mb-5">or click to browse</p>

        <Button
          onClick={handleManualSelect}
          size="lg"
          className="bg-violet-600 hover:bg-violet-700 text-base"
        >
          Browse Files
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          Supported formats: {ALLOWED_EXTENSIONS.join(", ").toUpperCase()}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-gray-900 font-bold text-lg">
              Selected Files ({files.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className="p-5 flex items-center justify-between shadow-md border-blue-200"
              >
                <CardContent className="p-0 flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-30 h-30 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {isImageFile(file) && file.previewURL ? (
                      <img
                        src={file.previewURL}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileImage className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 font-medium text-base truncate">
                      {file.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </CardContent>

                <div className="flex items-center flex-shrink-0">
                  {getStatusText(file.uploadStatus)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="w-8 h-8 ml-2 text-gray-500 hover:text-red-500"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-base"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" /> Upload {files.length}{" "}
                  File(s)
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {files.length === 0 && !message && (
        <div className="p-6 bg-gray-50 rounded-xl mt-10 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            💡 Tips for Best Results
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>
              <strong>Image Quality:</strong> Use clear, high-resolution images.
            </li>
            <li>
              <strong>Variety:</strong> Include diverse images for better
              embeddings.
            </li>
            <li>
              <strong>Format:</strong> PNG, JPG, JPEG, BMP, and WebP are
              supported.
            </li>
            <li>
              <strong>Size:</strong> Recommended 500x500 pixels or larger.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
