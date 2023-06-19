# lrud-spatial

Move focus around a HTML document using Left, Right, Up, Down keys.

## API
<pre>
getNextFocus(<i>currentFocus</i>, <i>keyCode</i>, <i>[scope]</i>)
</pre>

### Parameters
* `currentFocus` should be an
[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
that you want LRUD spatial to consider as the element you are navigating _from_.
In simple applications, this can just be a reference to `document.activeElement`.
* `keyCode` should be a
[`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
decimal representing the directional key pressed.
* `scope` is an optional `HTMLElement` that you only want to look for focusable candidates inside of. Defaults to the whole page if not provided.

### Returns
An `HTMLElement` that LRUD spatial thinks you should
navigate _to_.

## Focusables
LRUD spatial defines focusable elements as those which match any of the
following CSS selectors:
* `[tabindex]`
* `a`
* `button`
* `input`

### Ignoring Focusables
Any potential candidate with the `lrud-ignore` class, or inside any parent with the `lrud-ignore` class, will not be considered focusable and will be skipped over. By default LRUD will not ignore candidates that have `opacity: 0` or have a parent with `opacity: 0`, so this class can be used for that.

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
<div class="lrud-container" data-block-exit="up down">
   ...
</div>
```

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

> Remember to terminate this process before running the tests again!