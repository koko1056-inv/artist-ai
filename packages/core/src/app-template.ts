/**
 * The catalog of lightweight, daily-use app templates the MVP supports. Games are out
 * of scope. Each template seeds the AI codegen prompt with structure and capabilities.
 */

export type TemplateId = "task-manager" | "habit-tracker" | "calendar" | "notes";

export interface AppTemplate {
  id: TemplateId;
  nameKey: string;
  descriptionKey: string;
  /** Host bridge capabilities the template typically needs. */
  capabilities: Array<"notifications" | "storage" | "calendar" | "widgets">;
}

export const APP_TEMPLATES: Record<TemplateId, AppTemplate> = {
  "task-manager": {
    id: "task-manager",
    nameKey: "template.taskManager.name",
    descriptionKey: "template.taskManager.desc",
    capabilities: ["notifications", "storage"],
  },
  "habit-tracker": {
    id: "habit-tracker",
    nameKey: "template.habitTracker.name",
    descriptionKey: "template.habitTracker.desc",
    capabilities: ["notifications", "storage", "widgets"],
  },
  calendar: {
    id: "calendar",
    nameKey: "template.calendar.name",
    descriptionKey: "template.calendar.desc",
    capabilities: ["calendar", "notifications", "storage"],
  },
  notes: {
    id: "notes",
    nameKey: "template.notes.name",
    descriptionKey: "template.notes.desc",
    capabilities: ["storage"],
  },
};

export const TEMPLATE_IDS = Object.keys(APP_TEMPLATES) as TemplateId[];
