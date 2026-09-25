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
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: size, height: size });
  if (cropCenter) {
    const inset = Math.round(size * 0.18);
    context.crop({
      originX: inset,
      originY: Math.round(inset * 0.7),
      width: size - inset * 2,
      height: size - inset * 2,
    });
    context.resize({ width: 64, height: 64 });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
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
