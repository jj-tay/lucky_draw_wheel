# Lucky Draw Wheel

A browser-based lucky draw wheel built with pure JavaScript and HTML5 Canvas. Staff members enter their ID to spin the wheel and win a prize — no duplicates allowed.

## Features

- Animated spin wheel with smooth easing
- Staff ID validation against an allowlist
- Prevents duplicate spins per session (persisted via `localStorage`)
- Configurable wheel sections and colors via JSON files
- No dependencies — runs entirely in the browser

## Files

| File | Description |
|------|-------------|
| `index.html` | Main page with the wheel UI |
| `wheel.js` | Wheel rendering and spin logic |
| `wheel-config.json` | Wheel section labels and colors |
| `staff-ids.json` | List of allowed staff IDs |

## Usage

Open `index.html` in a browser (served over HTTP/HTTPS — see note below).

1. Enter a staff ID in the input field
2. Click **Add Staff ID & Spin Wheel**
3. The wheel spins and displays the winning section

Staff IDs are case-insensitive. Each ID can only spin once per session.

> **Note:** The page fetches `staff-ids.json` and `wheel-config.json` via `fetch()`, so it must be served from a local or remote web server — opening the file directly (`file://`) will fail due to browser CORS restrictions.
>
> Quick local server options:
> ```bash
> # Python 3
> python3 -m http.server 8080
>
> # Node.js (npx)
> npx serve .
> ```
> Then visit `http://localhost:8080`.

## Configuration

### Wheel sections — `wheel-config.json`

```json
{
  "sections": ["Card Holder", "Card Holder", "Stickers", "Stickers"],
  "colors": ["#FCAA67", "#B0413E", "#4CAF50", "#2196F3"]
}
```

- `sections`: Array of prize labels. Repeat a label to increase its probability.
- `colors`: Array of hex colors cycled across sections. Use a color picker tool like [htmlcolorcodes.com](https://htmlcolorcodes.com/) to choose colors and copy the hex code (e.g. `#FF5722`).

### Allowed staff IDs — `staff-ids.json`

```json
{
  "allowedStaffIDs": ["ALICE", "BOB", "CHARLIE"]
}
```

Add or remove IDs as needed. Matching is case-insensitive.

## Resetting the Draw

Previously entered staff IDs are stored in the browser's `localStorage`. To reset and allow everyone to spin again, open the browser console and run:

```js
localStorage.removeItem('enteredStaffIDs');
```

## License

See [LICENSE](LICENSE).
