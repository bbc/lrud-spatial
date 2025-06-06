const puppeteer = require('puppeteer');
const server = require('./server');

const testPath = `${server.address}/test/layouts`;

describe('LRUD spatial', () => {
  let browser;
  let page;
  let context;

  const getParentContainerDataFocus = (id) => page.evaluate((id) => document.getElementById(id).parentElement.getAttribute('data-focus'), id);

  beforeAll(async () => {
    try {
      await server.listen();
    } catch (ex) {
      if (ex.code !== 'EADDRINUSE') {
        throw ex;
      }
    }
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      defaultViewport: {width: 1280, height: 800}
    });
    context = await browser.createIncognitoBrowserContext();
  });

  beforeEach(async () => {
    page = await context.newPage();
  });

  afterEach(async () => {
    await page?.close();
  });

  afterAll(async () => {
    await context?.close();
    await browser?.close();
    try {
      await server.close();
    } catch { /* empty */ }
  });

  describe('Initialising', () => {
    it('should focus on the first candidate by default', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });
  });

  describe('Page with one container and four candidates', () => {
    it('should focus on the second item on a right arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });

    it('should focus on the third item on a down arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should focus on the fourth item on a right, down arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-4');
    });

    it('should focus on the first item on a right, down, left, up arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should remain focused on the first item on a left arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowLeft');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should remain focused on the second item on a right, right arrow press', async () => {
      await page.goto(`${testPath}/1c-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });
  });

  describe('Page with two vertical containers and four candidates', () => {
    it('should focus on the third item on a down arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should focus on the first item on a down, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should return to the last active child on a down, right, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should return to the last active child on a right, down, left, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });

    it('should remain focused on the first item on a left arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowLeft');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should remain focused on the second item on a right, right arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });
  });

  describe('Page with two vertical containers and four candidates but no ids', () => {
    it('should focus on the first item on a down, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f-no-ids.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.classList);

      expect(result).toEqual({'0': 'first-item', '1': 'item'});
    });

    it('should focus on the first item on a down, right, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f-no-ids.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.classList);

      expect(result).toEqual({'0': 'first-item', '1': 'item'});
    });

    it('should focus on the first item on a right, down, left, up arrow press', async () => {
      await page.goto(`${testPath}/2c-v-4f-no-ids.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.classList);

      expect(result).toEqual({'0': 'first-item', '1': 'item'});
    });
  });

  describe('Page with two horizontal containers and four candidates', () => {
    it('should remain focused on the first item on a down arrow press', async () => {
      await page.goto(`${testPath}/2c-h-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should focus on the third item on a right, right arrow press', async () => {
      await page.goto(`${testPath}/2c-h-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should focus on the second item on a right, right, left arrow press', async () => {
      await page.goto(`${testPath}/2c-h-4f.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });
  });

  describe('Invisible elements', () => {
    /*
     * Elements that are `display: none` or `visibility: hidden` have their
     * width, height, and coordinates set to 0. These should not be considered focusable candidates.
     *
     * Elements with the `lrud-ignore` class, or inside a parent with the `lrud-ignore` class, should
     * not be considered focusable candidates
     *
     */
    it('should ignore hidden items as possible candidates and move past them', async () => {
      await page.goto(`${testPath}/hidden.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });

    it('should ignore visible items inside ignored containers', async () => {
      await page.goto(`${testPath}/hidden.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-11');
    });
  });

  describe('Unreachable foucsable elements', () => {
    /*
     * Elements with a tabindex of -1 should not be considered focusable candidates.
     * Elements inside a parent with tabindex -1 should be considered focusable candidates.
     *
     */
    it('should ignore tabindex -1 items as possible candidates and move past them', async () => {
      await page.goto(`${testPath}/unreachable.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-4');
    });

    it('should not ignore visible items inside tabindex -1 containers', async () => {
      await page.goto(`${testPath}/unreachable.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');

      await page.keyboard.press('ArrowDown');

      const nextResult = await page.evaluate(() => document.activeElement.id);

      expect(nextResult).toEqual('item-7');
    });
  });

  describe('disabled elements are not focusable but aria-disabled=true are', () => {
    it('disabled', async () => {
      await page.goto(`${testPath}/disabled.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('aria-disabled="true"', async () => {
      await page.goto(`${testPath}/disabled.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });
  });

  describe('Page with 11 candidates, with varying sizes', () => {
    it('should focus on candidate 6 when right, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });

    it('should focus on candidate 6 when right, right, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });

    it('should focus on candidate 11 when right, right, down, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-11');
    });

    it('should focus on candidate 5 when right, down, down, left, left up is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-5');
    });

    it('should focus on candidate 14 when right, right, right down, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-14');
    });

    it('should focus on candidate 7 when right, right, right down, down, up is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-7');
    });
  });

  describe('Page with 3 candidates with equal distances to matching corners', () => {
    it('should focus on candidate 1 when down, right, up is pressed', async () => {
      await page.goto(`${testPath}/0c-3f-distance.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });
  });

  describe('Page with two containers with blocked exit directions', () => {
    it('should prevent focus moving to candidate 3 when down is pressed', async () => {
      await page.goto(`${testPath}/3c-h-6f-blocked-exit.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });

    it('should prevent focus moving to candidate 2 when up is pressed', async () => {
      await page.goto(`${testPath}/3c-h-6f-blocked-exit.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should allow container exit for non blocked directions', async () => {
      await page.goto(`${testPath}/3c-h-6f-blocked-exit.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-5');
    });

    it('should move to the second best candidate if first was blocked', async () => {
      await page.goto(`${testPath}/3c-h-6f-blocked-exit.html`);
      await page.evaluate(() => document.getElementById('item-6').focus());
      await page.keyboard.press('ArrowUp');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });
  });

  describe('Page with nested containers', () => {
    it('should allow movement into a nested container', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
    });

    it('should allow movement out of nested container', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should apply data-block-exit rules', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-3');
    });

    it('should apply data-block-exit rules in nested container', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.waitForFunction('document.activeElement');
      await page.evaluate(() => document.getElementById('item-6').focus());
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });

    it('should not apply data-block-exit rules to candidates without containers', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.waitForFunction('document.activeElement');
      await page.evaluate(() => document.getElementById('item-8').focus());
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-9');
    });
  });

  describe('Page with small or close items', () => {
    beforeEach(async () => {
      await page.goto(`${testPath}/tiled-items.html`);
      await page.waitForFunction('document.activeElement');
    });

    it('should not skip items with far away corners', async () => {
      await page.evaluate(() => document.getElementById('item-48').focus());
      await page.keyboard.press('ArrowUp');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-41');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-48');
    });

    it('should go to the most central item when there are multiple below the exit edge', async () => {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-3');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-11');
    });
  });

  describe('Candidate overlap', () => {
    beforeEach(async () => {
      await page.goto(`${testPath}/tiled-items.html`);
      await page.waitForFunction('document.activeElement');
    });

    it('should consider items in the direction you want to move if they are fully in that direction with no overlap', async () => {
      await page.evaluate(() => document.getElementById('item-36').focus());
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-44');
    });

    it('should consider items in the direction you want to move if they overlap by up to 30%', async () => {
      await page.evaluate(() => document.getElementById('item-22').focus());
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-15');
    });

    it('should not consider items in the direction you want to move if they overlap by more than 30%', async () => {
      await page.evaluate(() => document.getElementById('item-29').focus());
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).not.toEqual('item-15');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-8');
    });

    it('should consider items with a customised overlap value', async () => {
      await page.evaluate(() => document.getElementById('item-44').setAttribute('data-lrud-overlap-threshold', 0.6));
      await page.evaluate(() => document.getElementById('item-29').focus());
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-44');

      await page.evaluate(() => document.getElementById('item-15').setAttribute('data-lrud-overlap-threshold', 0));
      await page.evaluate(() => document.getElementById('item-22').focus());
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-8');
    });
  });

  describe('Scope', () => {
    beforeEach(async () => {
      await page.goto(`${testPath}/2c-v-4f.html`);
      await page.waitForFunction('document.activeElement');
    });

    it('should not focus on elements outside of the provided scope', async () => {
      await page.evaluate(() => window.setScope(document.querySelector('section')));
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-2');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-2');
    });

    it('moves inside the scoped area if current focus is outside', async () => {
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-3');
      await page.evaluate(() => window.setScope(document.querySelector('section')));
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
    });

    it('should ignore an invalid scope', async () => {
      await page.evaluate(() => window.setScope(document.getElementById('doesnt-exist')));
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-3');
    });
  });

  describe('Prioritised Containers', () => {
    describe('Prioritised', () => {
      it('should select a candidate within the same container over a closer external candidate', async () => {
        await page.goto(`${testPath}/container-with-empty-space.html`);
        await page.evaluate(() => document.getElementById('item-4').focus());
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-5');
      });

      it('moves inside the scoped area if current focus is outside, and ignore prioritised siblings', async () => {
        await page.goto(`${testPath}/container-with-empty-space.html`);
        await page.evaluate(() => document.getElementById('item-1').focus());
        await page.evaluate(() => window.setScope(document.getElementById('section-3')));
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-7');
      });
    });

    describe('Non Prioritised', () => {
      beforeEach(async () => {
        await page.goto(`${testPath}/container-with-empty-space.html`);
        await page.waitForFunction('document.activeElement');
        await page.evaluate(() => document.getElementById('section-1').setAttribute('data-lrud-prioritise-children', false));
        await page.evaluate(() => document.getElementById('section-3').setAttribute('data-lrud-prioritise-children', false));
      });

      it('should select the closest candidate regardless of positions of sibling candidates', async () => {
        await page.evaluate(() => document.getElementById('item-4').focus());
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-7');
      });

      it('moves inside the scoped area if current focus is outside', async () => {
        await page.evaluate(() => document.getElementById('item-1').focus());
        await page.evaluate(() => window.setScope(document.getElementById('section-3')));
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-7');
      });
    });
  });

  describe('Focusable containers', () => {
    it('should move into a focusable container that is nearer than any other focusable candidates', async () => {
      await page.goto(`${testPath}/focusable-container-with-empty-space.html`);
      await page.waitForFunction('document.activeElement');
      await page.evaluate(() => document.getElementById('item-4').focus());
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-6');
    });

    it('should not move into a focusable container that has no focusable children', async () => {
      await page.goto(`${testPath}/focusable-container-with-empty-space.html`);
      await page.evaluate(() => document.getElementById('item-6').remove());
      await page.evaluate(() => document.getElementById('item-4').focus());
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-7');
    });

    it('should not set data-focus attributes to a container ID', async () => {
      await page.goto(`${testPath}/focusable-container-with-empty-space.html`);
      // makes section-2 the best candidate, although it will later be ignored
      await page.evaluate(() => document.getElementById('section-2').setAttribute('data-lrud-overlap-threshold', 1));
      await page.evaluate(() => document.getElementById('item-6').focus());
      await page.keyboard.press('ArrowLeft');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(await page.evaluate(() => document.getElementById('section-2').getAttribute('data-focus'))).toBe('item-6');
      expect(result).toEqual('item-6');
    });

    it('should remember the last active child of a focusable container', async () => {
      await page.goto(`${testPath}/nested-focusable-containers.html`);
      await page.waitForFunction('document.activeElement');
      await page.evaluate(() => document.getElementById('item-3').focus());
      await page.keyboard.press('ArrowRight');
      let result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-4');
      await page.evaluate(() => document.getElementById('item-9').focus());
      await page.keyboard.press('ArrowUp');
      result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-4');
      await page.evaluate(() => document.getElementById('item-5').focus());
      await page.keyboard.press('ArrowUp');
      result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-1');
      await page.keyboard.press('ArrowDown');
      result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-5');
    });

    it('should prioritise focusable containers that are the same distance away as a regular focusable', async () => {
      await page.goto(`${testPath}/nested-focusable-containers.html`);
      await page.waitForFunction('document.activeElement');
      await page.evaluate(() => document.getElementById('item-11').focus());
      await page.keyboard.press('ArrowDown');
      let result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-12');
      await page.evaluate(() => document.getElementById('item-9').focus());
      await page.keyboard.press('ArrowDown');
      result = await page.evaluate(() => document.activeElement.id);
      expect(result).toEqual('item-12');
    });
  });

  describe('Last active child', () => {
    beforeEach(async () => {
      await page.goto(`${testPath}/2c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
    });

    it('should return to the last active child when re-entering a container', async () => {
      await page.evaluate(() => document.getElementById('item-7').focus());
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-8');

      await page.keyboard.press('ArrowUp');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-7');
    });

    it('should focus the containers first child if the last active child no longer exists', async () => {
      await page.evaluate(() => document.getElementById('item-7').focus());
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-8');
      await page.evaluate(() => document.getElementById('item-7').remove());

      await page.keyboard.press('ArrowUp');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-1');
    });

    it('should still remember last active child if focus is manually moved from a container', async () => {
      await page.evaluate(() => document.getElementById('item-1').focus());
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-6');
      await page.evaluate(() => document.getElementById('item-8').focus());

      await page.keyboard.press('ArrowUp');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-6');
    });

    it('should only store the last active child ID if the child is not inside another container', async () => {
      await page.goto(`${testPath}/4c-v-5f-nested.html`);
      await page.evaluate(() => document.getElementById('item-1').focus());
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-2');
      expect(await getParentContainerDataFocus('item-1')).toEqual('item-1');
      expect(await getParentContainerDataFocus('item-2')).toEqual('item-2');
      await page.keyboard.press('ArrowDown');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-3');
      expect(await getParentContainerDataFocus('item-1')).toEqual('item-3');
      expect(await getParentContainerDataFocus('item-2')).toEqual('item-2');
      await page.keyboard.press('ArrowUp');
      expect(await getParentContainerDataFocus('item-1')).toEqual('item-3');
      expect(await getParentContainerDataFocus('item-2')).toEqual('item-2');
      await page.keyboard.press('ArrowUp');
      expect(await getParentContainerDataFocus('item-1')).toEqual('item-1');
      expect(await getParentContainerDataFocus('item-2')).toEqual('item-2');
    });

    it('does not update the new active child ID if the exit was blocked', async () => {
      await page.goto(`${testPath}/3c-h-6f-blocked-exit.html`);
      await page.evaluate(() => document.getElementById('item-2').focus());
      await page.keyboard.press('ArrowDown');
      expect(await getParentContainerDataFocus('item-2')).toEqual('item-2');
      expect(await page.evaluate(() => document.activeElement.id)).toEqual('item-2');
      expect(await getParentContainerDataFocus('item-3')).toEqual(null);
    });
  });
});
