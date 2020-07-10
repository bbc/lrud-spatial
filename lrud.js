/**
 * LRUD: Spatial Edition
 *
 *  @@@@@@@@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@
 *  @@@@@@      '@@@@@@@@@   @@@@@@      '@@@@@@@@@   @@@@@@@@      '@@@@@@@
 *  @@@@@@  @@.   @@@@@@@@   @@@@@@  @@.    @@@@@@@   @@@@@     @@@@.   @@@@
 *  @@@@@@  @@@@  @@@@@@@@   @@@@@@  @@@@   @@@@@@@   @@@@   @@@@@@@@@@@@@@@
 *  @@@@@@        @@@@@@@@   @@@@@@        @@@@@@@@   @@@   @@@@@@@@@@@@@@@@
 *  @@@@@@  @@@@@.  @@@@@@   @@@@@@  @@@@@.  @@@@@@   @@@   @@@@@@@@@@@@@@@@
 *  @@@@@@  @@@@@   @@@@@@   @@@@@@  @@@@@   @@@@@@   @@@@    @@@@@@@@/ @@@@
 *  @@@@@@        /@@@@@@@   @@@@@@        /@@@@@@@   @@@@@@\,         @@@@@
 *  @@@@@@@@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@
 *
 * Copyright (C) 2020 BBC.
 */

// Any "interactive content" https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Interactive_content
const focusableSelector = '[tabindex], a, input, button';
const containerSelector = 'section';
const initialFocus = document.querySelector(focusableSelector);

initialFocus.focus();

/**
 * Polyfill for Element API .matches()
 */
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };
}

/**
 * Traverse DOM ancestors until we find a focus container
 *
 * @param {Element} elem The element representing the search origin
 * @return {Element|null} The parent focus container or null
 */
const getParentContainer = (elem) => {
  if (!elem.parentElement || elem.parentElement.tagName === 'BODY') {
    return null;
  } else if (elem.parentElement.matches(containerSelector)) {
    return elem.parentElement;
  }

  return getParentContainer(elem.parentElement);
}

/**
 * Get the unweighted midpoint of a given edge
 *
 * @param {Rect} rect An object representing the rectangle
 * @param {string} dir The direction of the edge (left, right, up, down)
 * @return {Point} An object containing the X and Y coordinates of the point
 */
const getPointForEdge = (rect, dir) => {
  switch (dir) {
    case 'left':
      return { x: Math.floor(rect.left), y: Math.floor((rect.top + rect.bottom) / 2) };
    case 'right':
      return { x: Math.floor(rect.right), y: Math.floor((rect.top + rect.bottom) / 2) };
    case 'up':
      return { x: Math.floor((rect.left + rect.right) / 2), y: Math.floor(rect.top) };
    case 'down':
      return { x: Math.floor((rect.left + rect.right) / 2), y: Math.floor(rect.bottom) };
  }
}

/**
 * Get the Pythagorean distance between two points
 *
 * @param {Point} a An object containing the X and Y coordinates of the point
 * @param {Point} b Point to compare
 * @return {number} Distance from A to B
 */
const getDistanceBetweenPoints = (a, b) => {
  return Math.sqrt( Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) );
}

/**
 * Check if point A is below point B
 *
 * @param {Point} a An object containing the X and Y coordinates of the point
 * @param {Point} b Point to compare
 * @return {boolean} True if a is below b, false otherwise
 */
const isBelow = (a, b) => a.y > b.y;

/**
 * Check if point A is to the right of point B
 *
 * @param {Point} a An object containing the X and Y coordinates of the point
 * @param {Point} b Point to compare
 * @return {boolean} True if a is to the right of b, false otherwise
 */
const isRight = (a, b) => a.x > b.x;

/**
 * Get the next focus candidate
 *
 * @param {Element} elem The search origin
 * @param {string} exitDir The direction in which we exited the elem (left, right, up, down)
 * @return {Element} The element that should receive focus next
 */
