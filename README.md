# lrud-spatial

Move focus around a HTML document using Left, Right, Up, Down keys.

## Focusables
LRUD spatial defines focusable elements as those which match any of the
following CSS selectors:
* `[tabindex]`
* `a`
* `button`
* `input`

## Containers
Focusables can be wrapped in containers. Containers can keep track of the last
active focusable item within them using a `data-focus` attribute.

> Focusables that should be tracked must have a unique ID attribute.

When a container has no previous focus state, it's first focusable element is
used instead.

At this time, containers are defined as matching the CSS selectors: `nav`, `section` or `.lrud-container`.

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
