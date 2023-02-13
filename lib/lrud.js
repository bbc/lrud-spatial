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
 * Copyright (C) 2022 BBC.
 */

// Any "interactive content" https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Interactive_content
const focusableSelector = '[tabindex], a, input, button';
const containerSelector = 'nav, section, .lrud-container';

/**
 * Element API .matches() with fallbacks
 */
const matches = (element, selectors) => {
  const fn = Element.prototype.matches ||
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i = matches.length;
      // eslint-disable-next-line no-empty
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };

  return fn.call(element, selectors);
};

/**
 * Convert a NodeList to a regular Array
 *
 * @param {NodeList} nodeList The NodeList representation
 * @return {Array|null} The Array representation
 */
const toArray = (nodeList) => Array.prototype.slice.call(nodeList);

/**
 * Traverse DOM ancestors until we find a focus container
 *
 * @param {HTMLElement} elem The element representing the search origin
 * @return {HTMLElement|null} The parent focus container or null
 */
const getParentContainer = (elem) => {
  if (!elem.parentElement || elem.parentElement.tagName === 'BODY') {
    return null;
  } else if (matches(elem.parentElement, containerSelector)) {
    return elem.parentElement;
  }

  return getParentContainer(elem.parentElement);
};

/**
 * Build an array of ancestor containers
 *
 * @param {HTMLElement} initialContainer The container to start from
 * @return {HTMLElement[]} An array of ancestor containers
 */
const collectContainers = (initialContainer) => {
  if (!initialContainer) return [];
  const acc = [ initialContainer ];
  let cur = initialContainer;
  while (cur) {
    cur = getParentContainer(cur);
    if (cur) acc.push(cur);
  }
  return acc;
};

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
};

/**
 * Get the Pythagorean distance between two points
 *
 * @param {Point} a An object containing the X and Y coordinates of the point
 * @param {Point} b Point to compare
 * @return {number} Distance from A to B
 */
const getDistanceBetweenPoints = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

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
 * Get blocked exit directions for current node
 *
 * @param {HTMLElement} container Current focus container
 * @param {HTMLElement} candidateContainer Candidate focus container
 * @return {string[]} Array of strings representing blocked directions
 */
const getBlockedExitDirs = (container, candidateContainer) => {
  const currentAncestorContainers = collectContainers(container);
  const candidateAncestorContainers = collectContainers(candidateContainer);

  // Find common container for current container and candidate container and
  // remove everything above it
  for (let i = 0; i < candidateAncestorContainers.length; i++) {
    let commonCandidate = candidateAncestorContainers[i];

    const spliceIndex = currentAncestorContainers.indexOf(commonCandidate);

    if (spliceIndex > -1) {
      currentAncestorContainers.splice(spliceIndex);
      break;
    }
  }

  return currentAncestorContainers.reduce((acc, cur) => {
    const dirs = (cur?.getAttribute('data-block-exit') || '').split(' ');

    return acc.concat(dirs);
  }, []);
};

/**
 * Return early if candidate is in the wrong direction
 *
 * @param {Object} entryRect An object representing the rectangle of the item we're moving to
 * @param {String} exitDir The direction we're moving in
 * @param {Object} entryPointA The first point of the candidate
 * @param {Object} exitPointA The first point of the item we're leaving
 * @return {Booelan} true if candidate is in the correct dir, false if not
 */
const isValidCandidate = (entryRect, exitDir, entryPointA, exitPointA) => {
  if (
    entryRect.width === 0 && entryRect.height === 0 ||
    exitDir === 'left' && isRight(entryPointA, exitPointA) ||
    exitDir === 'right' && isRight(exitPointA, entryPointA) ||
    exitDir === 'up' && isBelow(entryPointA, exitPointA) ||
    exitDir === 'down' && isBelow(exitPointA, entryPointA)
  ) return true;

  return false;
};

const getBestCandidate = (elem, candidates, exitDir) => {
  let bestCandidate = null;
  let bestDistance = Infinity;
  const exitRect = elem.getBoundingClientRect();
  const [ exitPointA, exitPointB ] = getPointsForEdge(exitRect, exitDir);
  const entryDir = (exitDir === 'left' && 'right') ||
        (exitDir === 'right' && 'left') ||
        (exitDir === 'up' && 'down') ||
        (exitDir === 'down' && 'up');

  for (let i = 0; i < candidates.length; ++i) {
    const candidate = candidates[i];
    const entryRect = candidate.getBoundingClientRect();
    const [ entryPointA, entryPointB ] = getPointsForEdge(entryRect, entryDir);

    // Bail if the candidate is in the opposite direction or has no dimensions
    if (isValidCandidate(entryRect, exitDir, entryPointA, exitPointA)) continue;

    const distance = Math.min(
      getDistanceBetweenPoints(exitPointA, entryPointA),
      getDistanceBetweenPoints(exitPointB, entryPointB));

      if (bestDistance > distance) {
        bestDistance = distance;
        bestCandidate = candidate;
      }
    }

  return bestCandidate;
};

/**
 * Get the next focus candidate
 *
 * @param {HTMLElement} elem The search origin
 * @param {string} exitDir The direction in which we exited the elem (left, right, up, down)
 * @return {HTMLElement} The element that should receive focus next
 */
export const getNextFocus = (elem, keyCode, scope) => {
  if (!scope || !scope.querySelector) scope = document;
  if (!elem) return scope.querySelector(focusableSelector);
  const exitDir = _keyMap[keyCode];

  // Get parent focus container
  const container = getParentContainer(elem);

  let bestCandidate;

  // Get all siblings within a prioritised container
  if (!container?.getAttribute('data-lrud-prioritise-children') && scope.contains(container)) {
    const focusableSiblings = container.querySelectorAll(focusableSelector);
    bestCandidate = getBestCandidate(elem, focusableSiblings, exitDir);
  }

  if (!bestCandidate) {
    const focusableCandidates = [
      ...toArray(scope.querySelectorAll(focusableSelector)),
      ...toArray(scope.querySelectorAll(containerSelector))
    ];

    bestCandidate = getBestCandidate(elem, focusableCandidates, exitDir);
  }

  if (bestCandidate) {
    const isBestCandidateAContainer = matches(bestCandidate, containerSelector);
    const candidateContainer = isBestCandidateAContainer ? bestCandidate : getParentContainer(bestCandidate);

    const isCurrentContainer = candidateContainer === container;
    const isNestedContainer = container?.contains(candidateContainer);
    const isAnscestorContainer = candidateContainer?.contains(container);

    if (!isCurrentContainer && (!isNestedContainer || isBestCandidateAContainer)) {
      const blockedExitDirs = getBlockedExitDirs(container, candidateContainer);
      if (blockedExitDirs.indexOf(exitDir) > -1) return;

      if (candidateContainer && !isAnscestorContainer) {
        // Ignore active child behaviour when moving into a container that we
        // are already nested in
        if (elem.id) container?.setAttribute('data-focus', elem.id);

        const lastActiveChild = candidateContainer.getAttribute('data-focus');

        return lastActiveChild
          ? document.getElementById(lastActiveChild)
          : candidateContainer.querySelector(focusableSelector);
      }
    }
  }

  return bestCandidate;
};

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
