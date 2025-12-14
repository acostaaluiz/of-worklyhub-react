import type { BaseState } from "./base-state.interface";

export interface BasePageState extends BaseState {
  initialized: boolean;
}
