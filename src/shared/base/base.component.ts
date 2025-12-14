import React from "react";

import type { BaseProps } from "./interfaces/base-props.interface";
import type { BaseRenderResult } from "./interfaces/base-render.interface";
import type { BaseState } from "./interfaces/base-state.interface";


export abstract class BaseComponent<
  P extends BaseProps = BaseProps,
  S extends BaseState = BaseState
> extends React.PureComponent<P, S> {
  private isMountedFlag = false;

  protected abstract renderView(): React.ReactNode;

  protected renderLoading(): React.ReactNode {
    return null;
  }

  protected renderError(_error: unknown): React.ReactNode {
    return null;
  }

  protected getRenderResult(): BaseRenderResult {
    return { showLoading: this.state?.isLoading, showError: !!this.state?.error };
  }

  protected setSafeState<K extends keyof S>(patch: Pick<S, K> | S | ((prev: Readonly<S>) => Pick<S, K> | S)): void {
    if (!this.isMountedFlag) return;
    this.setState(patch as any);
  }

  protected setLoading(isLoading: boolean): void {
    this.setSafeState({ isLoading } as unknown as S);
  }

  protected setError(error?: unknown): void {
    this.setSafeState({ error, isLoading: false } as unknown as S);
  }

  protected clearError(): void {
    this.setSafeState({ error: undefined } as unknown as S);
  }

  protected async runAsync<T>(
    action: () => Promise<T>,
    options?: { setLoading?: boolean; swallowError?: boolean }
  ): Promise<T | undefined> {
    const setLoading = options?.setLoading ?? true;

    try {
      if (setLoading) this.setLoading(true);
      const result = await action();
      if (setLoading) this.setLoading(false);
      return result;
    } catch (err) {
      this.setError(err);
      if (options?.swallowError) return undefined;
      throw err;
    }
  }

  componentDidMount(): void {
    this.isMountedFlag = true;
  }

  componentWillUnmount(): void {
    this.isMountedFlag = false;
  }

  render(): React.ReactNode {
    const rr = this.getRenderResult();

    if (rr.showLoading) return this.renderLoading();
    if (rr.showError && this.state?.error) return this.renderError(this.state.error);

    return this.renderView();
  }
}
