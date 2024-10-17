// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LabelExtraction from "./components/Label_Extraction.jsx";
import ExpiryExtraction from "./components/Expiry_Extraction.jsx";
import FreshnessPrediction from "./components/Freshness_Prediction.jsx";
import BrandRecognition from "./components/Brand_Recognition.jsx";
import Home from "./components/Home.jsx";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/label-extraction" element={<LabelExtraction />} />
          <Route path="/expiry-extraction" element={<ExpiryExtraction />} />
          <Route
            path="/freshness-prediction"
            element={<FreshnessPrediction />}
          />
          <Route path="/brand-recognition" element={<BrandRecognition />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