const getNextFocus = (elem, exitDir) => {
  const lastFocus = elem.getAttribute('data-focus');
  if (lastFocus) { return document.querySelector(lastFocus); } //TODO: What if the data attrib is out-of-date?

  const focusRect = elem.getBoundingClientRect();
  const exitPoint = getPointForEdge(focusRect, exitDir);
  const entryDir = (exitDir === 'left' && 'right') ||
        (exitDir === 'right' && 'left') ||
        (exitDir === 'up' && 'down') ||
        (exitDir === 'down' && 'up');

  // !! Containers can only focus other containers
  // Get parent focus container
  const container = getParentContainer(elem);

  const focusableCandidates = document.querySelectorAll(focusableSelector);

  let bestCandidate = null;
  let bestDistance = Infinity;
 
  for (let i = 0; i < focusableCandidates.length; ++i) {
    const candidate = focusableCandidates[i];
    const rect = candidate.getBoundingClientRect();
    const entryPoint = getPointForEdge(rect, entryDir);

    // Bail if the candidate is in the opposite direction
    if (
      exitDir === 'left' && isRight(entryPoint, exitPoint) ||
      exitDir === 'right' && isRight(exitPoint, entryPoint) ||
      exitDir === 'up' && isBelow(entryPoint, exitPoint) ||
      exitDir === 'down' && isBelow(exitPoint, entryPoint)
    ) { continue; }
   
    const distance = getDistanceBetweenPoints(exitPoint, entryPoint);

    if (bestDistance > distance) {
      bestDistance = distance;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate) {
    const candidateParent = getParentContainer(bestCandidate);

    if (candidateParent !== container) {
      // Container changed, foucs first item (or last active child)
      const lastActiveChild = candidateParent.getAttribute('data-focus');

      return lastActiveChild ? candidateParent.querySelector(lastActiveChild) : candidateParent.querySelector(focusableSelector);
    }
  }

  return bestCandidate;
}

/**
 * Assign focus to candidate
 *
 * @param {string} CSS selector of element that should receive focus
 */
const assignFocus = (selector) => {
  const nextFocus = document.querySelector(selector);

  // Check if there is a container
  if (container) {
    container.setAttribute('data-focus', nextFocus);
  }

  nextFocus.focus();
}

const _left = 'left', _right = 'right', _up = 'up', _down = 'down';
const _keyMap = {
  4: _left,
  21: _left,
  37: _left,
  214: _left,
  205: _left,
  218: _left,
  5: _right,
  22: _right,
  39: _right,
  213: _right,
  206: _right,
  217: _right,
  29460: _up,
  19: _up,
  38: _up,
  211: _up,
  203: _up,
  215: _up,
  29461: _down,
  20: _down,
  40: _down,
  212: _down,
  204: _down,
  216: _down,
};
const _pressed = {};

/**
 * Normalize so that only one keyup/keydown event is dispatched to
 * the original handler.
 *
 * @param {Function} originalHandler Handler that expected to receive the original event
 * @return {Function} A function that takes the original KeyEvent as its argument
 */
const normalizeKeyEvent = (originalHandler) => (event) => {
  // Only handle supported key codes
  if (!_keyMap.hasOwnProperty(event.keyCode)) return;

  event = event || window.event;

  const pressedKeyCode = _pressed[event.keyCode.toString()];

  if (event.type === 'keydown') {
    if (!pressedKeyCode) {
      _pressed[event.keyCode.toString()] = true;
      originalHandler(event);
    }
    event.preventDefault();
  } else if (event.type === 'keyup' && pressedKeyCode) {
    delete _pressed[event.keyCode.toString()];
    event.preventDefault();
  }
}

/**
 * Perform directional navigation
 *
 * @param {Event} event The key event
 */
const navigate = (event) => {
  const nextFocus = getNextFocus(event.target, _keyMap[event.keyCode]);

  if (nextFocus) {
    nextFocus.focus();
  }
}

window.addEventListener('keydown', normalizeKeyEvent(navigate));
window.addEventListener('keyup', normalizeKeyEvent(navigate));


