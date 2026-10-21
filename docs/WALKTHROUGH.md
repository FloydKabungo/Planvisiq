# Learn Planvisiq

The Learn page is reachable from the homepage navigation, sign-in page, organisation footer, workspace sidebar and Quick guide. Main sections link directly into the selected workspace view.

## Video

- 1920 × 1080, 24 fps; approximately 3 minutes 16 seconds.
- MP4 with H.264 video (CRF 20), 192 kbps AAC narration and fast-start metadata.
- Ten chapters cover organisation, projects, uploads, data review, charts/activities, reports, slides, assistant and exports/settings.
- English captions are rendered into the picture. A matching WebVTT track supports player caption controls.
- Large app illustrations demonstrate uploads, review, animated charts, reports, slides and exports. Perspective entrances, shadows and cursor highlights guide attention. Screens and figures are illustrative, not recordings.
- Narration uses the saved Runway Miriam clips generated with `eleven_multilingual_v2`. Original chapter MP3 files live in `media/narration/`. The renderer adds brief silence between chapters and encodes the soundtrack, without additional tempo adjustment or loudness normalisation. Rebuilding makes no API calls and uses no additional voice credits.
- No autoplay, tracking or external video embed. Native controls, playback speeds, chapter navigation, transcript and download fallback are available.

## Files and regeneration

`media/planvisiq-walkthrough.mp4` is the deliverable. The poster, English VTT captions and chapter timings live beside it. `scripts/walkthrough.json` holds the script; `scripts/render-walkthrough.py` renders the assets using `scripts/walkthrough_visuals.py`.

Requirements: Python 3, Pillow, NumPy, FFmpeg, the included DejaVu Sans fonts and saved narration MP3s. Run `python3 scripts/render-walkthrough.py`, then `python3 scripts/sync-walkthrough-page.py`. Temporary audio and clip files are automatically removed. A contact sheet is written to the system temporary directory for review.

After changing narration, rerender and run the page synchronisation script to update chapter links, duration and transcript. The current assets and HTML are aligned.

## Product boundaries

The guide reflects the browser-local frontend. Registration, sign-in, permissions, invitations, licensing and payments are previews. The assistant uses local calculations and guided responses, not a live AI endpoint. Supporting document contents are not extracted. Specialist templates may remain labelled Template preview. Backups preserve project content but not organisation account profiles.

## Verification

All 33 existing frontend tests passed before this media-only revision. The Learn player was checked in a DOM harness for chapter selection, time updates, playback speed, restart, seeking before metadata loads, rejected playback and video errors. Live hosted playback and chapter seeking were verified on the previous release; this exposed a hosting seek issue, fixed by buffering the video locally on first play. The player retains that fix. Media inspection and live verification results for the new export are recorded below.

The 1080p revision was visually inspected across all ten chapters. Its 195.56-second H.264/AAC MP4 decodes without errors; chapter links and displayed duration match the generated timings.
