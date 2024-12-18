import { CldImage } from "next-cloudinary";

const TransformImage = ({ crop = "scale", image, width, height }) => {
  // Ensure width and height are numbers with default fallback
  const validWidth = parseInt(width) || 200; // Default to 200 if invalid
  const validHeight = parseInt(height) || 200;

  return (
    <div>
      <CldImage
        src={image} // Cloudinary Public ID of the uploaded image
        width={validWidth}
        height={validHeight}
        crop={crop} // Crop type (scale, crop, etc.)
        alt="Transformed Image"
      />
    </div>
  );
};

export default TransformImage;
