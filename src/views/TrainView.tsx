import React, { useState, useEffect } from "react";
import {
  Brain,
  Zap,
  RotateCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

export const TrainView: React.FC = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "queued" | "running" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [trainingStartTime, setTrainingStartTime] = useState<number | null>(
    null
  );
  const [elapsedTime, setElapsedTime] = useState(0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTraining = () => {
    setJobId(null);
    setStatus("idle");
    setProgress(0);
    setProcessed(0);
    setTotal(0);
    setMessage("");
    setStatusMessage("");
    setTrainingStartTime(null);
    setElapsedTime(0);
  };

  const startTraining = async () => {
    try {
      setTrainingStartTime(Date.now());

      const response = await fetch(`${API_BASE_URL}/start_train`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      if (data.job_id) {
        setJobId(data.job_id);
        setStatus("queued");
        setProgress(0);
        setProcessed(0);
        setTotal(0);
        setMessage("");
        setStatusMessage("Starting training job...");
      } else {
        throw new Error("Could not retrieve job ID from server.");
      }
    } catch (error: any) {
      console.error("Start Training Error:", error);
      setStatusMessage(`Error starting job: ${error.message}`);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/train_status/${jobId}`);
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();

        const newStatus = data.status || "error";
        setStatus(newStatus);
        setProgress(data.progress || 0);
        setProcessed(data.processed || 0);
        setTotal(data.total || 0);
        setMessage(data.message || "");

        if (newStatus === "done") {
          setStatusMessage(
            `Training complete! Processed ${data.processed} images.`
          );
          clearInterval(interval);
        } else if (newStatus === "error") {
          setStatusMessage(
            `Error: ${
              data.message || "An unknown error occurred during training."
            }`
          );
          clearInterval(interval);
        } else if (newStatus === "running") {
          setStatusMessage(
            `Processing: ${data.processed}/${data.total} images`
          );
        } else if (newStatus === "queued") {
          setStatusMessage("Job is queued and waiting to start.");
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (status !== "running" || !trainingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - trainingStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, trainingStartTime]);

  const getStatusIcon = (currentStatus: typeof status) => {
    switch (currentStatus) {
      case "queued":
        return <RotateCw className="w-6 h-6 animate-spin text-blue-500" />;
      case "running":
        return <Brain className="w-6 h-6 text-violet-600 animate-pulse" />;
      case "done":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const processingSpeed = elapsedTime > 0 ? processed / elapsedTime : 0;
  const timeRemaining =
    total > 0 && processed > 0 && processingSpeed > 0
      ? Math.ceil((total - processed) / processingSpeed)
      : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Train Model
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Generate CLIP embeddings for your uploaded images
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {status === "idle" && (
            <Card className="shadow-md border-blue-200">
              <CardHeader className="p-6 md:p-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-100 rounded-full">
                    <Brain className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-xl">
                    Ready to Train?
                  </h3>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6 p-6 md:p-8">
                <p className="text-gray-600 text-base">
                  Training will process all uploaded images and generate CLIP
                  embeddings. These embeddings will be stored in the Qdrant
                  vector database for fast similarity search.
                </p>
              </CardContent>

              <CardFooter className="p-6 md:p-8 pt-0">
                <Button
                  onClick={startTraining}
                  size="lg"
                  className="w-full bg-violet-600 hover:bg-violet-700 font-bold text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              </CardFooter>
            </Card>
          )}

          {status !== "idle" && (
            <Card
              className={`shadow-md ${
                status === "error" ? "border-red-400" : "border-blue-200"
              }`}
            >
              <CardHeader className="p-6 md:p-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      status === "done"
                        ? "bg-green-100"
                        : status === "error"
                        ? "bg-red-100"
                        : "bg-violet-100"
                    }`}
                  >
                    {getStatusIcon(status)}
                  </div>
                  <h3
                    className={`font-bold text-xl ${
                      status === "done"
                        ? "text-green-700"
                        : status === "error"
                        ? "text-red-700"
                        : "text-violet-700"
                    }`}
                  >
                    {statusMessage || getStatusIcon(status)}
                  </h3>
                </div>
              </CardHeader>

              <CardContent className="pt-6 p-6 md:p-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {status === "queued" && "Preparing Job..."}
                  {status === "running" && "Processing Images"}
                  {status === "done" && "Completed"}
                  {status === "error" && "Details"}
                </h4>

                {status !== "done" && status !== "error" && (
                  <div className="mb-6">
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-violet-600 font-bold">
                        {progress}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-3"
                      indicatorClassName="bg-violet-600"
                    />
                    <p className="text-gray-600 text-sm mt-2">
                      Processed {processed} of {total} images
                    </p>
                  </div>
                )}

                {status === "running" && (
                  <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                    <div className="p-2">
                      <span className="text-xs text-gray-500 block">
                        Elapsed Time
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-xs text-gray-500 block">
                        Processing Speed
                      </span>
                      <span className="font-semibold text-gray-800">
                        {processingSpeed.toFixed(2)} img/s
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-xs text-gray-500 block">
                        Est. Time Remaining
                      </span>
                      <span className="font-semibold text-gray-800">
                        {total > 0 && processed > 0
                          ? formatTime(timeRemaining)
                          : "..."}
                      </span>
                    </div>
                  </div>
                )}

                {message && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      status === "error"
                        ? "bg-red-50 border border-red-300 text-red-800"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      Status Detail: {message}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-6 md:p-8 pt-0">
                {(status === "done" || status === "error") && (
                  <Button
                    onClick={resetTraining}
                    size="lg"
                    variant="outline"
                    className="w-full border-violet-600 text-violet-600 hover:bg-violet-50 font-bold text-lg"
                  >
                    <RotateCw className="w-5 h-5 mr-2" />
                    {status === "done" ? "Start New Training" : "Try Again"}
                  </Button>
                )}
                {(status === "queued" || status === "running") && (
                  <Button
                    disabled={true}
                    size="lg"
                    className="w-full bg-gray-400 font-bold text-lg cursor-not-allowed"
                  >
                    {status === "queued" ? "Job Queued..." : "Training Active"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="lg:w-1/3">
          <Card className="shadow-md border-gray-200">
            <CardContent className="pt-6 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-violet-600" />
                Training Tips
              </h3>
              <ul className="list-disc list-inside space-y-3 text-gray-600">
                <li>
                  <strong>Patience:</strong> Training time depends on the number
                  of images and hardware.
                </li>
                <li>
                  <strong>GPU:</strong> Training will be significantly faster
                  with a compatible GPU.
                </li>
                <li>
                  <strong>Database:</strong> Embeddings are stored in the local
                  **Qdrant** instance.
                </li>
                <li>
                  <strong>Retraining:</strong> You can restart training anytime
                  to update the embeddings for new images.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
