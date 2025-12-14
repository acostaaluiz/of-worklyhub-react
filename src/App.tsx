import { AppThemeProvider } from "@app/bootstrap/theme-provider.component";
import { AppRouter } from "@app/router/app.router";


export default function App() {
  return (
    <AppThemeProvider>
      <AppRouter />
    </AppThemeProvider>
  );
}
