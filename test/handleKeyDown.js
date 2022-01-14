import { getNextFocus } from "../../lib/lrud.js";

/**
 * Perform directional navigation
 *
 * @param {Event} event The key event
 */
const handleKeyDown = (event) => {
  const nextFocus = getNextFocus(event.target, event.keyCode);

  if (nextFocus) {
    nextFocus.focus();
  }
}

window.addEventListener('keydown', handleKeyDown);
getNextFocus().focus();
