import styled from "styled-components";

export const IconBox = styled.span<{ $size: "sm" | "md" | "lg" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;

  svg {
    width: ${({ $size }) =>
      $size === "sm"
        ? "var(--icon-size-sm)"
        : $size === "lg"
          ? "var(--icon-size-lg)"
          : "var(--icon-size-md)"};
    height: ${({ $size }) =>
      $size === "sm"
        ? "var(--icon-size-sm)"
        : $size === "lg"
          ? "var(--icon-size-lg)"
          : "var(--icon-size-md)"};
  }
`;
