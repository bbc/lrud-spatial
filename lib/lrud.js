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
 * Get the points for a given edge
 *
 * @param {Rect} rect An object representing the rectangle
 * @param {string} dir The direction of the edge (left, right, up, down)
 * @return {Point[]} An array containing a pair of objects with X and Y coordinates
 */
const getPointsForEdge = (rect, dir) => {
  switch (dir) {
    case 'left':
      return [ { x: Math.floor(rect.left), y: Math.floor(rect.top) },
        { x: Math.floor(rect.left), y: Math.floor(rect.bottom) } ];
    case 'right':
      return [ { x: Math.floor(rect.right), y: Math.floor(rect.top) },
        { x: Math.floor(rect.right), y: Math.floor(rect.bottom) } ];
    case 'up':
      return [ { x: Math.floor(rect.left), y: Math.floor(rect.top) },
        { x: Math.floor(rect.right), y: Math.floor(rect.top) } ];
    case 'down':
      return [ { x: Math.floor(rect.left), y: Math.floor(rect.bottom) },
        { x: Math.floor(rect.right), y: Math.floor(rect.bottom) } ];
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
  const exitRect = elem.getBoundingClientRect();
  const [ exitPointA, exitPointB ] = getPointsForEdge(exitRect, exitDir);
  const entryDir = (exitDir === 'left' && 'right') ||
        (exitDir === 'right' && 'left') ||
        (exitDir === 'up' && 'down') ||
        (exitDir === 'down' && 'up');

  // Get parent focus container
  const container = getParentContainer(elem);

  const focusableCandidates = document.querySelectorAll(focusableSelector);

  let bestCandidate = null;
  let bestDistance = Infinity;
 
  for (let i = 0; i < focusableCandidates.length; ++i) {
    const candidate = focusableCandidates[i];
    const entryRect = candidate.getBoundingClientRect();
    const [ entryPointA, entryPointB ] = getPointsForEdge(entryRect, entryDir);

    // Bail if the candidate is in the opposite direction or has no dimensions
    if (
      entryRect.width === 0 && entryRect.height === 0 ||
      exitDir === 'left' && isRight(entryPointA, exitPointA) ||
      exitDir === 'right' && isRight(exitPointA, entryPointA) ||
      exitDir === 'up' && isBelow(entryPointA, exitPointA) ||
      exitDir === 'down' && isBelow(exitPointA, entryPointA)
    ) { continue; }
   
    const distance = Math.min(
      getDistanceBetweenPoints(exitPointA, entryPointA),
      getDistanceBetweenPoints(exitPointB, entryPointB));

    if (bestDistance > distance) {
      bestDistance = distance;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate) {
    const candidateContainer = getParentContainer(bestCandidate);

    if (candidateContainer !== container) {
      if (elem.id) container.setAttribute('data-focus', elem.id);

      const lastActiveChild = candidateContainer.getAttribute('data-focus');

      return lastActiveChild
        ? document.getElementById(lastActiveChild)
        : candidateContainer.querySelector(focusableSelector);
    }
  }

  return bestCandidate;
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

