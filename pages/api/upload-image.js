// pages/api/upload-image.js
import cloudinary from '../../lib/cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData } = req.body; 
  // imageData should be something like "data:image/png;base64,<...>"

  try {
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'figma-uploads'
    });
    // uploadResponse.public_id can be used with next-cloudinary to build URLs.

    return res.status(200).json({ public_id: uploadResponse.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed' });
  }
}
