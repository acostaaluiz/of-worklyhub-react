import { AppThemeProvider } from "@app/bootstrap/theme-provider.component";
import { AppRouter } from "@app/router/app.router";
import { ErrorProvider } from "@shared/providers/error/error.provider";

export default function App() {
  return (
    <AppThemeProvider>
      <ErrorProvider>
        <AppRouter />
      </ErrorProvider>
    </AppThemeProvider>
  );
}
