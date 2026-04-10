# Demo videos

This folder is the local-only home for the demo video binaries. The files are
**not** tracked in git — they're too large and they belong to specific devs.

## What goes here

| Filename | Used by | Where it's referenced |
|----------|---------|-----------------------|
| `joeroganflagrant.mp4` | The seeded `demo` run on `/runs/demo/timeline`, `ClipBoundaryEditor` default, `RunGrounding` background, `RunRender` preview | `src/pages/RunTimeline.tsx`, `src/pages/RunGrounding.tsx`, `src/pages/RunRender.tsx`, `src/components/app/ClipBoundaryEditor.tsx`, `src/mocks/api.ts` |

## How to set this up on a fresh checkout

1. Get a copy of `joeroganflagrant.mp4` (ask a teammate, or download from
   wherever the team is hosting demo assets).
2. Drop it in this folder with that exact filename.
3. Start the dev server — `/runs/demo/timeline` should now play the video.

If the video preview is **black**, you almost certainly forgot this step. The
HTML5 `<video>` element silently shows a black frame when the source is
missing or unreadable.

## Why this is gitignored

`.mp4` files are large (the joe rogan demo is ~125 MB). Putting them in git
would balloon the repo permanently — every clone, every CI run, every
checkout would have to pull them. The gitignore rule lives in the repo root
`.gitignore`:

```
public/videos/*.mp4
!public/videos/.gitkeep
```

The `.gitkeep` exception is there so the empty folder still exists on a
fresh clone — otherwise git wouldn't track the directory at all.

## Historical note

Earlier in the project, `joeroganflagrant.mp4` was committed as a **git
symlink** (mode `120000`) pointing at the absolute macOS path
`/Users/rithvik/Clypt-V3/videos/joeroganflagrant.mp4`. That worked fine on
the author's Mac (the symlink resolved to a real file on his local disk)
but on Windows — where symlinks require admin privileges — git just
materialized the symlink target as a 51-byte text blob, which the dev
server happily served to `<video>` and the player rendered as a black frame.

Two lessons:
1. Don't commit a symlink to a file outside the repo as a substitute for
   shipping the file. Use this gitignored folder instead.
2. If you ever see a tiny "video" that plays as a black frame, run
   `git ls-files -s public/videos/` — mode `120000` means it's a symlink
   that probably broke on a non-Mac machine.
