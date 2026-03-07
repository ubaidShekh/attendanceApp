const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const modelPath = "./models";

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    modelsLoaded = true;
    console.log("✅ Face models loaded");
  } catch (error) {
    console.error("❌ Model load failed:", error);
    throw error;
  }
}

function base64ToImage(base64String) {
  return new Promise((resolve, reject) => {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const img = new canvas.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = buffer;
  });
}

async function getFaceDescriptor(base64Image) {
  const img = await base64ToImage(base64Image);
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) throw new Error("No face detected");
  return detection.descriptor;
}

function compareDescriptors(desc1, desc2, threshold = 0.6) {
  const distance = faceapi.euclideanDistance(desc1, desc2);
  return {
    match: distance < threshold,
    distance,
    confidence: ((1 - Math.min(distance, 1)) * 100).toFixed(2) + "%",
  };
}

module.exports = { loadModels, getFaceDescriptor, compareDescriptors };
