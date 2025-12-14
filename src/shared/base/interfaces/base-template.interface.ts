import React from "react";

export interface BaseTemplateSlots {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  content: React.ReactNode;
}
