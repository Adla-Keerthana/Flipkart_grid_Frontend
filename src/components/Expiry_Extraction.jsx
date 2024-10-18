import { useEffect, useRef, useState } from "react";

const ExpiryRecognition = () => {
  const [imageFiles, setImageFiles] = useState({ expiry: null });
  const [capturedImages, setCapturedImages] = useState({ expiry: null });
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [serverResponse, setServerResponse] = useState(""); // Add this line
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file uploads
  const handleFileChange = (event) => {
    setImageFiles({ expiry: URL.createObjectURL(event.target.files[0]) });
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
    setCapturedImages({ expiry: capturedImage });

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
    const imageToUpload = capturedImages.expiry || imageFiles.expiry;
    if (imageToUpload) {
      if (capturedImages.expiry) {
        // If the captured image is from canvas, convert dataURL to Blob
        const response = await fetch(capturedImages.expiry);
        const blob = await response.blob();
        formData.append("file", blob, "capturedImage.png");
      } else {
        // If it's a file upload
        const file = await fetch(imageFiles.expiry).then((res) => res.blob());
        formData.append("file", file, "uploadedImage.png");
      }
    } else {
      console.error("No image file to upload");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/expiry-extraction", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        console.error("Server error:", errorDetail);
        setServerResponse(errorDetail.detail || "An error occurred");
        return;
      }

      const result = await response.json();
      setServerResponse(result);
    } catch (error) {
      console.error("Network error:", error);
      setServerResponse("Network error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-lg shadow-lg max-w-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        Expiry Recognition
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

      {capturedImages.expiry && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Captured Image</h3>
          <img
            src={capturedImages.expiry}
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
        {imageFiles.expiry && (
          <img
            src={imageFiles.expiry}
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

    {serverResponse && (
  <div className="mt-4">
    <h3 className="text-xl font-semibold">Server Response:</h3>
    <p><strong>Highest Date:</strong> {serverResponse.highest_date}</p>
    <p><strong>Raw Text:</strong> {serverResponse.raw_text}</p>
    <div>
      <strong>Extracted Dates:</strong>
      {Array.isArray(serverResponse.extracted_dates) ? (
        <ul>
          {serverResponse.extracted_dates.map((date, index) => (
            <li key={index}>{date}</li>
          ))}
        </ul>
      ) : (
        serverResponse.extracted_dates
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default ExpiryRecognition;
