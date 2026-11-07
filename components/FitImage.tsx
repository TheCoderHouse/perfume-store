import Image from "next/image";

/**
 * Always fills its frame (no letterboxing or blurred filler). Frames are chosen
 * to be close to the photo's own shape, so the crop stays gentle.
 * `ratio` / `tolerance` are accepted for call-site compatibility only.
 */
export default function FitImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  position = "50% 50%",
}: {
  src: string;
  alt: string;
  ratio?: number;
  sizes: string;
  priority?: boolean;
  tolerance?: number;
  className?: string;
  position?: string;
}) {
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`object-cover ${className}`} style={{ objectPosition: position }} />;
}
