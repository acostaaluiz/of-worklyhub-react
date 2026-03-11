import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { CompaniesApi } from "./companies-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new CompaniesApi(http);
  return { api, request };
}

describe("CompaniesApi", () => {
  it("creates and gets workspace", async () => {
    const createApiCtx = createApi({ id: "ws-1", fullName: "Clinic" });
    const getApiCtx = createApi({ workspace: { id: "ws-1", fullName: "Clinic" } });

    await expect(
      createApiCtx.api.createWorkspace({
        creatorUid: "user-1",
        accountType: "company",
        fullName: "Clinic",
        email: "owner@clinic.com",
      })
    ).resolves.toMatchObject({ id: "ws-1" });

    await expect(getApiCtx.api.getWorkspace("owner@clinic.com")).resolves.toEqual({
      workspace: { id: "ws-1", fullName: "Clinic" },
    });

    expect(createApiCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/company/internal/workspaces",
      })
    );
    expect(getApiCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/company/internal/workspace",
        query: { email: "owner@clinic.com" },
      })
    );
  });

  it("handles workspace services and profile update endpoints", async () => {
    const listApiCtx = createApi([{ id: "svc-1" }]);
    const createServiceCtx = createApi({ id: "svc-2" });
    const updateServiceCtx = createApi({ id: "svc-2", name: "Updated" });
    const updateProfileCtx = createApi({ workspace: { id: "ws-1", tradeName: "Clinic Co." } });

    await expect(listApiCtx.api.listWorkspaceServices("ws-1")).resolves.toEqual([{ id: "svc-1" }]);
    await expect(
      createServiceCtx.api.createWorkspaceService("ws-1", { name: "Cleaning" })
    ).resolves.toEqual({ id: "svc-2" });
    await expect(
      updateServiceCtx.api.updateWorkspaceService("ws-1", "svc-2", { name: "Updated" })
    ).resolves.toEqual({ id: "svc-2", name: "Updated" });
    await expect(
      updateProfileCtx.api.updateWorkspaceProfile("ws-1", {
        accountType: "company",
        tradeName: "Clinic Co.",
      })
    ).resolves.toEqual({
      workspace: { id: "ws-1", tradeName: "Clinic Co." },
    });

    expect(listApiCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/company/internal/workspaces/ws-1/services",
      })
    );
    expect(createServiceCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/company/internal/workspaces/ws-1/services",
      })
    );
    expect(updateServiceCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/company/internal/workspaces/ws-1/services/svc-2",
      })
    );
    expect(updateProfileCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/company/internal/workspaces/ws-1/profile",
      })
    );
  });

  it("returns null when wallpaper signature endpoint fails", async () => {
    const request = jest.fn().mockRejectedValue(new Error("signature-failure"));
    const api = new CompaniesApi({ request } as unknown as HttpClient);

    await expect(
      api.requestWallpaperSignature("image/jpeg", "wallpaper.jpg")
    ).resolves.toBeNull();
  });
});

