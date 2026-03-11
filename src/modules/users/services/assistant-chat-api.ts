import { BaseHttpService } from "@core/http/base-http.service";
import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from "@modules/users/interfaces/assistant-chat.model";

export class AssistantChatApi extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http, { correlationNamespace: "users-assistant-chat-api" });
  }

  async sendMessage(
    payload: AssistantChatRequest,
    headers?: Record<string, string>
  ): Promise<AssistantChatResponse> {
    return this.post<AssistantChatResponse, AssistantChatRequest>(
      "chat/internal/assistant/messages",
      payload,
      headers
    );
  }
}

export default AssistantChatApi;
