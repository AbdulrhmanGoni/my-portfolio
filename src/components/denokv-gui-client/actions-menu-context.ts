import { createContext } from "svelte";

type ActionsMenuContext = {
  close: () => void;
};

// Shared by ActionsMenu and its items so selecting an item closes the menu.
export const [getActionsMenuContext, setActionsMenuContext] =
  createContext<ActionsMenuContext>();
