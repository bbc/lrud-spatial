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
 * Copyright (C) 2023 BBC.
 */

// Any "interactive content" https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Interactive_content
const focusableSelector = '[tabindex], a, input, button';
const containerSelector = 'nav, section, .lrud-container';
const focusableContainerSelector = '[data-lrud-consider-container-distance]';
const ignoredClass = 'lrud-ignore';

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
 * Get all focusable elements inside `scope`,
 * discounting any that are ignored or inside an ignored container
 *
 * @param {HTMLElement} scope The element to search inside of
 * @return {Array} Array of valid focusables inside the scope
 */
const getFocusables = (scope) => {
  if (!scope) return [];

  const ignoredElements = toArray(scope.querySelectorAll('.' + ignoredClass));
  if (scope.className.indexOf(ignoredClass) > -1) ignoredElements.push(scope);

  return toArray(scope.querySelectorAll(focusableSelector))
    .filter(node => !ignoredElements.some(ignored => ignored == node || ignored.contains(node)));
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
 * Get the middle point of a given edge
 *
 * @param {Object} rect An object representing the rectangle
 * @param {String} dir The direction of the edge (left, right, up, down)
 * @return {Point} An object with the X and Y coordinates of the point
 */
const getMidpointForEdge = (rect, dir) => {
  switch (dir) {
    case 'left':
      return { x: rect.left, y: (rect.top + rect.bottom) / 2 };
    case 'right':
      return { x: rect.right, y: (rect.top + rect.bottom) / 2 };
    case 'up':
      return { x: (rect.left + rect.right) / 2, y: rect.top };
    case 'down':
      return { x: (rect.left + rect.right) / 2, y: rect.bottom };
  }
};

/**
 * Gets the nearest point on `rect` that a line in direction `dir` from `point` would hit
 * If the rect is exactly in direction `dir` then the point will be in a straight line from `point`.
 * Otherwise it will be the nearest corner of the target rect.
 *
 * @param {Point} point The point to start from
 * @param {String} dir The direction to draw the line in
 * @param {Object} rect An object representing the rectangle of the item we're going to
 * @return {Point} An object with the X/Y coordinates of the nearest point
 */
const getNearestPoint = (point, dir, rect) => {
  if (dir === 'left' || dir === 'right') {
    // When moving horizontally...
    // The nearest X is always the nearest edge, left or right
    const x = dir === 'left' ? rect.right : rect.left;

    // If the start point is higher than the rect, nearest Y is the top corner
    if (point.y < rect.top) return { x, y: rect.top };
    // If the start point is lower than the rect, nearest Y is the bottom corner
    if (point.y > rect.bottom) return { x, y: rect.bottom };
    // Else the nearest Y is aligned with where we started
    return { x, y: point.y };
  } else if (dir === 'up' || dir === 'down') {
    // When moving vertically...
    // The nearest Y is always the nearest edge, top or bottom
    const y = dir === 'up' ? rect.bottom : rect.top;

    // If the start point is left-er than the rect, nearest X is the left corner
    if (point.x < rect.left) return { x: rect.left, y };
    // If the start point is right-er than the rect, nearest X is the right corner
    if (point.x > rect.right) return { x: rect.right, y };
    // Else the nearest X is aligned with where we started
    return { x: point.x, y };
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
 * @param {Object} exitPoint The first point of the item we're leaving
 * @return {Booelan} true if candidate is in the correct dir, false if not
 */
const isValidCandidate = (entryRect, exitDir, exitPoint) => {
  if (entryRect.width === 0 && entryRect.height === 0) return false;

  const corners = [
    { x: entryRect.left, y: entryRect.top },
    { x: entryRect.right, y: entryRect.top },
    { x: entryRect.right, y: entryRect.bottom },
    { x: entryRect.left, y: entryRect.bottom }
  ];

  if (
    exitDir === 'left' && corners.some((corner) => isRight(exitPoint, corner)) ||
    exitDir === 'right' && corners.some((corner) => isRight(corner, exitPoint)) ||
    exitDir === 'up' && corners.some((corner) => isBelow(exitPoint, corner)) ||
    exitDir === 'down' && corners.some((corner) => isBelow(corner, exitPoint))
  ) return true;

  return false;
};

const getBestCandidate = (elem, candidates, exitDir) => {
  let bestCandidate = null;
  let bestDistance = Infinity;
  const exitRect = elem.getBoundingClientRect();
  const exitPoint = getMidpointForEdge(exitRect, exitDir);

  for (let i = 0; i < candidates.length; ++i) {
    const candidate = candidates[i];
    const entryRect = candidate.getBoundingClientRect();

    // Bail if the candidate is in the opposite direction or has no dimensions
    if (!isValidCandidate(entryRect, exitDir, exitPoint)) continue;

    const nearestPoint = getNearestPoint(exitPoint, exitDir, entryRect);
    const distance = getDistanceBetweenPoints(exitPoint, nearestPoint);

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
  if (!scope || !scope.querySelector) scope = document.body;
  if (!elem) return getFocusables(scope)?.[0];
  const exitDir = _keyMap[keyCode];

  // Get parent focus container
  const parentContainer = getParentContainer(elem);

  let bestCandidate;

  // Get all siblings within a prioritised container
  if (parentContainer?.getAttribute('data-lrud-prioritise-children') !== 'false' && scope.contains(parentContainer)) {
    const focusableSiblings = getFocusables(parentContainer);
    bestCandidate = getBestCandidate(elem, focusableSiblings, exitDir);
  }

  if (!bestCandidate) {
    const focusableCandidates = [
      ...getFocusables(scope),
      ...toArray(scope.querySelectorAll(focusableContainerSelector)).filter(container => getFocusables(container)?.length > 0 && container !== parentContainer)
    ];

    bestCandidate = getBestCandidate(elem, focusableCandidates, exitDir);
  }

  if (bestCandidate) {
    const isBestCandidateAContainer = matches(bestCandidate, containerSelector);
    const candidateContainer = isBestCandidateAContainer ? bestCandidate : getParentContainer(bestCandidate);

    const isCurrentContainer = candidateContainer === parentContainer;
    const isNestedContainer = parentContainer?.contains(candidateContainer);
    const isAnscestorContainer = candidateContainer?.contains(parentContainer);

    if (!isCurrentContainer && (!isNestedContainer || isBestCandidateAContainer)) {
      const blockedExitDirs = getBlockedExitDirs(parentContainer, candidateContainer);
      if (blockedExitDirs.indexOf(exitDir) > -1) return;

      if (candidateContainer && !isAnscestorContainer) {
        // Ignore active child behaviour when moving into a container that we
        // are already nested in
        if (elem.id) parentContainer?.setAttribute('data-focus', elem.id);

        const lastActiveChild = document.getElementById(candidateContainer.getAttribute('data-focus'));

        return lastActiveChild || getFocusables(candidateContainer)?.[0];
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
