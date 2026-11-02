# Headless Chrome 3D screenshots

Use the GPU and real time. Static shot: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --hide-scrollbars --window-size=1440,987 --virtual-time-budget=6000 --screenshot=out.png URL` (never `--disable-gpu`). For motion (fly-in, scrolling, walk-up), drive Chrome over the DevTools protocol from Node: launch with `--remote-debugging-port`, connect to the page's websocket (Node's global WebSocket), then `Page.navigate`, `Input.dispatchMouseEvent` (mousePressed/Released for clicks, mouseWheel for scroll), `Input.dispatchKeyEvent`, `Runtime.evaluate` to click a `button.frame[data-photo]`, and `Page.captureScreenshot` at chosen delays. Set `Emulation.setDeviceMetricsOverride` to 1440x900.

**Why:** Software rendering drops large 3D planes that cross the camera plane and looks like missing walls and floors; the GPU renders them. Virtual-time screenshots finish animations instantly, so only a real-time CDP session shows mid-motion frames and raster latency. Headless lays out at window height minus 87px and clamps width to 500px, so phone widths cannot be tested this way.

**How to apply:** For visual checks of the room, use GPU screenshots; for anything about motion or flicker, use the CDP driver. Keep big surfaces tiled (see [room-walkaround-rendering.md](room-walkaround-rendering.md)).
