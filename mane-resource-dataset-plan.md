# Resource dataset generation plan

Goal: generate final public-safe JSON for resource/search experience from existing internal datasets, then obfuscate/encrypt into frontend bundle same way current homepage search bundle is shipped.

## Output dataset shape

Keep only fields needed by resource/search UI:

```json
{
  "sequence": 71,
  "word": "good",
  "pronunciation_bn": "গুড",
  "bangla_meaning": "ভালো",
  "part_of_speech": "Adjective",
  "category": "Everyday Words & Actions",
  "example_en": "This is a good book.",
  "example_bn": "এটি একটি ভালো বই।"
}
```

## Source files

### 1. Base dictionary dataset

`D:\src\googleapidataset\data\production\most_frequent\dictionary_working_entries_most_frequent_pass2_enriched_prod.json`

Use these fields only:

- `frequency_rank` -> `sequence`
- `word` -> `word`
- `bangla_meaning` -> `bangla_meaning`
- `part_of_speech` -> `part_of_speech`
- `english_example` -> `example_en`
- `bangla_example` -> `example_bn`
- `pronunciation_ipa`
- `pronunciation_guide`

Confirmed entry count: **3966**

### 2. Planner category dataset

`D:\src\googleapidataset\data\app_exports\planner\vocab_planner_v2.json`

Use:

- top-level category `title`
- subcategory `entry_ids` mapping

Do not expose full planner structure in final public JSON.

## Field mapping

### Direct mappings

- `sequence = frequency_rank`
- `word = word`
- `bangla_meaning = bangla_meaning`
- `part_of_speech = part_of_speech`
- `example_en = english_example`
- `example_bn = bangla_example`

### Generated field

- `pronunciation_bn`

### Assigned field

- `category`

## Category generation

### Preferred approach

Use planner top-level category title.

Process:
1. build lookup map from planner subcategory `entry_ids`
2. for each dictionary word, match by normalized word/id key
3. assign parent category `title`
4. if multiple matches, prefer exact word match
5. if no match, mark as `Uncategorized` for review

### Notes

- use only top-level category for public JSON
- ignore planner subcategory in first pass
- broader categories are acceptable

## Bangla pronunciation generation

Goal: generate `pronunciation_bn` from pronunciation fields already present in dictionary dataset.

Available source fields:
- `pronunciation_ipa`
- `pronunciation_guide`

### Recommended pipeline

1. normalize IPA and pronunciation guide
2. attempt IPA -> Bangla transliteration using custom rules
3. fallback to pronunciation guide -> Bangla transliteration
4. apply normalization rules for consistent Bangla spelling style
5. keep exception override map for bad/common cases
6. review common words manually

### Important note

No trusted off-the-shelf Python library assumed for direct high-quality English pronunciation -> Bangla-script conversion.

Plan to use:
- custom Python rule-based converter
- exception dictionary
- manual spot review

### Example target outputs

- `/juː/` -> `ইউ`
- `/ˈveri/` -> `ভেরি`
- `/ˈbeɪbi/` -> `বেইবি`
- `/sɔːrt/` -> `সোর্ট`

## Suggested generation script steps

Create script outside website repo or in tooling repo.

### Step 1: load source datasets
- load dictionary entries
- load planner categories

### Step 2: build planner lookup
- flatten planner categories/subcategories
- map normalized `entry_id` -> top-level category title

### Step 3: transform dictionary entries
For each entry:
- `sequence = frequency_rank`
- `word = word`
- `bangla_meaning = bangla_meaning`
- `part_of_speech = part_of_speech`
- `example_en = english_example`
- `example_bn = bangla_example`
- `category = planner-derived top-level category`
- `pronunciation_bn = generated from ipa/guide`

### Step 4: sanitize values
- trim whitespace
- remove null-only examples if desired
- ensure integers for `sequence`
- normalize category strings
- title-case or preserve `part_of_speech` consistently

### Step 5: validate output
Checks:
- entry count matches source count unless intentionally filtered
- all entries have `sequence`
- all entries have `word`
- all entries have `bangla_meaning`
- all entries have `part_of_speech`
- all entries have `pronunciation_bn`
- category coverage report
- missing examples report

### Step 6: write final public JSON
Example target:

`resource_search_public_v1.json`

## Review checklist

Before shipping:
- confirm category labels are acceptable for public UI
- review top 200-500 frequent words for `pronunciation_bn`
- spot-check examples for display quality
- verify no internal-only fields remain
- verify no planner internals are exposed

## Website integration idea

Use dataset in resource-page search mode only.

Browse mode can remain separate if needed.

When search query exists:
- load/use expanded public-safe dataset
- show flat result cards

When no search query exists:
- show curated browse view

## Packaging / obfuscation

After final JSON is approved:
1. serialize minimal public JSON
2. obfuscate/encrypt into frontend bundle same style as current `mane-search.bundle.js`
3. decode client-side for search mode

## Important security note

Frontend obfuscation/encryption only hides data casually.
Anything shipped to browser is still ultimately accessible to determined users.
So final dataset must still be treated as public-safe.

## Deliverables later

- generation script
- pronunciation rule map
- exception override file
- category mapping report
- final public JSON
- obfuscated frontend bundle
