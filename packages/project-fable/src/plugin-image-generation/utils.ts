import fs from 'node:fs';
import path from 'node:path';

/**
 * Saves a base64-encoded image to disk
 * @param base64Data The base64-encoded image data
 * @param filename The filename to use (without extension)
 * @returns The path to the saved file
 */
export function saveBase64Image(base64Data: string, filename: string): string {
  // Create generatedImages directory if it doesn't exist
  const imageDir = path.join(process.cwd(), 'generatedImages');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Remove the data:image/png;base64 prefix if it exists
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // Create a buffer from the base64 string
  const imageBuffer = Buffer.from(base64Image, 'base64');

  // Create full file path
  const filepath = path.join(imageDir, `${filename}.png`);

  // Save the file
  fs.writeFileSync(filepath, imageBuffer);

  return filepath;
}

/**
 * Saves an image from a URL to disk
 * @param imageUrl The URL of the image
 * @param filename The filename to use (without extension)
 * @returns The path to the saved file
 */
export async function saveImageFromUrl(imageUrl: string, filename: string): Promise<string> {
  const imageDir = path.join(process.cwd(), 'generatedImages');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Fetch image from URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  // Create full file path
  const filepath = path.join(imageDir, `${filename}.png`);

  // Save the file
  fs.writeFileSync(filepath, imageBuffer);

  return filepath;
}

/**
 * Creates a placeholder image file for testing
 * @param filename The filename to use (without extension)
 * @returns The path to the created file
 */
export function createPlaceholderImage(filename: string): string {
  const imageDir = path.join(process.cwd(), 'generatedImages');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Create full file path
  const filepath = path.join(imageDir, `${filename}.png`);

  // Create a placeholder file
  fs.writeFileSync(filepath, 'Placeholder image file');

  return filepath;
}
