declare module '@bbc/tv-lrud-spatial' {
  function getNextFocus(
    currentFocus: Element | null,
    keyCode: number,
    scope?: HTMLElement
  ): HTMLElement | null;

  export { getNextFocus };
}
