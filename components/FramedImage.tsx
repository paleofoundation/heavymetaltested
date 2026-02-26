export default function FramedImage({
  src,
  alt,
  className,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={`framed-image${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? ''} {...rest} />
    </div>
  );
}
