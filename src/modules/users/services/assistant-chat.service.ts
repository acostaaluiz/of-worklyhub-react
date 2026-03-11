import { httpClient } from "@core/http/client.instance";
import { toAppError } from "@core/errors/to-app-error";
import { companyService } from "@modules/company/services/company.service";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from "@modules/users/interfaces/assistant-chat.model";
import { AssistantChatApi } from "@modules/users/services/assistant-chat-api";

function resolveWorkspaceId(explicitWorkspaceId?: string): string | undefined {
  if (explicitWorkspaceId?.trim()) return explicitWorkspaceId.trim();
  const current = companyService.getWorkspaceValue() as
    | { workspaceId?: string; id?: string }
    | null;
  return (current?.workspaceId ?? current?.id ?? undefined) as string | undefined;
}

export class AssistantChatService {
  private readonly api = new AssistantChatApi(httpClient);

  private buildHeaders(workspaceId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (workspaceId) headers["x-workspace-id"] = workspaceId;
    return headers;
  }

  async sendMessage(payload: AssistantChatRequest): Promise<AssistantChatResponse> {
    try {
      const workspaceId = resolveWorkspaceId(payload.workspaceId);
      return await this.api.sendMessage(
        {
          ...payload,
          workspaceId,
        },
        this.buildHeaders(workspaceId)
      );
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export const assistantChatService = new AssistantChatService();

export default assistantChatService;
