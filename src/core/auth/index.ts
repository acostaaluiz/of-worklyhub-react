import { firebaseAuthService } from "./firebase/firebase-auth.service";
import { authManager } from "./auth-manager";
import { AuthApi } from "./auth-api";
import { httpClient } from "@core/http/client.instance";

// restore token from storage and wire refresh handler
firebaseAuthService.restoreFromStorage();
const t = firebaseAuthService.getAccessToken();
authManager.setTokens(t ?? null, null);
authManager.setRefreshHandler(firebaseAuthService.getRefreshHandler());

// export an api helper
export const authApi = new AuthApi(httpClient);
export { firebaseAuthService };
