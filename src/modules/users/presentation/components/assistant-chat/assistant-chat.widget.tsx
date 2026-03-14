import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Spin, Tag, Tooltip, Typography, message } from "antd";
import {
  MessageCircle,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import type {
  AssistantChatMessage,
  AssistantChatSuggestion,
} from "@modules/users/interfaces/assistant-chat.model";
import { assistantChatService } from "@modules/users/services/assistant-chat.service";
import { usersAuthService } from "@modules/users/services/auth.service";
import { toSafeAppPath } from "@core/navigation/safe-navigation";

import {
  AssistantComposer,
  AssistantFab,
  AssistantHeader,
  AssistantMessages,
  AssistantPanel,
  AssistantRoot,
  AssistantTitleIcon,
  AssistantTitleText,
  AssistantTitleWrap,
  MessageBubble,
  MessageRow,
  QuickPrompts,
  SuggestionsRow,
} from "./assistant-chat.widget.styles";

type ChatItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: AssistantChatSuggestion[];
  isError?: boolean;
};

const ASSISTANT_FALLBACK_NAME = "WorklyPilot";

const STARTER_PROMPTS = [
  "Como abrir uma OS do jeito correto e evitar retrabalho?",
  "Como reduzir conflitos de agenda usando People + Schedule?",
  "Como sair de execucao para faturamento mais rapido no WorklyHub?",
];

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toHistory(messages: ChatItem[]): AssistantChatMessage[] {
  return messages
    .filter((item) => item.role === "assistant" || item.role === "user")
    .map((item) => ({ role: item.role, content: item.content }))
    .slice(-10);
}

export function AssistantChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [assistantName, setAssistantName] = useState(ASSISTANT_FALLBACK_NAME);
  const [draft, setDraft] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(usersAuthService.getSessionValue()?.uid)
  );
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: nextId("assistant"),
      role: "assistant",
      content:
        "Oi! Eu sou o WorklyPilot. Posso te orientar em fluxos do WorklyHub para ganhar produtividade e resultado.",
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const handleSuggestionNavigate = (rawPath: string) => {
    const safePath = toSafeAppPath(rawPath);
    if (!safePath) {
      message.warning("Suggestion path is unavailable.");
      return;
    }
    navigate(safePath);
  };

  const hasStarterPrompts = useMemo(
    () =>
      messages.length <= 1 &&
      messages[0]?.role === "assistant" &&
      !isSending &&
      !draft.trim(),
    [messages, isSending, draft]
  );

  useEffect(() => {
    const sub = usersAuthService
      .getSession$()
      .subscribe((session) => setIsAuthenticated(Boolean(session?.uid)));
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isOpen, isSending]);

  const appendMessage = (item: ChatItem) => {
    setMessages((prev) => [...prev, item]);
  };

  const submit = async (rawText?: string) => {
    const text = (rawText ?? draft).trim();
    if (!text || isSending) return;

    const userMessage: ChatItem = {
      id: nextId("user"),
      role: "user",
      content: text,
    };

    setDraft("");
    appendMessage(userMessage);
    setIsSending(true);

    try {
      const history = toHistory([...messages, userMessage]);
      const response = await assistantChatService.sendMessage({
        message: text,
        history,
        pagePath: location.pathname,
        pageTitle: typeof document !== "undefined" ? document.title : undefined,
      });

      if (response.assistant?.name?.trim()) {
        setAssistantName(response.assistant.name.trim());
      }

      appendMessage({
        id: nextId("assistant"),
        role: "assistant",
        content:
          response.assistant?.message?.trim() ||
          "Nao consegui responder agora. Tente reformular sua duvida.",
        suggestions: response.assistant?.suggestions ?? [],
      });
    } catch (error) {
      const fallback =
        error instanceof Error && error.message
          ? error.message
          : "Falha ao consultar o assistente. Tente novamente em alguns segundos.";
      appendMessage({
        id: nextId("assistant"),
        role: "assistant",
        content: fallback,
        isError: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AssistantRoot data-cy="assistant-chat-widget">
      <AssistantPanel
        $open={isOpen}
        aria-hidden={!isOpen}
        data-cy="assistant-chat-panel"
      >
        <AssistantHeader>
          <AssistantTitleWrap>
            <AssistantTitleIcon aria-hidden>
              <MessageCircle size={18} />
            </AssistantTitleIcon>
            <AssistantTitleText>
              <p className="title">{assistantName}</p>
              <p className="subtitle">Assistente virtual do WorklyHub</p>
            </AssistantTitleText>
          </AssistantTitleWrap>
          <Button
            size="small"
            type="text"
            aria-label="Fechar assistente"
            onClick={() => setIsOpen(false)}
            data-cy="assistant-chat-close-button"
          >
            <X size={16} />
          </Button>
        </AssistantHeader>

        <AssistantMessages ref={scrollRef} data-cy="assistant-chat-messages">
          {messages.map((item) => (
            <MessageRow
              key={item.id}
              $role={item.role}
              data-cy="assistant-chat-message-row"
              data-role={item.role}
            >
              <MessageBubble $role={item.role} $error={item.isError}>
                {item.content}

                {item.role === "assistant" && item.suggestions?.length ? (
                  <SuggestionsRow>
                    {item.suggestions.map((suggestion) => (
                      <Tooltip
                        key={`${item.id}-${suggestion.path}-${suggestion.label}`}
                        title={suggestion.description}
                      >
                        <Button
                          size="small"
                          onClick={() => handleSuggestionNavigate(suggestion.path)}
                          data-cy="assistant-chat-suggestion-button"
                          data-suggestion-path={suggestion.path}
                        >
                          {suggestion.label}
                        </Button>
                      </Tooltip>
                    ))}
                  </SuggestionsRow>
                ) : null}
              </MessageBubble>
            </MessageRow>
          ))}

          {isSending ? (
            <MessageRow $role="assistant">
              <MessageBubble $role="assistant">
                <Spin size="small" /> <span style={{ marginLeft: 8 }}>Analisando...</span>
              </MessageBubble>
            </MessageRow>
          ) : null}

          {hasStarterPrompts ? (
            <QuickPrompts>
              {STARTER_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  size="small"
                  type="default"
                  onClick={() => {
                    void submit(prompt);
                  }}
                >
                  <Sparkles size={13} />
                  {prompt}
                </Button>
              ))}
            </QuickPrompts>
          ) : null}
        </AssistantMessages>

        <AssistantComposer>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Duvida sobre fluxo, pagina ou melhoria de resultado? Pergunte aqui.
          </Typography.Text>
          <Input.TextArea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="Ex: Como fechar uma OS e garantir que gere faturamento?"
            data-cy="assistant-chat-input"
            onPressEnter={(event) => {
              if (event.shiftKey) return;
              event.preventDefault();
              void submit();
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Tag color="blue">Virtual only</Tag>
            <Button
              type="primary"
              icon={<SendHorizontal size={14} />}
              onClick={() => {
                void submit();
              }}
              loading={isSending}
              data-cy="assistant-chat-send-button"
            >
              Enviar
            </Button>
          </div>
        </AssistantComposer>
      </AssistantPanel>

      <Tooltip title={isOpen ? "Fechar assistente" : "Abrir assistente do WorklyHub"}>
        <AssistantFab
          $open={isOpen}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Assistente virtual WorklyHub"
          data-cy="assistant-chat-fab"
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={22} />}
        </AssistantFab>
      </Tooltip>
    </AssistantRoot>
  );
}

export default AssistantChatWidget;
