# Rollcall

Rename 400 files at once. See every name before it happens.

## Why this exists

Anyone who shoots photos, records video, or scans paper ends up with a folder full of `IMG_4471.JPG` and no way to tell one from another. Renaming them by hand is an evening. Renaming them with a script is a different evening, plus the risk that you typed the regex wrong and now four hundred files are named `undefined-1`.

The existing tools are Windows-only, or from 2009, or paid, or all three. Most of them rename first and let you find out afterwards.

Rollcall shows you the finished names before it touches anything, and keeps an undo log so a bad batch is one click away from being un-done.

## What it does

- Build a name from parts: original name, regex capture, EXIF shot date, camera model, sequence counter, fixed text
- Live before/after table — every name updates as you type the rule
- Collision detection, flagged before the rename runs, not after
- Case changes, find and replace, prefix and suffix, extension changes
- Undo log per batch — one click reverts the whole run
- Handles the awkward cases: case-insensitive filesystems, Windows reserved names, files locked mid-batch

## What it avoids

| Doing it by hand or by script | Rollcall |
|---|---|
| You find out the rule was wrong after the rename | You read every resulting name first |
| Two files collapse onto one name and one is lost | Collisions are caught and shown before anything runs |
| No way back | Every batch writes an undo log |
| Dates come from the file, which is wrong after a copy | Dates come from EXIF, which is when the shutter fired |
| Subscription, or Windows-only, or abandoned | Free, offline, cross-platform |

## How to use

> Pre-release. There is no installer to download yet. This is the intended flow.

1. Drag a folder or a selection of files onto the window.
2. Add rule steps — a regex capture, a date from EXIF, a counter — and stack them in order.
3. Read the before/after table. Anything that would collide is marked in red.
4. Press Rename. If it went wrong, press Undo.

Nothing is written until you press Rename, and nothing is deleted, ever.

## Tech stack

**Shell**
- [Tauri v2](https://tauri.app) — desktop shell, IPC bridge, installer bundler. The OS webview means a small binary and no Electron.
- Frontend is Vite + TypeScript, no framework. The preview table is the whole interface, and it is fast because the names are computed in Rust, not in JavaScript.

**Backend**
- [Rust](https://www.rust-lang.org) — rule evaluation, EXIF reads, and the rename itself.
- [`regex`](https://docs.rs/regex) — capture groups for the pattern steps. Rust's regex engine has no backtracking, so a pasted pattern cannot hang the preview no matter how badly it is written.
- [`kamadak-exif`](https://docs.rs/kamadak-exif) — reads shot date, camera make and model, lens, and orientation straight out of the file.
- [`walkdir`](https://docs.rs/walkdir) — directory traversal when a folder is dropped instead of a selection.
- [`unicode-normalization`](https://docs.rs/unicode-normalization) — macOS stores filenames decomposed (NFD) and Linux does not, which is why a file called `café` compares unequal to itself across platforms unless you normalize.
- `serde` / `serde_json` — the undo log is a plain JSON file recording every old-path-to-new-path pair in the batch, written before the first rename, so an interrupted run is still fully reversible.

**How a rename actually runs**

The rule is a list of steps, evaluated in order per file, entirely in Rust. Every keystroke re-evaluates the whole set and returns the finished names to the table — which is why the preview is honest rather than approximate: it is the same code that will do the rename.

Renaming happens in two passes. The first pass moves every file to a unique temporary name, the second moves each to its final name. This is what makes swaps and rotations possible — renaming `a` to `b` and `b` to `a` in a single pass would destroy one of them. Collisions, reserved names (`CON`, `PRN`, `NUL` on Windows), and permission failures are detected before the first pass begins.

**Distribution**
- `tauri build` produces a signed `.dmg`, `.msi`, and `.AppImage`.
- macOS builds are notarized.
- Homebrew tap for `brew install --cask rollcall`.

## License

MIT.
