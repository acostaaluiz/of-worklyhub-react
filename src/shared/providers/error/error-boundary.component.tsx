import React from "react";
import { Button, Typography } from "antd";

import { FallbackActions, FallbackCard, FallbackShell } from "./error-boundary.styles";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Runtime error boundary", { error, info });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <FallbackShell>
        <FallbackCard className="surface">
          <Typography.Title level={2} style={{ marginTop: 0 }}>
            {this.props.title ?? "Something went wrong"}
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            {this.props.description ??
              "A runtime error occurred. You can try again or reload the page."}
          </Typography.Paragraph>

          <FallbackActions>
            <Button type="primary" onClick={this.handleReload}>
              Reload page
            </Button>
            <Button onClick={this.handleReset}>Try again</Button>
          </FallbackActions>
        </FallbackCard>
      </FallbackShell>
    );
  }
}

export default ErrorBoundary;
