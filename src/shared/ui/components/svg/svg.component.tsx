import type { ImgHTMLAttributes, ReactElement } from "react";

type SvgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  size?: number | string;
};

export function Svg({
  src,
  size,
  width,
  height,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...rest
}: SvgProps): ReactElement {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;
  const ariaHidden = alt === "" ? true : undefined;

  return (
    <img
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={loading}
      decoding={decoding}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
}

export default Svg;
