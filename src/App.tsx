import "@core/auth";
import { AppThemeProvider } from "@app/bootstrap/theme-provider.component";
import { AppRouter } from "@app/router/app.router";
import { ErrorProvider } from "@shared/providers/error/error.provider";
import { MockStoreProvider } from "@core/storage/mock-store.provider";

export default function App() {
  return (
    <AppThemeProvider>
      <MockStoreProvider>
        <ErrorProvider>
          <AppRouter />
        </ErrorProvider>
      </MockStoreProvider>
    </AppThemeProvider>
  );
}
