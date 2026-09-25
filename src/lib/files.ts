import { Directory, File, Paths } from 'expo-file-system';

function ensureDir(name: string): Directory {
  const dir = new Directory(Paths.document, name);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

export async function persistPhoto(
  sourceUri: string,
  folder: 'faces' | 'attendance',
  id: string,
): Promise<string> {
  const dir = ensureDir(folder);
  const dest = new File(dir, `${id}.jpg`);
  if (dest.exists) {
    dest.delete();
  }
  const source = new File(sourceUri);
  await source.copy(dest);
  return dest.uri;
}
