import { getNextFocus } from '../../lib/lrud.js';

let scope = null;

/**
 * Perform directional navigation
 *
 * @param {Event} event The key event
 */
const handleKeyDown = (event) => {
  const nextFocus = getNextFocus(event.target, event.keyCode, scope);

  if (nextFocus) {
    nextFocus.focus();
  }
};

window.setScope = (newScope) => scope = newScope;

window.addEventListener('click', (e) => {
  if (e.target.nodeName !== 'INPUT') {
    e.preventDefault();
  }
});

window.addEventListener('keydown', handleKeyDown);
getNextFocus().focus();
