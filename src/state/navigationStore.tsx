import { createSignal } from "solid-js";

export type Sidebar = "local replays" | "analysis" | "clips" | "inputs";

export const [currentSidebar, setSidebar] =
  createSignal<Sidebar>("local replays");
