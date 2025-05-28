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
const ignoreSelector = '.lrud-ignore, [disabled]';

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
 * @return {HTMLElement[]} Array of valid focusables inside the scope
 */
const getFocusables = (scope) => {
  if (!scope) return [];

  const ignoredElements = toArray(scope.querySelectorAll(ignoreSelector));

  return toArray(scope.querySelectorAll(focusableSelector))
    .filter(node => !ignoredElements.some(ignored => ignored == node || ignored.contains(node)))
    .filter(node => parseInt(node.getAttribute('tabindex') || '0', 10) > -1);
};

/**
 * Get all the focusable candidates inside `scope`,
 * including focusable containers
 *
 * @param {HTMLElement} scope The element to search inside of
 * @return {HTMLElement[]} Array of valid focusables inside the scope
 */
const getAllFocusables = (scope) => {
  const ignoredElements = toArray(scope.querySelectorAll(ignoreSelector));

    return [
    ...toArray(scope.querySelectorAll(focusableContainerSelector))
      .filter(node => !ignoredElements.some(ignored => ignored == node || ignored.contains(node)))
      .filter(container => getFocusables(container)?.length > 0),
    ...getFocusables(scope)
  ];
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
 * Check if the candidate is in the `exitDir` direction from the rect we're leaving,
 * with an overlap allowance of entryWeighting as a percentage of the candidate's width.
 *
 * @param {Object} entryRect An object representing the rectangle of the item we're moving to
 * @param {String} exitDir The direction we're moving in
 * @param {Object} exitPoint The midpoint of the edge we're leaving
 * @param {Float} entryWeighting Percentage of the candidate that is allowed to be behind the target
 * @return {Booelan} true if candidate is in the correct dir, false if not
 */
const isValidCandidate = (entryRect, exitDir, exitPoint, entryWeighting) => {
  if (entryRect.width === 0 && entryRect.height === 0) return false;
  if (!entryWeighting && entryWeighting != 0) entryWeighting = 0.3;

  const weightedEntryPoint = {
    x: entryRect.left + (entryRect.width * (exitDir === 'left' ? 1 - entryWeighting : exitDir === 'right' ? entryWeighting : 0.5)),
    y: entryRect.top + (entryRect.height * (exitDir === 'up' ? 1 - entryWeighting : exitDir === 'down' ? entryWeighting : 0.5))
  };

  if (
    exitDir === 'left' && isRight(exitPoint, weightedEntryPoint) ||
    exitDir === 'right' && isRight(weightedEntryPoint, exitPoint) ||
    exitDir === 'up' && isBelow(exitPoint, weightedEntryPoint) ||
    exitDir === 'down' && isBelow(weightedEntryPoint, exitPoint)
  ) return true;

  return false;
};

/**
 * Sort the candidates ordered by distance to the elem,
 * and filter out invalid candidates.
 *
 * @param {HTMLElement[]} candidates A set of candidate elements to sort
 * @param {HTMLElement} elem The search origin
 * @param {string} exitDir The direction in which we exited the elem (left, right, up, down)
 * @return {HTMLElement[]} The valid candidates, in order by distance
 */
const sortValidCandidates = (candidates, elem, exitDir) => {
  const exitRect = elem.getBoundingClientRect();
  const exitPoint = getMidpointForEdge(exitRect, exitDir);
  return candidates.filter(candidate => {
    // Filter out candidates that are in the opposite direction or have no dimensions
    const entryRect = candidate.getBoundingClientRect();
    const allowedOverlap = parseFloat(candidate.getAttribute('data-lrud-overlap-threshold'));
    return isValidCandidate(entryRect, exitDir, exitPoint, allowedOverlap);
  }).map(candidate => {
    const entryRect = candidate.getBoundingClientRect();
    const nearestPoint = getNearestPoint(exitPoint, exitDir, entryRect);
    const distance = getDistanceBetweenPoints(exitPoint, nearestPoint);
    return {
      candidate,
      distance
    };
  }).sort((a, b) => a.distance - b.distance).map(({ candidate }) => candidate);
};

/**
 * Get the first parent container that matches the focusable candidate selector
 * @param {HTMLElement} startingCandidate The starting candidate to get the parent container of
 * @return {HTMLElement} The container that matches or null
 */
const getParentFocusableContainer = (startingCandidate) => {
  if (!startingCandidate) return null;
  do {
    startingCandidate = getParentContainer(startingCandidate);
  } while (startingCandidate && !matches(startingCandidate, focusableContainerSelector));

  return startingCandidate;
};

/**
 * Get the next focus candidate
 *
 * @param {HTMLElement} elem The search origin
 * @param {string|number} keyOrKeyCode The key or keyCode value (from KeyboardEvent) of the pressed key
 * @param {HTMLElement} scope The element LRUD spatial is scoped to operate within
 * @return {HTMLElement} The element that should receive focus next
 */
export const getNextFocus = (elem, keyOrKeyCode, scope) => {
  if (!scope || !scope.querySelector) scope = document.body;
  if (!elem) return getFocusables(scope)?.[0];
  const exitDir = _keyMap[keyOrKeyCode];

  // Get parent focus container
  const parentContainer = getParentContainer(elem);
  if (parentContainer && matches(elem, focusableSelector)) {
    parentContainer.setAttribute('data-focus', elem.id);
    getParentFocusableContainer(parentContainer)?.setAttribute('data-focus', elem.id);
  }

  let focusableCandidates = [];

  // Get all siblings within a prioritised container
  if (parentContainer?.getAttribute('data-lrud-prioritise-children') !== 'false' && scope.contains(parentContainer)) {
    const focusableSiblings = getAllFocusables(parentContainer);
    focusableCandidates = sortValidCandidates(focusableSiblings, elem, exitDir);
  }

  if (focusableCandidates.length === 0) {
    const candidates = getAllFocusables(scope);
    focusableCandidates = sortValidCandidates(candidates, elem, exitDir);
  }

  for (const candidate of focusableCandidates) {
    const candidateIsContainer = matches(candidate, containerSelector);
    const candidateContainer = candidateIsContainer ? candidate : getParentContainer(candidate);

    const isCurrentContainer = candidateContainer === parentContainer;
    const isNestedContainer = parentContainer?.contains(candidateContainer);
    const isAnscestorContainer = candidateContainer?.contains(parentContainer);

    if (!isCurrentContainer && (!isNestedContainer || candidateIsContainer)) {
      const blockedExitDirs = getBlockedExitDirs(parentContainer, candidateContainer);
      if (blockedExitDirs.indexOf(exitDir) > -1) continue;

      if (candidateContainer && !isAnscestorContainer) {
        // Ignore active child behaviour when moving into a container that we
        // are already nested in
        const lastActiveChild = document.getElementById(candidateContainer?.getAttribute('data-focus'));

        const newFocus = lastActiveChild || getFocusables(candidateContainer)?.[0];
        getParentFocusableContainer(candidateContainer)?.setAttribute('data-focus', newFocus?.id);
        candidateContainer?.setAttribute('data-focus', newFocus?.id);
        return newFocus;
      }
    }

    if (!candidateIsContainer) {
      getParentFocusableContainer(candidateContainer)?.setAttribute('data-focus', candidate.id);
      candidateContainer?.setAttribute('data-focus', candidate.id);
    }
    return candidate;
  }
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
  'ArrowLeft': _left,
  'ArrowRight': _right,
  'ArrowUp': _up,
  'ArrowDown': _down
};
