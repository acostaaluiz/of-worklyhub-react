import { render, screen } from "@testing-library/react";
import { BehaviorSubject } from "rxjs";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import RedirectIfAuthenticated from "./redirect-if-authenticated";
import { usersAuthService } from "@modules/users/services/auth.service";
import { usersOverviewService } from "@modules/users/services/overview.service";
import { usersService } from "@modules/users/services/user.service";
import { companyService } from "@modules/company/services/company.service";

jest.mock("@modules/users/services/auth.service", () => ({
  usersAuthService: {
    getSessionValue: jest.fn(),
    getSession$: jest.fn(),
  },
}));

jest.mock("@modules/users/services/overview.service", () => ({
  usersOverviewService: {
    getOverviewValue: jest.fn(),
    fetchOverview: jest.fn(),
  },
}));

jest.mock("@modules/users/services/user.service", () => ({
  usersService: {
    fetchByEmail: jest.fn(),
  },
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
    fetchWorkspaceByEmail: jest.fn(),
  },
}));

type Session = {
  uid: string;
  claims: DataValue;
  email?: string;
} | null;

function renderGuard(initialPath = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<div>login</div>} />
        </Route>
        <Route path="/home" element={<div>home</div>} />
        <Route path="/billing/plans" element={<div>plans</div>} />
        <Route path="/company/introduction" element={<div>company</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RedirectIfAuthenticated", () => {
  const mockedUsersAuthService = usersAuthService as jest.Mocked<typeof usersAuthService>;
  const mockedUsersOverviewService = usersOverviewService as jest.Mocked<typeof usersOverviewService>;
  const mockedUsersService = usersService as jest.Mocked<typeof usersService>;
  const mockedCompanyService = companyService as jest.Mocked<typeof companyService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsersOverviewService.getOverviewValue.mockReturnValue(null);
    mockedUsersService.fetchByEmail.mockResolvedValue(null);
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null);
    mockedCompanyService.fetchWorkspaceByEmail.mockResolvedValue(null);
  });

  function mockSession(session: Session) {
    const subject = new BehaviorSubject(session);
    mockedUsersAuthService.getSessionValue.mockReturnValue(session);
    mockedUsersAuthService.getSession$.mockReturnValue(subject.asObservable());
  }

  it("redirects premium user with persisted session to home even when session email is missing", async () => {
    mockSession({ uid: "uid-1", claims: {} });
    mockedUsersOverviewService.fetchOverview.mockResolvedValue({
      profile: { email: "premium@worklyhub.com", planStatus: "ACTIVE-PLAN" },
      modules: [],
    });
    mockedCompanyService.fetchWorkspaceByEmail.mockResolvedValue({
      id: "workspace-1",
      email: "premium@worklyhub.com",
    } as DataValue);

    renderGuard();

    expect(await screen.findByText("home")).toBeInTheDocument();
    expect(mockedUsersOverviewService.fetchOverview).toHaveBeenCalledWith(true);
    expect(mockedCompanyService.fetchWorkspaceByEmail).toHaveBeenCalledWith(
      "premium@worklyhub.com"
    );
    expect(mockedUsersService.fetchByEmail).not.toHaveBeenCalled();
  });

  it("redirects to billing when the resolved profile has inactive plan", async () => {
    mockSession({ uid: "uid-2", claims: {} });
    mockedUsersOverviewService.fetchOverview.mockResolvedValue({
      profile: { email: "starter@worklyhub.com", planStatus: "INACTIVE-PLAN" },
      modules: [],
    });

    renderGuard();

    expect(await screen.findByText("plans")).toBeInTheDocument();
    expect(mockedCompanyService.fetchWorkspaceByEmail).not.toHaveBeenCalled();
  });
});
