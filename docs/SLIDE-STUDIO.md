# Presentation studio

Planvisiq 0.4 adds a dedicated Slides workspace using plain HTML, CSS and JavaScript. It works with the same local project records as the reports and does not require a server or API key.

## Use it

1. Open **Slides**, then choose **Create my project deck**, **Close-out review** or **Start your own**.
2. Select a thumbnail and edit its content fields. Layout, spacing and text sizing are automatic.
3. Add slides from the eight layouts. Duplicate, remove, drag to reorder or use the move buttons below the thumbnails. Undo restores deleted slides.
4. Choose a theme and add optional photos or speaker notes.
5. Choose **Present** to display the slides. Arrow keys, Page Up/Down, Home and End navigate; Escape exits. Fullscreen is available where the browser supports it.
6. Download **PowerPoint** or choose **Download PDF** from the adjacent menu.

Edits save automatically to this browser. The save indicator reports failure if storage is unavailable. Export a workspace backup from Settings to transfer editable decks and project records to another browser. Downloads are useful presentation copies; workspace backups retain the app's complete editing model.

## Data behaviour

- Generated decks use the project's reporting cut-off and the existing calculation engine. Progress excludes missing measurements. Recorded completion is not client acceptance.
- Decks are snapshots. Later source imports do not overwrite a presentation. **Create updated copy** prepares a new deck with current records while preserving existing edits.
- Figure changes in Slides affect that slide only. The source note identifies manually edited figures. They do not change the underlying schedule.
- Project updates show up to 30 disciplines and 18 overdue activities, with visible notices when more records exist. Reports and Activities retain the complete data.
- Sources appear in the deck and the PowerPoint notes. Basic data-quality issues appear when found. Sample projects remain visibly marked as fictional.
- Close-out decks describe the available punch-list, acceptance and lessons records. Their presence does not certify sign-off.

## Editing and export

The studio offers eight prepared layouts: title, section divider, key figures, chart, talking points, two columns, table and photo. There are three coordinated themes. These layouts keep routine presentations consistent without a free-form design canvas.

PowerPoint contains editable text, native tables and native charts for complete numerical series. A chart with missing figures uses editable text and shapes so blanks are clearly labelled instead of becoming zero. PowerPoint includes speaker notes and sources; PDF contains slide pages only. Native charts can render slightly differently across presentation applications while retaining the same labels and figures. Existing `.pptx` file import, animations and collaborative editing are not part of this frontend.

Limits: 30 decks per project, 60 slides per deck, four key figures, six talking points, six chart categories and six table rows by four columns per slide. PNG/JPEG photos may be up to 2 MB each and roughly 10 MB combined per deck. Photo proportions are preserved. Long text is fitted automatically; content that still cannot fit is flagged before export. Use another slide for longer material.

Undo/redo is kept during the current editing session, with a bounded memory history. In the editor, Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z work when a text field is not focused; text fields retain normal browser editing shortcuts. Reordering also has accessible move buttons.

## Source design

- `js/slides-model.js`: normalized deck records, snapshot recipes, layout geometry and escaped SVG previews.
- `js/slide-studio.js`: gallery, editor, autosave, bounded history, photo validation, reorder controls and presenting.
- `js/slides-export.js`: bundled PptxGenJS and pdf-lib export adapters, embedded PDF fonts and fit validation.
- `slides.css`: responsive editor, thumbnail rail, content panel, gallery and presentation view.

Decks live in `project.presentations` in the existing IndexedDB workspace. Backup restore normalizes presentation records and assigns each restored project a new identity. This remains local storage, not tenant security or shared cloud persistence.

## Verification

Automated checks cover source reconciliation, missing values, snapshot isolation, safe restored content, deck creation, content edits, chart/table controls, saving, undo/redo, presenting and updated copies. Real PPTX and PDF files were generated for all eight layouts. The PPTX was opened through LibreOffice conversion, its native charts/tables and speaker notes were checked, and the rendered slides were inspected. Browser visual QA and opening in Microsoft PowerPoint were unavailable in the authoring environment.
