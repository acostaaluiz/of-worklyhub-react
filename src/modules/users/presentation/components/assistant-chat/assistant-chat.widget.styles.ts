import styled, { css, keyframes } from "styled-components";

const pulse = keyframes`
  0% { transform: scale(1); opacity: .55; }
  100% { transform: scale(1.25); opacity: 0; }
`;

export const AssistantRoot = styled.div`
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1350;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;

  @media (max-width: 768px) {
    right: 12px;
    bottom: 12px;
  }
`;

export const AssistantPanel = styled.section<{ $open: boolean }>`
  width: min(420px, calc(100vw - 24px));
  height: min(68vh, 640px);
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  box-shadow: 0 18px 48px rgba(6, 22, 33, 0.34);
  overflow: hidden;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-surface-2) 80%, transparent),
    color-mix(in srgb, var(--color-surface) 92%, transparent)
  );
  backdrop-filter: blur(8px);
  transform-origin: right bottom;
  transition:
    opacity var(--motion-duration-fast) var(--motion-ease-standard),
    transform var(--motion-duration-fast) var(--motion-ease-standard);

  ${({ $open }) =>
    $open
      ? css`
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        `
      : css`
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          pointer-events: none;
        `}

  @media (max-width: 768px) {
    width: calc(100vw - 24px);
    height: min(72vh, 620px);
  }
`;

export const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-divider);
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--color-primary) 18%, var(--color-surface)),
    color-mix(in srgb, var(--color-secondary) 18%, var(--color-surface))
  );
`;

export const AssistantTitleWrap = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const AssistantTitleIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  background: var(--color-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
`;

export const AssistantTitleText = styled.div`
  min-width: 0;

  .title {
    margin: 0;
    font-weight: 700;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    margin-top: 1px;
    color: var(--color-text-muted);
    font-size: 12px;
  }
`;

export const AssistantMessages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
`;

export const MessageRow = styled.div<{ $role: "user" | "assistant" }>`
  display: flex;
  justify-content: ${({ $role }) => ($role === "user" ? "flex-end" : "flex-start")};
`;

export const MessageBubble = styled.div<{
  $role: "user" | "assistant";
  $error?: boolean;
}>`
  max-width: 88%;
  border-radius: 14px;
  border: 1px solid
    ${({ $role, $error }) =>
      $error
        ? "color-mix(in srgb, var(--color-danger) 55%, var(--color-border))"
        : $role === "user"
        ? "color-mix(in srgb, var(--color-primary) 35%, var(--color-border))"
        : "var(--color-border)"};
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  background: ${({ $role, $error }) =>
    $error
      ? "color-mix(in srgb, var(--color-danger) 12%, var(--color-surface))"
      : $role === "user"
      ? "linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 26%, var(--color-surface)), var(--color-surface))"
      : "var(--color-surface)"};
`;

export const SuggestionsRow = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .ant-btn {
    white-space: normal;
    height: auto;
    text-align: left;
    justify-content: flex-start;
  }
`;

export const QuickPrompts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .ant-btn {
    width: 100%;
    white-space: normal;
    height: auto;
    text-align: left;
    justify-content: flex-start;
    line-height: 1.35;
  }
`;

export const AssistantComposer = styled.div`
  flex-shrink: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  overflow-x: hidden;

  .ant-input-textarea {
    width: 100%;
  }

  .ant-input {
    resize: none;
  }
`;

export const AssistantFab = styled.button<{ $open: boolean }>`
  pointer-events: auto;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--color-primary) 78%, var(--color-surface)),
    color-mix(in srgb, var(--color-secondary) 76%, var(--color-surface))
  );
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(6, 22, 33, 0.34);
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    opacity var(--motion-duration-fast) var(--motion-ease-standard);
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(6, 22, 33, 0.4);
  }

  &::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 999px;
    border: 2px solid color-mix(in srgb, var(--color-primary) 42%, transparent);
    animation: ${pulse} 2.4s infinite;
    ${({ $open }) =>
      $open
        ? css`
            display: none;
          `
        : ""}
  }
`;
