import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { AssistantChatApi } from "./assistant-chat-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new AssistantChatApi(http);
  return { api, request };
}

describe("AssistantChatApi", () => {
  it("posts messages to assistant endpoint with payload and headers", async () => {
    const response = {
      assistant: {
        name: "WorklyPilot",
        message: "Use Work Orders landing first.",
      },
    };
    const { api, request } = createApi(response);

    const result = await api.sendMessage(
      {
        message: "How do I open a work order?",
        pagePath: "/work-order/landing",
      },
      { "x-workspace-id": "ws-1" }
    );

    expect(result.assistant.name).toBe("WorklyPilot");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "chat/internal/assistant/messages",
        body: expect.objectContaining({
          message: "How do I open a work order?",
        }),
        headers: { "x-workspace-id": "ws-1" },
      })
    );
  });
});

