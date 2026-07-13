// Sound engine — stubbed no-op for Phase 2 (frontend MVP). The Truck
// Manager sibling app uses react-native-sound + bundled res/raw assets;
// Airlines Empire doesn't have those assets yet, so every call here is a
// safe no-op rather than pulling in a native dependency with nothing to
// play. Swap this file for a real implementation once SFX/music assets
// exist — every call site (components.js: play('tap', 0.5) etc.) already
// matches react-native-sound's shape, so no call sites need to change.
export function initSound() {}
export function setSoundEnabled() {}
export function setMusicEnabled() {}
export function setMusicVolume() {}
export function setSfxVolume() {}
export function play() {}
export function startMusic() {}
export function stopMusic() {}
