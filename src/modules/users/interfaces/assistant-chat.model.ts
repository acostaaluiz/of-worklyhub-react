export type AssistantChatRole = "user" | "assistant";

export type AssistantChatMessage = {
  role: AssistantChatRole;
  content: string;
};

export type AssistantChatSuggestion = {
  label: string;
  path: string;
  description?: string;
};

export type AssistantChatRequest = {
  message: string;
  history?: AssistantChatMessage[];
  pagePath?: string;
  pageTitle?: string;
  workspaceId?: string;
};

export type AssistantChatResponse = {
  assistant: {
    name: string;
    message: string;
    suggestions?: AssistantChatSuggestion[];
  };
  meta?: {
    provider?: string;
    model?: string;
    timestamp?: string;
    ai_error?: string;
    token?: {
      required?: number;
      consumed?: boolean;
      remaining?: number | null;
    };
  };
};
