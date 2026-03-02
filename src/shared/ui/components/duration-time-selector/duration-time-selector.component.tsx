import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { BaseComponent } from "@shared/base/base.component";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import type { BaseState } from "@shared/base/interfaces/base-state.interface";
import { SlotsRail, TimeChip } from "./duration-time-selector.styles";

export type DurationTimeOption = { value: string | number; label: string };

type Props = BaseProps & {
  value?: string | number;
  onChange?: (v: string | number) => void;
  // mode: 'duration' -> options are minutes numbers; 'time' -> options are times of day
  mode?: "duration" | "time";
  // duration minutes list when mode=duration
  durations?: number[];
  // time range when mode=time
  startTime?: string; // e.g. "08:00"
  endTime?: string; // e.g. "18:00"
  stepMinutes?: number;
  options?: DurationTimeOption[]; // explicit options override
  size?: "large" | "middle" | "small";
  // presentation variant: 'select' shows antd Select dropdown, 'chips' shows inline selectable chips
  variant?: "select" | "chips";
  // minimum chip width in pixels when variant='chips'
  chipMinWidth?: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}

function timeStringToMinutes(t: string) {
  const [h, m] = t.split(":").map((x) => Number(x));
  return h * 60 + m;
}

export class DurationTimeSelector extends BaseComponent<Props, BaseState> {
  public override state: BaseState = { isLoading: false, error: undefined };

  static defaultProps: Partial<Props> = {
    mode: "duration",
    durations: [15, 25, 30, 45, 60],
    startTime: "08:00",
    endTime: "18:00",
    stepMinutes: 15,
    size: "middle",
    variant: "chips",
    chipMinWidth: 96,
  };

  private buildOptions(): DurationTimeOption[] {
    if (this.props.options && this.props.options.length) return this.props.options;

    if (this.props.mode === "time") {
      const start = timeStringToMinutes(this.props.startTime ?? "00:00");
      const end = timeStringToMinutes(this.props.endTime ?? "23:59");
      const step = this.props.stepMinutes ?? 15;
      const out: DurationTimeOption[] = [];
      for (let m = start; m <= end; m += step) {
        const label = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
        out.push({ value: label, label });
      }
      return out;
    }

    // duration mode
    const dur = this.props.durations ?? [15, 25, 30, 45, 60];
    return dur.map((d) => ({ value: d, label: minutesToHHMM(d) }));
  }

  protected renderView(): React.ReactNode {
    const opts = this.buildOptions();
    if (this.props.variant === "select") {
      return (
        <Select
          size={this.props.size}
          value={this.props.value}
          onChange={(v) => this.props.onChange && this.props.onChange(v as string | number)}
          options={opts as SelectProps<DurationTimeOption>["options"]}
          style={{ width: "100%" }}
        />
      );
    }

    // chips variant
    const minW = this.props.chipMinWidth ?? 96;
    return (
      <SlotsRail>
        {opts.map((o) => {
          const isActive = String(o.value) === String(this.props.value);
          return (
            <TimeChip
              key={String(o.value)}
              type="button"
              $active={isActive}
              onClick={() => this.props.onChange && this.props.onChange(o.value)}
              style={{ minWidth: minW, padding: "8px 12px" }}
            >
              {o.label}
            </TimeChip>
          );
        })}
      </SlotsRail>
    );
  }
}

export default DurationTimeSelector;
