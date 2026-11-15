// Creating a window from markup that is not in the document yet.
//
// Apps that are opened from their dock icon keep their window markup inside a
// `<template>` element. The template is inert, so the app renders nothing
// until it is opened for the first time.

import type { AppWindow } from "./app-window";
import { optionsFromElement } from "./options";
import { createAppWindow } from "./registry";

/**
 * Clone a window's markup out of a template, add it to the desktop and
 * register it. Returns null when the template holds no window.
 */
export function createAppWindowFromTemplate(
  template: HTMLTemplateElement,
  desktop: HTMLElement,
): AppWindow | null {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const element = fragment.querySelector<HTMLElement>("[data-app-window]");
  if (!element) return null;
  if (!element.dataset.appId) return null;

  desktop.appendChild(element);
  return createAppWindow(optionsFromElement(element, desktop));
}
