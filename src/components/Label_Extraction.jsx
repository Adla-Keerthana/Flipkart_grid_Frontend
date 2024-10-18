import { useEffect, useRef, useState } from "react";

const LabelExtraction = () => {
  const [imageFiles, setImageFiles] = useState({ label: null });
  const [capturedImages, setCapturedImages] = useState({ label: null });
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [serverResponse, setServerResponse] = useState(null); // New state for response
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file uploads
  const handleFileChange = (event) => {
    setImageFiles({ label: event.target.files[0] });
  };

  // Handle opening the camera overlay
  const handleCapture = async () => {
    setShowCameraOverlay(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
    } catch (err) {
      console.error("Error accessing the camera", err);
    }
  };

  // Capture an image from the video stream
  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL("image/png");
    setCapturedImages({ label: capturedImage });

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());

    setShowCameraOverlay(false);
  };

  // Upload image and send to server
  const uploadImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Check if the captured image is available or a file is uploaded
    const imageToUpload = capturedImages.label || imageFiles.label;
    if (imageToUpload) {
      if (capturedImages.label) {
        // If the captured image is from canvas, convert dataURL to Blob
        const response = await fetch(capturedImages.label);
        const blob = await response.blob();
        formData.append("file", blob, "capturedImage.png");
      } else {
        // If it's a file upload
        formData.append("file", imageFiles.label);
      }
    } else {
      console.error("No image file to upload");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/label-extraction", {
        method: "POST",
        body: formData,  // Correctly passing formData here
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        console.error("Server error:", errorDetail);
        setServerResponse(errorDetail.detail || "An error occurred");
        return; // Handle error as needed
      }

      const result = await response.json();
      setServerResponse(result); // Store the response directly
    } catch (error) {
      console.error("Network error:", error);
      setServerResponse("Network error occurred. Please try again later.");
    }
  };

  // Helper function to filter and format the server response
  const displayLabels = () => {
    if (!serverResponse || !serverResponse.labels) return null;

    const { labels } = serverResponse;

    // Extract all non-null values
    const extractedLabels = Object.entries(labels)
      .filter(([key, value]) => value !== null && value !== undefined) // Filter out null values
      .map(([key, value]) => (Array.isArray(value) ? value.join(", ") : value)); // Flatten arrays if any

    return (
      <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-100 text-gray-800 rounded-lg">
        {extractedLabels.map((value, index) => (
          <div
            key={index}
            className="bg-white text-center p-3 rounded shadow-sm text-sm"
          >
            {value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-lg shadow-lg max-w-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        Label Extraction
      </h2>

      <div className="flex justify-center mb-4">
        {!showCameraOverlay ? (
          <button
            onClick={handleCapture}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={() => setShowCameraOverlay(false)}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            Stop Camera
          </button>
        )}
      </div>

      {showCameraOverlay && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            className="w-full rounded-lg border border-gray-300"
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button
            onClick={takeSnapshot}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Capture Photo
          </button>
        </div>
      )}

      {capturedImages.label && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Captured Image</h3>
          <img
            src={capturedImages.label}
            alt="Captured"
            className="w-full rounded-lg border border-gray-300"
          />
        </div>
      )}

      <form className="flex flex-col mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-300 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {imageFiles.label && (
          <img
            src={URL.createObjectURL(imageFiles.label)}
            alt="Uploaded"
            className="w-full rounded-lg border border-gray-300 mb-4"
          />
        )}
        <button
          type="button"
          className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
          onClick={uploadImage}
        >
          Upload
        </button>
      </form>

      {/* Display extracted labels */}
      {serverResponse && displayLabels()}
    </div>
  );
};

export default LabelExtraction;
