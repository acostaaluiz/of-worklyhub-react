import React from "react";
import { BaseComponent } from "./base.component";
import type { BasePageOptions } from "./interfaces/base-page.interface";
import type { BasePageState } from "./interfaces/base-page.state.interface";
import type { BaseProps } from "./interfaces/base-props.interface";

export abstract class BasePage<P extends BaseProps = BaseProps, S extends BasePageState = BasePageState> extends BaseComponent<P, S> {
  protected options: BasePageOptions = { requiresAuth: false };

  // default base state; subclasses can extend S with extra properties
  public state: S = ({
    isLoading: false,
    initialized: false,
    error: undefined,
  } as unknown) as S;

  protected abstract renderPage(): React.ReactNode;

  protected async onInit(): Promise<void> {
    return;
  }

  protected async onRefresh(): Promise<void> {
    return;
  }

  protected onTitleChanged(_title?: string): void {
    return;
  }

  protected renderView(): React.ReactNode {
    return this.renderPage();
  }

  protected async initialize(): Promise<void> {
    await this.runAsync(async () => {
      await this.onInit();
      this.setSafeState({ initialized: true });
      this.onTitleChanged(this.options.title);
      if (this.options.title) document.title = this.options.title;
    });
  }

  protected async refresh(): Promise<void> {
    await this.runAsync(async () => {
      await this.onRefresh();
    });
  }

  override componentDidMount(): void {
    super.componentDidMount();
    void this.initialize();
  }
}
