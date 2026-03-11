jest.mock("./assistant-chat-api", () => ({
  AssistantChatApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

import { AssistantChatApi } from "./assistant-chat-api";
import { AssistantChatService } from "./assistant-chat.service";
import { companyService } from "@modules/company/services/company.service";

type AssistantChatApiMock = {
  sendMessage: jest.Mock;
};

function createApiMock(): AssistantChatApiMock {
  return {
    sendMessage: jest.fn().mockResolvedValue({
      assistant: {
        name: "WorklyPilot",
        message: "Go to Work Orders and click New work order.",
      },
    }),
  };
}

describe("AssistantChatService", () => {
  const assistantApiCtor = jest.mocked(AssistantChatApi);
  const mockedCompanyService = jest.mocked(companyService);
  let apiMock: AssistantChatApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    assistantApiCtor.mockImplementation(() => apiMock as unknown as AssistantChatApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "workspace-1" } as never);
  });

  it("sends message with explicit workspace and identity headers", async () => {
    const service = new AssistantChatService();

    const result = await service.sendMessage({
      message: "How to avoid rework in work order?",
      workspaceId: " ws-2 ",
    });

    expect(result.assistant.name).toBe("WorklyPilot");
    expect(apiMock.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "How to avoid rework in work order?",
        workspaceId: "ws-2",
      }),
      expect.objectContaining({
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-workspace-id": "ws-2",
      })
    );
  });

  it("uses current workspace when payload workspace is not provided", async () => {
    const service = new AssistantChatService();

    await service.sendMessage({
      message: "How do I configure People availability?",
    });

    expect(apiMock.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-1",
      }),
      expect.objectContaining({
        "x-workspace-id": "workspace-1",
      })
    );
  });

  it("uses company id fallback when workspaceId is unavailable", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ id: "company-id-only" } as never);
    const service = new AssistantChatService();

    await service.sendMessage({
      message: "How to open Growth Autopilot?",
    });

    expect(apiMock.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "company-id-only",
      }),
      expect.objectContaining({
        "x-workspace-id": "company-id-only",
      })
    );
  });

  it("sends message without workspace header when there is no resolved workspace", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new AssistantChatService();

    await service.sendMessage({
      message: "Show me Users settings flow",
    });

    expect(apiMock.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: undefined,
      }),
      expect.objectContaining({
        Accept: "application/json",
        "Content-Type": "application/json",
      })
    );
    expect(apiMock.sendMessage.mock.calls[0][1]["x-workspace-id"]).toBeUndefined();
  });

  it("throws app error when api fails", async () => {
    apiMock.sendMessage.mockRejectedValueOnce(new Error("assistant-backend-failure"));
    const service = new AssistantChatService();

    await expect(
      service.sendMessage({
        message: "Trigger failure",
      })
    ).rejects.toMatchObject({
      message: "assistant-backend-failure",
      kind: "Unknown",
    });
  });
});
