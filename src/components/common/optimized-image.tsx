type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  avif?: string;
  webp?: string;
  alt: string;
};

export function OptimizedImage({ src, avif, webp, alt, ...props }: Props) {
  if (!avif && !webp) {
    return <img src={src} alt={alt} {...props} />;
  }

  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" />}
      {webp && <source srcSet={webp} type="image/webp" />}
      <img src={src} alt={alt} {...props} />
    </picture>
  );
}
