const puppeteer = require('puppeteer');
const server = require('./server');

const testPath = `${server.address}/test/layouts`;

describe('LRUD spatial', () => {
  let browser;
  let page;
  let context;

  beforeAll(async () => {
    await server.listen();
    browser = await puppeteer.launch({
      defaultViewport: {width: 1280, height: 800}
    });
    context = await browser.createIncognitoBrowserContext();
  });

  beforeEach(async () => {
    page = await context.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await context.close();
    await browser.close();
    await server.close();
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

  describe('Page with 4 candidates, where 1 is hidden and 1 has no dimensions', () => {
    /*
     * Elements that are `display: none` or `visibility: hidden` have their
     * width, height, and coordinates set to 0.
     *
     * These should not be considered focusable candidates.
     */
    it('should remain focused on candidate 1 when left is pressed', async () => {
      await page.goto(`${testPath}/0c-4f-hidden.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowLeft');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-1');
    });

    it('should remain focussed on candidate 2 when right, right is pressed', async () => {
      await page.goto(`${testPath}/0c-4f-hidden.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-2');
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

    it('should focus on candidate 12 when right, right, down, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-12');
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

    it('should focus on candidate 13 when right, right, right down, down is pressed', async () => {
      await page.goto(`${testPath}/0c-v-11f-size.html`);
      await page.waitForFunction('document.activeElement');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const result = await page.evaluate(() => document.activeElement.id);

      expect(result).toEqual('item-13');
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
      it('should select a candidate within the same container over an external candidate', async () => {
        await page.goto(`${testPath}/grid-with-one-item.html`);
        await page.waitForFunction('document.activeElement');
        await page.evaluate(() => document.getElementById('item-6').focus());
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-7');
      })
    })

    describe('Non Prioritised', () => {
      it('should select the closest candidate regardless of positions of sibling candidates', async () => {
        await page.goto(`${testPath}/grid-with-one-item-non-prioritised.html`);
        await page.waitForFunction('document.activeElement');
        await page.evaluate(() => document.getElementById('item-6').focus());
        await page.keyboard.press('ArrowDown');

        const result = await page.evaluate(() => document.activeElement.id);

        expect(result).toEqual('item-8');
      })
    })
  })
});
