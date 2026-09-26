import { Buffer } from 'buffer';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import { embeddingFromImage, type RgbaImage } from './face';

const globalWithBuffer = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (typeof globalWithBuffer.Buffer === 'undefined') {
  globalWithBuffer.Buffer = Buffer;
}

async function toJpegBase64(
  uri: string,
  size: number,
  cropCenter: boolean,
): Promise<string> {
  const fitted = await ImageManipulator.manipulate(uri)
    .resize({ width: cropCenter ? 240 : size })
    .renderAsync();

  const side = Math.min(fitted.width, fitted.height);
  const originX = Math.round((fitted.width - side) / 2);
  const originY = cropCenter
    ? Math.max(0, Math.round((fitted.height - side) * 0.28))
    : Math.round((fitted.height - side) / 2);

  const cropped = await ImageManipulator.manipulate(fitted)
    .crop({ originX, originY, width: side, height: side })
    .resize({ width: cropCenter ? 64 : size, height: cropCenter ? 64 : size })
    .renderAsync();

  const saved = await cropped.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  if (!saved.base64) {
    throw new Error('Could not read image pixels');
  }
  return saved.base64;
}

export function decodeJpegBase64(base64: string): RgbaImage {
  const decoded = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data,
  };
}

export async function imageFromUri(
  uri: string,
  options: { size?: number; cropCenter?: boolean } = {},
): Promise<RgbaImage> {
  const base64 = await toJpegBase64(uri, options.size ?? 96, options.cropCenter ?? false);
  return decodeJpegBase64(base64);
}

export async function embeddingFromUri(uri: string): Promise<number[]> {
  const image = await imageFromUri(uri, { size: 160, cropCenter: true });
  return embeddingFromImage(image);
}
