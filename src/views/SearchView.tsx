import React, { useState, useRef, useEffect } from "react";
import {
  Search as SearchIcon,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SearchResult {
  path: string;
  score: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

export const SearchView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [searchStarted, setSearchStarted] = useState(false);
  const [messageType, setMessageType] = useState<
    "success" | "error" | "warning" | ""
  >("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "bmp", "webp"];

  const isAllowedFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    return (bytes / k).toFixed(2) + " KB";
  };

  const handleFileSelect = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { files: FileList | null } }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      setMessageType("error");
      setMessage(
        "Invalid file format. Allowed: " + ALLOWED_EXTENSIONS.join(", ")
      );
      return;
    }

    setSelectedFile(file);
    setResults([]);
    setMessage("");
    setMessageType("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500");
    handleFileSelect({ target: { files: e.dataTransfer.files } });
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      setMessageType("warning");
      setMessage("Please select an image first");
      return;
    }
    setSearchStarted(true);
    setSearching(true);
    setMessage("");
    setMessageType("");
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/compare_image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorText = await response.text();
        setMessageType("error");
        setMessage(
          `Search failed. Server returned: ${errorText.substring(0, 100)}`
        );
        return;
      }

      const data = await response.json();

      // 🔥 FIX: Adjust to Flask response format
      const searchResults =
        (data || []).map((r: any) => ({
          path: r.path,
          score: r.score,
        })) || [];

      setResults(searchResults);

      if (searchResults.length > 0) {
        setMessageType("success");
        setMessage(`Found ${searchResults.length} similar images!`);
      } else {
        setMessageType("warning");
        setMessage("No similar images found.");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(`Network Error: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setSelectedFile(null);
    setPreview(null);
    setResults([]);
    setMessage("");
    setMessageType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMessageIcon = (type: typeof messageType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Image Search
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Upload an image to find similar images in your trained database
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
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <Card className="shadow-md border-blue-200 h-full">
            <CardHeader className="p-6 md:p-8 border-b border-gray-200">
              <h3 className="text-gray-900 font-bold text-lg">
                {selectedFile ? "Query Image" : "Upload Image"}
              </h3>
            </CardHeader>

            <CardContent className="pt-6 p-6 md:p-8 flex flex-col items-center">
              {!selectedFile ? (
                <div
                  className="w-full border-4 border-dashed border-blue-300 rounded-xl p-16 text-center bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-blue-500");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("border-blue-500");
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-14 h-14 text-blue-600 mx-auto mb-4" />
                  <p className="text-base text-gray-700 mb-2 font-medium">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported: {ALLOWED_EXTENSIONS.join(", ").toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                    {preview && (
                      <img
                        src={preview}
                        alt="Selected Query"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-900 font-bold text-base truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Size: {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {!searchStarted && (
                      <Button
                        onClick={() => {
                          setSearchStarted(true);
                          handleSearch();
                        }}
                        disabled={searching}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-base"
                      >
                        {searching ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Searching...
                          </>
                        ) : (
                          <>
                            <SearchIcon className="mr-2 h-5 w-5" /> Start Search
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        setSearchStarted(false);
                        resetSearch();
                      }}
                      disabled={searching}
                      size="lg"
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <X className="mr-2 h-5 w-5" /> Change Image
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3">
          <Card className="shadow-md border-blue-200 h-full">
            <CardHeader className="p-6 md:p-8 border-b border-gray-200">
              <h3 className="text-gray-900 font-bold text-lg">
                {searching ? "Searching Database..." : "Search Results"}
              </h3>
            </CardHeader>

            <CardContent className="pt-6 p-6 md:p-8 min-h-[400px]">
              {searching && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <h4 className="text-xl font-semibold text-gray-800">
                    Analyzing Embeddings...
                  </h4>
                  <p className="text-gray-600">
                    This involves converting your image into a vector and
                    comparing it against all trained vectors in the database
                    (Qdrant).
                  </p>
                </div>
              )}

              {!searching && results.length === 0 && !selectedFile && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-800">
                    Find Similar Images
                  </h4>
                  <p className="text-gray-600 max-w-sm">
                    Upload a query image on the left to initiate a vector
                    similarity search.
                  </p>
                </div>
              )}

              {!searching &&
                results.length === 0 &&
                selectedFile &&
                messageType === "" && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800">
                      Ready to Search
                    </h4>
                    <p className="text-gray-600 max-w-sm">
                      Click "Start Search" to find similar images.
                    </p>
                  </div>
                )}

              {!searching &&
                results.length === 0 &&
                selectedFile &&
                messageType === "warning" && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800">
                      No Similar Images Found
                    </h4>
                    <p className="text-gray-600 max-w-sm">
                      Try a different image or ensure your dataset has been
                      fully trained.
                    </p>
                  </div>
                )}

              {!searching && results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {results.map((result, index) => {
                    const fileName = result.path.split("/").pop() || "";
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center p-3 border border-gray-200 rounded-lg transition-shadow hover:shadow-lg"
                      >
                        <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          <img
                            src={`${API_BASE_URL}/image?path=${encodeURIComponent(
                              result.path
                            )}`}
                            alt={`Result ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full bg-blue-600 text-white">
                            {(result.score * 100).toFixed(1)}%
                          </div>
                        </div>

                        <p className="text-gray-900 font-semibold text-sm truncate w-full">
                          {fileName}
                        </p>

                        <div className="w-full mt-2">
                          <Progress
                            value={result.score * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8 shadow-md border-gray-200">
        <CardContent className="pt-6 p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            How Vector Search Works
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-4">
            <li>Upload a query image.</li>
            <li>
              The server uses the <strong>CLIP model</strong> to convert the
              image into a high-dimensional vector (<strong>embedding</strong>).
            </li>
            <li>
              This vector is compared against all image vectors stored in the{" "}
              <strong>Qdrant database</strong>.
            </li>
            <li>
              The system returns images with the smallest distance (highest{" "}
              <strong>similarity score</strong>) to your query vector.
            </li>
            <li>
              Similarity scores indicate how semantically close the images are.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
