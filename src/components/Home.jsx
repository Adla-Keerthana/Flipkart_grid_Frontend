import React, { useState, useRef } from "react";
import Navbar from "./Navbar";

const Home = () => {
  const [imageFiles, setImageFiles] = useState({
    expiry: null,
    label: null,
    shelfLife: null,
    brand: null,
  });

  const [capturedImages, setCapturedImages] = useState({
    expiry: null,
    label: null,
    shelfLife: null,
    brand: null,
  });

  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file uploads
  const handleFileChange = (event, module) => {
    setImageFiles({
      ...imageFiles,
      [module]: URL.createObjectURL(event.target.files[0]),
    });
  };

  // Handle opening the camera overlay for a specific module
  const handleCapture = async (module) => {
    setActiveModule(module); // Set the active module to know which one is being captured
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
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL("image/png");
    setCapturedImages({ ...capturedImages, [activeModule]: capturedImage });

    // Stop the video stream after capturing the image
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());

    setShowCameraOverlay(false); // Close the camera overlay
  };

  return (
    <>
      <div className="relative p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Module UI */}
          {["expiry", "label", "shelfLife", "brand"].map((module) => (
            <div
              key={module}
              className="p-6 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-center"
            >
              <h2 className="text-2xl font-bold text-neon-yellow mb-4 capitalize">
                {module.replace(/([A-Z])/g, " $1")} Module
              </h2>
              <p className="text-gray-300 mb-4">
                Use either the camera or file upload to provide images.
              </p>

              {/* Image Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event, module)}
                className="mb-4 file:bg-neon-yellow file:text-black text-white"
              />

              {/* Display uploaded or captured image */}
              {imageFiles[module] && (
                <img
                  src={imageFiles[module]}
                  alt={`${module} preview`}
                  className="mb-4 w-full"
                />
              )}
              {capturedImages[module] && (
                <img
                  src={capturedImages[module]}
                  alt={`${module} capture`}
                  className="mb-4 w-full"
                />
              )}

              {/* Capture buttons */}
              <button
                onClick={() => handleCapture(module)}
                className="bg-neon-blue text-white px-4 py-2 rounded hover:bg-neon-blue-dark"
              >
                Capture from Camera
              </button>
            </div>
          ))}
        </div>

        {/* Camera Overlay */}
        {showCameraOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="relative p-8 bg-gray-900 rounded-lg">
              <h3 className="text-white text-xl mb-4 text-center capitalize">
                {activeModule} Module - Camera View
              </h3>

              {/* Video Stream for Camera Capture */}
              <video
                ref={videoRef}
                className="w-full mb-4 border border-neon-blue rounded-lg"
                autoPlay
                playsInline
              />

              <canvas
                ref={canvasRef}
                style={{ display: "none" }}
                width="640"
                height="480"
              ></canvas>

              {/* Snapshot button */}
              <button
                onClick={takeSnapshot}
                className="bg-neon-green text-white px-4 py-2 rounded hover:bg-neon-green-dark"
              >
                Take Snapshot
              </button>

              {/* Close overlay button */}
              <button
                onClick={() => {
                  const stream = videoRef.current.srcObject;
                  const tracks = stream.getTracks();
                  tracks.forEach((track) => track.stop());
                  setShowCameraOverlay(false);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
