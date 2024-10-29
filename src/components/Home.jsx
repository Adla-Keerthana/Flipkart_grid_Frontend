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
    <div
      className="flex flex-col items-center min-h-screen justify-center py-12 bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://t4.ftcdn.net/jpg/06/57/20/69/360_F_657206985_7JnPZxrSIP9L6Pk3dyf9i8ljFEpv8iqZ.jpg')`,
      }} // Update the path to your image
    >
      <div className="absolute inset-0 opacity-50"></div>{" "}
      {/* Overlay for better text readability */}
      <div className="relative z-10 text-white">
        <h2 className="text-5xl text-black text-center font-bold mb-8 drop-shadow-md">
          Flipkart Grid 6.0
        </h2>
        <p className="text-center text-black text-xl mb-12 max-w-6xl">
          As part of the Flipkart Grid 6.0 challenge, we are building an
          efficient system for recognizing product labels, predicting expiry
          dates, estimating freshness, and identifying brands from grocery
          product images. Our goal is to enhance efficiency in Smart Vision
          Technology Quality Control by Using Advanced imaging Systems and
          Algorithms to Capture and Analyze visual information.
        </p>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl px-4">
          {/* Label Extraction Card */}
          <div className="bg-white p-8 shadow-lg rounded-lg text-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-black">
              Label Extraction
            </h3>
            <p className="text-gray-600">
              Automatically identify and extract product labels from images,
              making inventory management faster and more accurate.
            </p>
          </div>

          {/* Expiry Extraction Card */}
          <div className="bg-white p-8 shadow-lg rounded-lg text-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-black">
              Expiry Extraction
            </h3>
            <p className="text-gray-600">
              Detect and extract expiry information from product labels to
              ensure freshness and reduce waste.
            </p>
          </div>

          {/* Freshness Prediction Card */}
          <div className="bg-white p-8 shadow-lg rounded-lg text-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-black">
              Freshness Prediction
            </h3>
            <p className="text-gray-600">
              Predict the freshness and shelf life of fruits and vegetables,
              helping you make informed decisions about product quality.
            </p>
          </div>

          {/* Brand Recognition Card */}
          <div className="bg-white p-8 shadow-lg rounded-lg text-center transition duration-300 transform hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-black">
              Brand Recognition
            </h3>
            <p className="text-gray-600">
              Identify and recognize brands from product images to support
              better inventory management and product tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
