import { useEffect, useRef, useState } from "react";

const FreshnessExtraction = () => {
  const [imageFiles, setImageFiles] = useState({ freshness: null });
  const [capturedImages, setCapturedImages] = useState({ freshness: null });
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [freshnessPrediction, setFreshnessPrediction] = useState(false);
  const [PredictedValue, setPredictedValue] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file uploads
  const handleFileChange = (event) => {
    setImageFiles({ freshness: URL.createObjectURL(event.target.files[0]) });
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
    setCapturedImages({ freshness: capturedImage });

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());

    setShowCameraOverlay(false);
  };

  // Upload image and send to server, then handle response
  const uploadImage = async () => {
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput.files[0]) {
      formData.append("file", fileInput.files[0]);
    }
    if (capturedImages.freshness) {
      const response = await fetch(capturedImages.freshness);
      const blob = await response.blob();
      formData.append("file", blob, "captured-image.png");
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/freshness-prediction", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      setFreshnessPrediction(true); 
      setPredictedValue(data["predicted_shelf_life"]) // Assuming server response has 'freshness_score'
    } catch (error) {
      console.error("Error uploading image", error);
    }
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-lg shadow-lg max-w-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        Freshness Extraction
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

      {capturedImages.freshness && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Captured Image</h3>
          <img
            src={capturedImages.freshness}
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
        {imageFiles.freshness && (
          <img
            src={imageFiles.freshness}
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

      {freshnessPrediction && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold">Freshness Prediction</h3>
          <p className="text-lg mt-2">
            The predicted freshness score is:{" "}
            <span className="font-bold">{PredictedValue}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default FreshnessExtraction;
