import type { FaceFrameFeatures } from '../types';

export type RgbaImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export const MATCH_THRESHOLD = 0.86;
export const MIN_SKIN_RATIO = 0.16;
export const MIN_VARIANCE = 70;
export const MIN_SHARPNESS = 3.5;

function pixelAt(image: RgbaImage, x: number, y: number) {
  const i = (y * image.width + x) * 4;
  return {
    r: image.data[i],
    g: image.data[i + 1],
    b: image.data[i + 2],
  };
}

export function isSkinPixel(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    y > 40 &&
    y < 240 &&
    cb >= 77 &&
    cb <= 135 &&
    cr >= 130 &&
    cr <= 180 &&
    r > 70 &&
    r >= g &&
    r >= b
  );
}

function inOval(x: number, y: number, width: number, height: number): boolean {
  const nx = (x - width / 2) / (width * 0.32);
  const ny = (y - height / 2) / (height * 0.42);
  return nx * nx + ny * ny <= 1;
}

export function analyzeFrame(image: RgbaImage): FaceFrameFeatures {
  let skin = 0;
  let oval = 0;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  let cx = 0;
  let cy = 0;
  let eyeSum = 0;
  let eyeCount = 0;
  let sharp = 0;
  let sharpCount = 0;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (!inOval(x, y, image.width, image.height)) {
        continue;
      }
      oval += 1;
      const { r, g, b } = pixelAt(image, x, y);
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += luma;
      sumSq += luma * luma;
      count += 1;
      if (isSkinPixel(r, g, b)) {
        skin += 1;
        cx += x;
        cy += y;
      }
      if (y < image.height * 0.42) {
        eyeSum += luma;
        eyeCount += 1;
      }
      if (x + 1 < image.width) {
        const next = pixelAt(image, x + 1, y);
        const nextLuma = 0.299 * next.r + 0.587 * next.g + 0.114 * next.b;
        sharp += Math.abs(luma - nextLuma);
        sharpCount += 1;
      }
    }
  }

  const mean = count ? sum / count : 0;
  const variance = count ? sumSq / count - mean * mean : 0;
  const skinCount = Math.max(skin, 1);

  return {
    skinRatio: oval ? skin / oval : 0,
    variance,
    centroidX: skin ? cx / skinCount / image.width : 0.5,
    centroidY: skin ? cy / skinCount / image.height : 0.5,
    eyeBrightness: eyeCount ? eyeSum / eyeCount : mean,
    sharpness: sharpCount ? sharp / sharpCount : 0,
  };
}

export function hasUsableFace(features: FaceFrameFeatures): boolean {
  return (
    features.skinRatio >= MIN_SKIN_RATIO &&
    features.variance >= MIN_VARIANCE &&
    features.sharpness >= MIN_SHARPNESS
  );
}

export function embeddingFromImage(image: RgbaImage): number[] {
  const size = 32;
  const gray: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = Math.min(image.width - 1, Math.floor((x / size) * image.width));
      const sy = Math.min(image.height - 1, Math.floor((y / size) * image.height));
      const { r, g, b } = pixelAt(image, sx, sy);
      gray.push(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  const mean = gray.reduce((total, value) => total + value, 0) / gray.length;
  const centered = gray.map((value) => value - mean);
  const bins = new Array<number>(8).fill(0);
  for (const value of gray) {
    bins[Math.min(7, Math.floor(value / 32))] += 1;
  }

  const vector = [...centered, ...bins];
  return l2Normalize(vector);
}

export function l2Normalize(values: number[]): number[] {
  const norm = Math.sqrt(values.reduce((total, value) => total + value * value, 0));
  if (norm === 0) {
    return values.map(() => 0);
  }
  return values.map((value) => value / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
  }
  return dot;
}

export function facesMatch(
  enrolled: number[],
  captured: number[],
  threshold = MATCH_THRESHOLD,
): boolean {
  return cosineSimilarity(enrolled, captured) >= threshold;
}

export function createSolidImage(
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = color.r;
    data[i * 4 + 1] = color.g;
    data[i * 4 + 2] = color.b;
    data[i * 4 + 3] = 255;
  }
  return { width, height, data };
}

export function paintOvalFace(
  image: RgbaImage,
  options: {
    shiftX?: number;
    closedEyes?: boolean;
    tone?: { r: number; g: number; b: number };
  } = {},
): RgbaImage {
  const clone: RgbaImage = {
    width: image.width,
    height: image.height,
    data: new Uint8Array(image.data),
  };
  const tone = options.tone ?? { r: 210, g: 160, b: 130 };
  const shiftX = options.shiftX ?? 0;
  const cx = clone.width / 2 + shiftX * clone.width;
  const cy = clone.height / 2;

  for (let y = 0; y < clone.height; y += 1) {
    for (let x = 0; x < clone.width; x += 1) {
      const nx = (x - cx) / (clone.width * 0.28);
      const ny = (y - cy) / (clone.height * 0.36);
      if (nx * nx + ny * ny > 1) {
        continue;
      }
      const i = (y * clone.width + x) * 4;
      const shade = 28 * Math.sin(x / 2.2) * Math.cos(y / 3.1) + ((x + y) % 5) * 3;
      clone.data[i] = clamp(tone.r + shade);
      clone.data[i + 1] = clamp(tone.g + shade * 0.6);
      clone.data[i + 2] = clamp(tone.b + shade * 0.4);
      clone.data[i + 3] = 255;

      const eyeBand = y > cy - clone.height * 0.16 && y < cy - clone.height * 0.02;
      const leftEye = Math.abs(x - (cx - clone.width * 0.1)) < clone.width * 0.07;
      const rightEye = Math.abs(x - (cx + clone.width * 0.1)) < clone.width * 0.07;
      if (eyeBand && (leftEye || rightEye)) {
        const eye = options.closedEyes ? 28 : 220;
        clone.data[i] = eye;
        clone.data[i + 1] = eye;
        clone.data[i + 2] = eye;
      }
    }
  }
  return clone;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}
