import "@core/auth";
import { AppThemeProvider } from "@app/bootstrap/theme-provider.component";
import { AppRouter } from "@app/router/app.router";
import { ErrorProvider } from "@shared/providers/error/error.provider";
import { MockStoreProvider } from "@core/storage/mock-store.provider";
import { LoadingOverlay } from "@shared/ui/components/loading-overlay/loading-overlay.component";

export default function App() {
  return (
    <AppThemeProvider>
      <MockStoreProvider>
        <ErrorProvider>
          <AppRouter />
          <LoadingOverlay />
        </ErrorProvider>
      </MockStoreProvider>
    </AppThemeProvider>
  );
}
