<p align="center">
  <img src="https://github.com/bbc/lrud-spatial/blob/master/.github/lrud.svg?raw=true" alt="LRUD spatial"/>
</p>

Move focus around a HTML document using Left, Right, Up, Down keys.

## API

<pre>
getNextFocus(<i>currentFocus</i>, <i>keyOrKeyCode</i>, <i>[scope]</i>)
</pre>

### Parameters

- `currentFocus` should be an
  [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
  that you want LRUD spatial to consider as the element you are navigating _from_.
  In simple applications, this can just be a reference to `document.activeElement`.
- `keyOrKeyCode` should be a
  [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) string or
  a [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
  decimal representing the directional key pressed.
- `scope` is an optional `HTMLElement` that you only want to look for focusable candidates inside of. Defaults to the whole page if not provided.

### Returns

An `HTMLElement` that LRUD spatial thinks you should
navigate _to_.

## Focusables

LRUD spatial defines focusable elements as those which match any of the
following CSS selectors:

- `[tabindex]` (for tabindex >= 0)
- `a`
- `button`
- `input`

### Ignoring Focusables

Any potential candidate with the `lrud-ignore` class, or inside any parent with the `lrud-ignore` class, will not be considered focusable and will be skipped over. By default LRUD will not ignore candidates that have `opacity: 0` or have a parent with `opacity: 0`, so this class can be used for that.

Focusables with a `tabindex="-1"` attribute will be skipped over, however any focusable inside any parent with `tabindex="-1"` will still be considered focusable.

### Focusable Overlap

By default, LRUD will measure to all candidates that are in the direction to move. It will also include candidates that overlap the current focus by up to 30%, allowing for e.g. a 'right' movement to include something that is above the current focus, but has half of it's size expanding to the right.

This threshold can be adjusted on a per-element basis with the `data-lrud-overlap-threshold` attribute, as a float from 0.0 to 1.0. An overlap of 0.0 will make a candidate only be considered if it is located _entirely_ in the direction of movement.

Please also note that LRUD does not consider the Z Axis, which can cause surprising results with elements that are overlapped in this way, including in the case of full screen overlays on existing UIs. The above attribute can help alleviate this issue.

## Containers

Focusables can be wrapped in containers. Containers can keep track of the last
active focusable item within them using a `data-focus` attribute.

> Focusables that should be tracked must have a unique ID attribute.

When a container has no previous focus state, it's first focusable element is
used instead.

At this time, containers are defined as matching the CSS selectors:
`nav`, `section` or `.lrud-container`.

### Block exits

In some instances, it is desirable to prevent lrud-spatial from selecting another
"best candidate" for example at the bottom of a list. To do this, a container element
should add an additional `data-block-exit` attribute to prevent further selection in
that direction. This should be a space separated list.

E.g.

```html
<div class="lrud-container" data-block-exit="up down">...</div>
```

### Focusable Containers

By default, LRUD only measures the distances to focusables and does not consider where their container boundaries are. Adding the attribute `data-lrud-consider-container-distance` to a container will include it in the distance calculations, as well as its children.

If the container is the closest out of all the possible focusables assessed, LRUD will return one of its children - even if they are not necessarily the spatially closest focusable.

The above container focus logic will still be used, and moving into a focusable container will move to its last focused child if there was one, at any level of container depth inside it.


## How does it work?

To determine the next element that should be focused;

1. Uses the key code to get the direction of movement
2. From the currently focused DOM element, get the coordinates of the edge
   corresponding to the direction you are moving
3. For all other focusable elements, get the coordinates of the opposite edge
   (the edge you are entering)
4. Find the line between the exit and entry coordinates that has the shortest
   length

## Developing

Requirements: Node.js 18

To get started, run `npm ci`.

### Building

`npm run build` will emit a transpiled and minified version of the library.
This is run during CI to prepare the artifact published to NPM. It can also be
useful for integrating against another local project with `npm link`.

### Testing

The `test/layouts` directory contains HTML designed to mirror various
real-world use cases, and allow for behavioural vertification of library
features such as containers and grids.

Significant new features should come with corresponding layouts that test them.

Use `npm test` to run the tests.

#### Debugging

The tests use [puppeteer](https://github.com/puppeteer/puppeteer) to spin up a
headless browser. The browser loads the layouts mentioned above and runs
scenarios from [lrud.test.js](./test/lrud.test.js) against the unminified
code from `lib/`.

To investigate why a test is failing, or just to hack on some changes... run
`npm run server`. Then go to [http://localhost:3005](http://localhost:3005) and
select a layout.

## Contact

[TVOpenSource@bbc.co.uk](mailto:TVOpenSource@bbc.co.uk) - we aim to respond to emails within a week.
