# Asset provenance

Everything under `public/media/` was extracted from the team's own files in
`Assets/`. No image was invented, repainted, or sourced from outside the
project. The original PDFs are untouched.

## Source files

| Source | What it is | How it was read |
| --- | --- | --- |
| `Assets/برزينتشن-انا-بالعربي-فريق-3-2.pptx.pdf` | The team's original slide deck, 14 pages | Rendered to images; embedded artwork extracted with `pdfimages` |
| `Assets/هانداوت-أنا-بالعربي-فريق_٣.docx.pdf` | The written handout, 4 pages | Text layer extracted for the content in `data/presentation.ts` |

Every slide in the deck is a flattened page image, so the artwork could only be
recovered as pixels — it is used as-is, cropped by the layout rather than
edited.

## Artworks in use

| File | Taken from | Used on |
| --- | --- | --- |
| `artworks/ways-to-protect-arabic.jpg` | `img-003-003` — verse artwork, ways to protect Arabic | Stage 02, Technology |
| `artworks/tarikh-al-arabiyya-fi-al-dad.jpg` | `img-005-006` — history-of-Arabic poem panel | Stage 04, History |
| `artworks/calligraphy-portrait.jpg` | `img-002-002` — Arabic calligraphy portrait | Stage 01, Identity |
| `artworks/ways-to-protect-arabic-alt.jpg` | `img-003-004` — companion verse artwork | Held in reserve |

## Reference images

`reference/` keeps flattened captures of the team's own slides. They are not
presented as content; `original-slide-01-cover.jpg` is used as a soft
parchment ground behind the new cover, and the other two are kept for visual
reference only.

## Evidence pairs

`Assets/social-media-screenshots/` holds 18 files (`img-006-007` through
`img-014-024`): screenshots of the team's own Facebook posts, profiles, and
chats. They say nothing about Arabic as a language, so they are not presented
as content. They are, however, direct evidence of the work that happened
*before* the slides, which is what the "ما وراء العرض" stage is about.

Nine before/after pairs are used there, copied byte-for-byte into
`public/media/evidence/` (the originals stay untouched):

| Case | Before | After | Note |
| --- | --- | --- | --- |
| ٠١ | `img-006-007` | `img-006-008` | |
| ٠٢ | `img-007-009` | `img-007-010` | |
| ٠٣ | `img-008-012` | `img-008-011` | numbered out of order in the source folder |
| ٠٤ | `img-009-013` | `img-009-014` | |
| ٠٥ | `img-010-015` | `img-010-016` | |
| ٠٦ | `img-011-017` | `img-011-018` | |
| ٠٧ | `img-012-019` | `img-012-020` | |
| ٠٨ | `img-013-021` | `img-013-022` | |
| ٠٩ | `img-014-023` | `img-014-024` | |

Each pair is shown one at a time, labelled only by number.

### What these images deliberately do not say

The profiles carry real names, and several of the chats are private. The deck
therefore does not transcribe, name, or count the people in them:

- The stage states the task (at least two people; English name changed to
  Arabic) and the deadline, both of which are visible in the screenshots.
- It shows nine cases. It does not claim nine people, a completion count, or
  any other tally — the images are a sample, not a census.
- Latin text in the profiles is legible; the Arabic is not reliably machine
  readable in this environment, so no Arabic profile name is transcribed and
  no case is attributed to a named person.

Attributing these to individuals is a human call. Add it only after someone has
read the images.
