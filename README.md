# m_and_e_react_native
Morning and Evening Devotional React Native App

> This project is being converted from the Vue 3 PWA below into a React Native app.

# Morning and Evening App
This is a SPA that displays the daily readings from Charles Spurgeon's Morning and Evening.

### Todo
- Project cleanup

### App
Built using Vue3 and Vite alongside TailwindCSS.

### iPhone Homescreen Testing (HTTPS)
Use a tunnel URL so Safari/Home Screen can open the app under HTTPS-only settings.

1. Run `npm run watch:tunnel`
2. Wait for localhost.run to print a public `https://...lhr.life` URL
3. Open `<tunnel-url>/m_and_e/` on iPhone Safari
4. Add to Home Screen from that page

If you see `503 tunnel unavailable`:
- Stop all running dev/tunnel terminals
- Start `npm run watch:tunnel` again and use the new URL
- Do not reuse older tunnel URLs from previous runs

If you see `400` after entering tunnel password:
- localhost.run does not use the localtunnel password page
- Make sure you open `<tunnel-url>/m_and_e/` (include `/m_and_e/`)
- Keep `npm run watch:tunnel` running while testing
