"use client";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";
import {
  FaUpload,
  FaCrop,
  FaArrowRotateRight,
  MdRedo,
  MdUndo,
  FaUndo,
  FaRedo,
  FaDownload,
  FaPalette,
  FaArrowRotateLeft,
} from "react-icons/fa6";

import {
  Upload,
  Crop,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  Download,
  PaintBucket,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

export default function Home() {
  const [imagePublicId, setImagePublicId] = useState(""); // Public ID of the uploaded image
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // Background color
  const [cropParams, setCropParams] = useState({ width: 500, height: 300 }); // Canvas size
  const [rotation, setRotation] = useState(0); // Rotation angle
  const [flip, setFlip] = useState({ horizontal: false, vertical: false }); // Flip states
  const [brightness, setBrightness] = useState(100); // Brightness percentage
  const [contrast, setContrast] = useState(100); // Contrast percentage
  const [filter, setFilter] = useState("none"); // Image filter
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]); // For undo/redo
  const [historyStep, setHistoryStep] = useState(-1);

  // Load Cloudinary Upload Widget
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.onload = () => setCloudinaryReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  }, [filter, brightness, contrast, rotation, flip]);

  // Open Cloudinary Upload Widget
  const openWidget = () => {
    if (!cloudinaryReady || !window.cloudinary) return;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dh1jh6vwm",
        uploadPreset: "bg-image",
        cropping: true,
        croppingAspectRatio: 16 / 9,
      },
      (error, result) => {
        if (result.event === "success") {
          console.log("Uploaded Image:", result.info);
          setImagePublicId(result.info.secure_url);
          drawImageWithBackground(result.info.secure_url);
          // Reset transformations
          setRotation(0);
          setFlip({ horizontal: false, vertical: false });
          setBrightness(100);
          setContrast(100);
          setFilter("none");
          // Reset history
          setHistory([]);
          setHistoryStep(-1);
        }
      }
    );
    widget.open();
  };

  // Draw Image on Canvas with Background and Transformations
  const drawImageWithBackground = (imageUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the background color
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save the context state
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${filter}`;

      // Draw the image centered
      const imgWidth = image.width;
      const imgHeight = image.height;
      const scale = Math.min(
        canvas.width / imgWidth,
        canvas.height / imgHeight
      );
      ctx.drawImage(
        image,
        (-imgWidth * scale) / 2,
        (-imgHeight * scale) / 2,
        imgWidth * scale,
        imgHeight * scale
      );

      // Restore the context to its original state
      ctx.restore();

      // Save the current state to history
      const currentState = canvas.toDataURL();
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(currentState);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    };
    image.src = imageUrl;
  };

  // Apply the background color and re-draw the image
  const applyBackgroundColor = () => {
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Rotation
  const handleRotate = (angle) => {
    setRotation((prev) => (prev + angle) % 360);
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Flip
  const handleFlip = (direction) => {
    setFlip((prev) => ({
      ...prev,
      [direction]: !prev[direction],
    }));
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Brightness
  const handleBrightness = (value) => {
    setBrightness(value);
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Contrast
  const handleContrast = (value) => {
    setContrast(value);
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Filter
  const handleFilter = (e) => {
    setFilter(e.target.value);
    if (imagePublicId) {
      drawImageWithBackground(imagePublicId);
    }
  };

  // Handle Undo
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const previousState = history[historyStep - 1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      };
      image.src = previousState;
    }
  };

  // Handle Redo
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      const nextState = history[historyStep + 1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      };
      image.src = nextState;
    }
  };

  // Handle Export Image
  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Styles
  const btnStyle = "flex flex-col items-center text-[1rem]";
  const iconStyle = "mb-2 bg-[#EFEEF0B2] rounded-full p-3 w-12 h-12";
  return (
    <>
      <Head>
        <title>Enhanced Cloudinary Image Editor</title>
        <meta charSet="utf-8" />
      </Head>

      <div className=" flex flex-col items-center justify-center mt-10 max-w-[600px] mx-auto shadow rounded-lg">
        {/* Canvas */}
        <div className="pt-10">
          <canvas
            ref={canvasRef}
            width={cropParams.width}
            height={cropParams.height}
            className="bg-[#D9D9D9] block m-auto"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-[10px] mt-10">
          <button onClick={openWidget} className={btnStyle}>
            <FaUpload className={iconStyle} /> Upload & Crop Image
          </button>
          <button onClick={exportImage} className={btnStyle}>
            <FaDownload className={iconStyle} /> Export Image
          </button>
        </div>

        {/* Transformation Controls */}
        <div>
          {/* Rotate Controls */}
          <div className="flex items-center justify-center gap-[10px] mt-10">
            <button onClick={() => handleRotate(90)} className={btnStyle}>
              <RotateCw className={iconStyle} />
              Rotate 90°
            </button>
            <button onClick={() => handleRotate(-90)} className={btnStyle}>
              <RotateCcw className={iconStyle} />
              Rotate -90°
            </button>
          </div>

          {/* Flip Controls */}
          <div className="flex items-center justify-center gap-[10px] mt-10">
            <button
              onClick={() => handleFlip("horizontal")}
              className={btnStyle}
            >
              <Crop className={iconStyle} /> Flip Horizontal
            </button>
            <button onClick={() => handleFlip("vertical")} className={btnStyle}>
              <Crop
                size={18}
                style={{ marginRight: "5px", transform: "rotate(90deg)" }}
                className={iconStyle}
              />
              Flip Vertical
            </button>
          </div>

          {/* Brightness Control */}
          <div className="flex items-center justify-center gap-[10px] mt-10">
            <div className="flex flex-col items-center">
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => handleBrightness(e.target.value)}
              />
              <span>Brightness --- {brightness}%</span>
            </div>

            {/* Contrast Control */}
            <div className="flex flex-col items-center">
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => handleContrast(e.target.value)}
              />
              <span>Contrast -- {contrast}%</span>
            </div>
          </div>

          {/* Filter Control */}
          <div className="w-full mt-10">
            <select
              value={filter}
              onChange={handleFilter}
              className="w-full bg-[#D9D9D9] p-3"
            >
              <option value="none">None</option>
              <option value="grayscale(100%)">Grayscale</option>
              <option value="sepia(100%)">Sepia</option>
              <option value="blur(5px)">Blur</option>
              <option value="invert(100%)">Invert</option>
            </select>
          </div>

          {/* Undo/Redo Controls */}
          <div className="flex items-center justify-center gap-[10px] mt-10">
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className={btnStyle}
            >
              {/* <MdUndo className={iconStyle} /> Undo */}
              <Undo className={iconStyle} /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className={btnStyle}
            >
              {/* <MdRedo className={iconStyle} /> Redo */}
              <Redo className={iconStyle} /> Redo
            </button>
          </div>
        </div>

        {/* Color Picker */}
        {/* <div style={{ marginBottom: "20px" }}>
          <p>Select Background Color:</p>
          <SketchPicker
            color={selectedColor}
            onChangeComplete={(color) => setSelectedColor(color.hex)}
          />
          <button
            onClick={applyBackgroundColor}
            className="bg-[#000000CC] text-white mt-10"
          >
            Apply Background Color
          </button>
        </div> */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Background Color</h3>
          <HexColorPicker
            color={selectedColor}
            onChange={(color) => setSelectedColor(color)}
            style={{ width: "150px", height: "150px", margin: "auto" }}
          />
          <p style={{ marginTop: "10px" }}>
            Selected Color: <strong>{selectedColor.toUpperCase()}</strong>
          </p>
          <button
            onClick={applyBackgroundColor}
            className="bg-[#000000CC] text-white mt-10"
          >
            Apply Background Color
          </button>
        </div>
        {/* <PaintBucket className={iconStyle} /> */}

        {/* Crop Dimensions */}
        <div className="text-center">
          <h3 className="text-[2.6rem] text-[#000000] font-semibold">
            Canvas Dimensions
          </h3>
          <div className="flex items-center justify-center">
            <p>Width</p>
            <input
              type="number"
              placeholder="Width"
              value={cropParams.width}
              onChange={(e) =>
                setCropParams({
                  ...cropParams,
                  width: parseInt(e.target.value) || 500,
                })
              }
            />
          </div>
          <div className="flex items-center justify-center">
            <span>Height</span>
            <input
              type="number"
              placeholder="Height"
              value={cropParams.height}
              onChange={(e) =>
                setCropParams({
                  ...cropParams,
                  height: parseInt(e.target.value) || 300,
                })
              }
            />
          </div>
          <button
            onClick={() => {
              if (imagePublicId) drawImageWithBackground(imagePublicId);
            }}
            className="bg-[#000000CC] text-white mt-10"
          >
            Update Canvas
          </button>
        </div>
      </div>
    </>
  );
}
