# Video assets

App-facing video should live in Vercel Blob, not in this folder.

The root demo workspace video, `joeroganflagrant.mp4`, is hosted in the public
Clypt Blob store and referenced by `ROOT_DEMO_VIDEO_URL` in
`src/lib/demo-media.ts`. It powers the seeded `demo` run, `RunGrounding`, the
`ClipBoundaryEditor` placeholder source, and the mock render output URL.

## What belongs here

This directory is kept only so old local workflows and temporary scratch copies
have an obvious place to land. Large media files here are ignored by Git:

```gitignore
public/videos/*.mp4
public/videos/**/*.mp4
!public/videos/.gitkeep
```

Do not commit MP4s or symlinks from this folder. If a production/demo video
changes, upload the replacement to Vercel Blob and update
`src/lib/demo-media.ts` or the landing media manifest.

README/docs images remain tracked in Git because GitHub renders them directly.
App-facing landing media is also Blob-hosted and referenced from
`src/components/landing/landingMedia.ts`.

## Historical note

Earlier in the project, `joeroganflagrant.mp4` was committed as a git symlink
(mode `120000`) pointing at an absolute macOS path outside the repo. That worked
on one local machine and failed elsewhere. The current rule is simpler:
production-visible media goes to Blob; local video files stay ignored.
