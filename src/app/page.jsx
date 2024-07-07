"use client";

import { useState, useRef } from "react";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

const rekognition = new AWS.Rekognition();

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, 640, 480);
      return canvasRef.current.toDataURL("image/jpeg").split(",")[1];
    }
    return null;
  };

  const detectFace = async () => {
    const image = captureImage();
    if (image) {
      try {
        const params = {
          Image: {
            Bytes: Buffer.from(image, "base64"),
          },
          Attributes: ["ALL"],
        };
        const result = await rekognition.detectFaces(params).promise();
        if (result.FaceDetails && result.FaceDetails.length > 0) {
          setMessage("Hi there!");
        } else {
          setMessage("No face detected. Please try again.");
        }
      } catch (err) {
        console.error("Error detecting face", err);
        setMessage("Error detecting face. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Face Detection</h1>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            className="border-4 border-gray-400"
            style={{ width: "640px", height: "480px" }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-red-500 pointer-events-none" />
        </div>
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width="640"
          height="480"
        />
        <button
          onClick={startCamera}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Camera
        </button>
        <button
          onClick={detectFace}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Detect Face
        </button>
        {message && <p className="mt-4 text-xl">{message}</p>}
      </main>
    </div>
  );
}
