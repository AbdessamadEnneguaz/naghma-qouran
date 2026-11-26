import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRouteFromLocation, routeToPath} from './routing';

test('routeToPath maps every dedicated page to clean URL paths', () => {
  assert.equal(routeToPath('intro'), '/intro');
  assert.equal(routeToPath('home'), '/');
  assert.equal(routeToPath('mushaf'), '/mushaf');
  assert.equal(routeToPath('surahs'), '/surahs');
  assert.equal(routeToPath('qibla'), '/qibla');
  assert.equal(routeToPath('adhkar'), '/adhkar');
  assert.equal(routeToPath('khatma'), '/khatma');
  assert.equal(routeToPath('download'), '/download');
  assert.equal(routeToPath('vault'), '/vault');
  assert.equal(routeToPath('privacy'), '/privacy');
});

test('parseRouteFromLocation resolves pathnames, trailing slashes, and hash fallbacks', () => {
  assert.equal(parseRouteFromLocation('/'), 'home');
  assert.equal(parseRouteFromLocation('/intro'), 'intro');
  assert.equal(parseRouteFromLocation('/welcome/'), 'intro');
  assert.equal(parseRouteFromLocation('/about'), 'intro');
  assert.equal(parseRouteFromLocation('/mushaf/'), 'mushaf');
  assert.equal(parseRouteFromLocation('/quran'), 'mushaf');
  assert.equal(parseRouteFromLocation('/surahs'), 'surahs');
  assert.equal(parseRouteFromLocation('/qibla'), 'qibla');
  assert.equal(parseRouteFromLocation('/adhkar'), 'adhkar');
  assert.equal(parseRouteFromLocation('/khatma'), 'khatma');
  assert.equal(parseRouteFromLocation('/download'), 'download');
  assert.equal(parseRouteFromLocation('/vault'), 'vault');
  assert.equal(parseRouteFromLocation('/privacy'), 'privacy');
  assert.equal(parseRouteFromLocation('/privacy-policy'), 'privacy');
  assert.equal(parseRouteFromLocation('/reader'), 'mushaf');
  assert.equal(parseRouteFromLocation('/unknown-path'), 'home');
  assert.equal(parseRouteFromLocation('/index.html', '#/download'), 'download');
  assert.equal(parseRouteFromLocation('/', '#/qibla'), 'qibla');
  assert.equal(parseRouteFromLocation('/', '#/privacy'), 'privacy');
  assert.equal(parseRouteFromLocation('/', '#/intro'), 'intro');
});
