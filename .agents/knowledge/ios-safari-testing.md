# iOS Safari testing

Needs Xcode (Adam's Mac has it, with iPhone 17 / iPad Pro simulators). Drive them with `xcrun simctl boot <id>`, `xcrun simctl openurl <id> http://127.0.0.1:5180/...` (serve with `vite preview --host 127.0.0.1`), `xcrun simctl io <id> screenshot`. WebContent crash reports land in ~/Library/Logs/DiagnosticReports (com.apple.WebKit.WebContent-*.ips); a page that keeps crashing shows "A problem repeatedly occurred". Load about:blank between tests and retry: the simulator crashes ~40% of loads even on react.dev, so count repeated failures, not one. Playwright's WebKit does NOT composite CSS 3D (renders flat), so it's useless for checking the rooms; use the simulator.

What Safari got wrong (fixed Nov 2026, see [room-walkaround-rendering.md](room-walkaround-rendering.md)):
- too many 3D surfaces in a phone's small room crashed WebContent in the biggest room: keep tiles ≥360px (GEO.tileMin) and panels ≥300px (GEO.panelMin).
- createPattern throws on an image not yet decoded: decode first.
- Safari orders 3D planes roughly by their centres (no proper splitting): planes straddling or behind the pillar drew over its front. Fixes: plain pillar sides, back hidden at the door, floor/ceiling tiles cut at the pillar faces, things wholly behind the pillar marked data-unseen at the door.

**Why:** Adam saw the site broken on his iPhone (Chrome on iOS is WebKit too) while desktop Chrome looked fine.

**How to apply:** after any change to the room's surfaces, run the simulator sweep on every room doorway, especially Nature (biggest) and Benches/Cars (bright floor sheen shows sort errors).
