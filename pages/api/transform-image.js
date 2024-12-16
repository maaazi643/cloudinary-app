// pages/api/transform-image.js
import { buildImageUrl } from 'next-cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id, width = 500, height = 500, removeBg = false } = req.body;
  
  if (!public_id) {
    return res.status(400).json({ error: 'public_id is required' });
  }

  try {
    // Base transformations
    const transformations = {
      width,
      height,
      crop: 'fill'
    };

    // If background removal is requested:
    if (removeBg) {
      transformations.effect = 'background_removal';
    }

    // next-cloudinary's buildImageUrl makes constructing the URL simpler.
    const url = buildImageUrl(public_id, {
      cloud: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      },
      transformations
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Transformation failed' });
  }
}
