# Learn Planvisiq

The Learn page is reachable from the homepage navigation, sign-in page, organisation footer, workspace sidebar and Quick guide. Main sections link directly into the selected workspace view.

## Video

- 1280 × 720, 24 fps; approximately 2 minutes 17 seconds.
- MP4 with H.264 video, AAC narration and fast-start metadata.
- Ten chapters cover organisation, projects, uploads, data review, charts/activities, reports, slides, assistant and exports/settings.
- English captions are rendered into the picture. A matching WebVTT track supports player caption controls.
- Perspective-projected solid panels, document stacks and bars use animated camera transforms, lighting and shadows. Screens and figures are illustrative, not recordings.
- Narration uses local FFmpeg/libflite speech synthesis (slt voice). Rendering requires no paid video or voice service and makes no network calls.
- No autoplay, tracking or external video embed. Native controls, playback speeds, chapter navigation, transcript and download fallback are available.

## Files and regeneration

`media/planvisiq-walkthrough.mp4` is the deliverable. The poster, English VTT captions and chapter timings live beside it. `scripts/walkthrough.json` holds the script; `scripts/render-walkthrough.py` renders the assets.

Requirements: Python 3, Pillow, NumPy, FFmpeg with libflite, and the included DejaVu Sans fonts. Run `python3 scripts/render-walkthrough.py`. Temporary audio and clip files are automatically removed. A contact sheet is written to the system temporary directory for review.

After changing narration, update the chapter `data-seek` values and displayed duration in `learn.html` from `media/walkthrough-chapters.json`. Update the transcript to match. The current assets and HTML are aligned.

## Product boundaries

The guide reflects the browser-local frontend. Registration, sign-in, permissions, invitations, licensing and payments are previews. The assistant uses local calculations and guided responses, not a live AI endpoint. Supporting document contents are not extracted. Specialist templates may remain labelled Template preview. Backups preserve project content but not organisation account profiles.

## Verification

All 33 existing frontend tests pass. The Learn player was checked in a DOM harness for chapter selection, time updates, playback speed, restart, seeking before metadata loads, rejected playback and video errors. All local links resolve. Chapter frames and text were visually inspected; the MP4 was decoded and inspected for codecs, timing and dimensions. Live browser playback and responsive visual QA were unavailable in this environment.
