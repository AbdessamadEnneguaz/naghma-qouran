import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVE_VERSE_ATTR,
  ACTIVE_VERSE_CLASS,
  VERSE_KEY_ATTR,
  shouldAutoScrollToVerse,
  syncActiveVerseDomHighlight,
} from './verseHighlightDom';

test('shouldAutoScrollToVerse pauses auto-scroll during manual scroll cooldown', () => {
  assert.equal(shouldAutoScrollToVerse(0, 10000), true);
  assert.equal(shouldAutoScrollToVerse(9000, 10500, 4000), false);
  assert.equal(shouldAutoScrollToVerse(6000, 10000, 4000), true);
});

test('syncActiveVerseDomHighlight toggles [data-verse-key] attributes without touching sibling verses', () => {
  class MockEl {
    attrs = new Map<string, string>();
    classList = {
      set: new Set<string>(),
      add: (c: string) => this.classList.set.add(c),
      remove: (c: string) => this.classList.set.delete(c),
    };
    constructor(key: string) {
      this.attrs.set(VERSE_KEY_ATTR, key);
    }
    getAttribute(name: string) {
      return this.attrs.get(name) ?? null;
    }
    setAttribute(name: string, val: string) {
      this.attrs.set(name, val);
    }
    removeAttribute(name: string) {
      this.attrs.delete(name);
    }
  }

  const el1 = new MockEl('2:1');
  const el2 = new MockEl('2:2');
  const els = [el1, el2];

  const mockRoot = {
    querySelectorAll: (sel: string) =>
      els.filter((e) => sel.includes(ACTIVE_VERSE_ATTR) && e.getAttribute(ACTIVE_VERSE_ATTR) === 'true'),
    querySelector: (sel: string) =>
      els.find((e) => sel.includes(`"${e.getAttribute(VERSE_KEY_ATTR)}"`)) ?? null,
  } as unknown as ParentNode;

  syncActiveVerseDomHighlight(2, 1, true, mockRoot);
  assert.equal(el1.getAttribute(ACTIVE_VERSE_ATTR), 'true');
  assert.equal(el1.classList.set.has(ACTIVE_VERSE_CLASS), true);
  assert.equal(el2.getAttribute(ACTIVE_VERSE_ATTR), null);

  syncActiveVerseDomHighlight(2, 2, true, mockRoot);
  assert.equal(el1.getAttribute(ACTIVE_VERSE_ATTR), null);
  assert.equal(el1.classList.set.has(ACTIVE_VERSE_CLASS), false);
  assert.equal(el2.getAttribute(ACTIVE_VERSE_ATTR), 'true');
  assert.equal(el2.classList.set.has(ACTIVE_VERSE_CLASS), true);

  syncActiveVerseDomHighlight(2, 2, false, mockRoot);
  assert.equal(el2.getAttribute(ACTIVE_VERSE_ATTR), null);
});
