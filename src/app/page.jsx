"use client";
import { useState, useRef } from "react";
import AWS from "aws-sdk";
import toast, { Toaster } from "react-hot-toast";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    toast.loading("Starting the camera");
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Error accessing the camera");
      console.error("Error accessing the camera", err);
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  const captureImage = () => {
    setLoading(true);
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, 640, 480);
      const imageData = canvasRef.current.toDataURL("image/jpeg").split(",")[1];
      setCapturedImage(canvasRef.current.toDataURL("image/jpeg")); // For displaying the captured image
      setLoading(false);
      return imageData;
    }
    setLoading(false);
    return null;
  };

  const detectFace = async () => {
    setLoading(true);
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
        console.log("Rekognition Result:", result); // Debugging statement
        if (result.FaceDetails && result.FaceDetails.length > 0) {
          toast.success("Hi there!");
        } else {
          toast.error("No face detected. Please try again.");
        }
      } catch (err) {
        console.error("Error detecting face", err);
        toast.error("Error detecting face. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadImageToS3 = async () => {
    console.log("uploading...")
    toast.loading("uploading..")
    const image = captureImage();
    if (image) {
      setLoading(true);
      try {
        const buffer = Buffer.from(image, "base64");
        const blob = new Blob([buffer);

        
        console.log("Blob size:", blob.size);

        const params = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: `images/${Date.now()}.jpg`,
          Body: blob,
          ContentType: "image/jpeg",
        };

        const uploadResult = await s3.upload(params).promise();
        console.log("Upload Result:", uploadResult);
        toast.success("Image uploaded to S3 successfully!");
      } catch (err) {
        toast.error("Error uploading image to S3", err);
        if (err instanceof Error) {
          toast.error(`Error2 uploading image to S3: ${err.message}`);
        } else {
          toast.error("Error3 uploading image to S3. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Face Detection</h1>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            className="border-4 border-gray-400"
            style={{ width: "640px", height: "480px" }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-neutral-600 pointer-events-none" />
        </div>
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width="640"
          height="480"
        />
        {capturedImage && (
          <div className="mt-4">
            <img src={capturedImage} alt="Captured" className="border-4 border-gray-400" />
          </div>
        )}
        <div className="flex justify-between gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-4">
          <button onClick={startCamera} disabled={loading}>
            Start Camera
          </button>
          <button onClick={detectFace} disabled={loading}>
            Detect Face
          </button>
          <button onClick={uploadImageToS3} disabled={loading}>
            Upload to S3
          </button>
        </div>
      </main>
    </div>
  );
}
