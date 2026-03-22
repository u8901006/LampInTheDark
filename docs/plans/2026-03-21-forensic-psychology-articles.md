# Forensic Psychology Articles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate one detailed zh-TW Markdown public-education article for each formal chapter in the forensic psychology EPUB and place the results in `D:\Forensic\forensic-psychology-articles\`.

**Architecture:** Extract the EPUB TOC and XHTML chapter files with a lightweight Python parser, then use the extracted chapter text as source material for article writing. Produce the Markdown outputs in batches, add an index file, and verify the file set and chapter mapping at the end.

**Tech Stack:** Python 3 standard library, Markdown with YAML frontmatter, OpenCode subagents for batch writing

---

### Task 1: Extract chapter inventory and source text

**Files:**
- Create: `D:\Forensic\forensic-psychology-articles\_source\chapters.json`
- Modify: `docs/plans/2026-03-21-forensic-psychology-articles-design.md`

**Step 1: Write the extraction command**

```bash
python scripts/extract_epub_chapters.py
```

**Step 2: Run extraction to verify chapter count**

Run: `python scripts/extract_epub_chapters.py`
Expected: `13` formal chapters exported into `D:\Forensic\forensic-psychology-articles\_source\chapters.json`

**Step 3: Keep minimal implementation**

Use Python standard library only:

```python
import json
import zipfile
from html.parser import HTMLParser
from pathlib import Path
```

**Step 4: Verify exported structure**

Run: `python -c "import json, pathlib; data=json.loads(pathlib.Path(r'D:\Forensic\forensic-psychology-articles\_source\chapters.json').read_text(encoding='utf-8')); print(len(data['chapters']))"`
Expected: `13`

### Task 2: Create output directory and index scaffold

**Files:**
- Create: `D:\Forensic\forensic-psychology-articles\index.md`
- Create: `D:\Forensic\forensic-psychology-articles\_source\README.md`

**Step 1: Create directory structure**

```bash
mkdir D:\Forensic\forensic-psychology-articles
mkdir D:\Forensic\forensic-psychology-articles\_source
```

**Step 2: Write index scaffold**

Include project description, source-book note, and placeholders for 13 chapter article links.

**Step 3: Verify files exist**

Run: `python -c "from pathlib import Path; print(Path(r'D:\Forensic\forensic-psychology-articles\index.md').exists())"`
Expected: `True`

### Task 3: Generate articles for chapters 1-5

**Files:**
- Create: `D:\Forensic\forensic-psychology-articles\01-introduction-to-forensic-psychology.md`
- Create: `D:\Forensic\forensic-psychology-articles\02-police-and-public-safety-psychology.md`
- Create: `D:\Forensic\forensic-psychology-articles\03-psychology-of-investigations.md`
- Create: `D:\Forensic\forensic-psychology-articles\04-consulting-and-testifying.md`
- Create: `D:\Forensic\forensic-psychology-articles\05-consulting-with-criminal-courts.md`

**Step 1: Read extracted source entries for chapters 1-5**

```bash
python -c "import json, pathlib; data=json.loads(pathlib.Path(r'D:\Forensic\forensic-psychology-articles\_source\chapters.json').read_text(encoding='utf-8')); print([c['title'] for c in data['chapters'][:5]])"
```

**Step 2: Write detailed zh-TW Markdown articles**

Each file must include:

```md
---
title: ...
description: ...
keywords:
  - ...
source_book: Introduction to Forensic Psychology: Research and Application
source_chapter: Chapter ...
language: zh-TW
audience: general-public
last_updated: 2026-03-21
---
```

**Step 3: Verify file count for this batch**

Run: `python -c "from pathlib import Path; print(len(list(Path(r'D:\Forensic\forensic-psychology-articles').glob('[0][1-5]-*.md'))))"`
Expected: `5`

### Task 4: Generate articles for chapters 6-10

**Files:**
- Create: `D:\Forensic\forensic-psychology-articles\06-family-law-and-other-forms-of-civil-litigation.md`
- Create: `D:\Forensic\forensic-psychology-articles\07-development-of-delinquent-and-criminal-behavior.md`
- Create: `D:\Forensic\forensic-psychology-articles\08-psychology-of-violence-and-intimidation.md`
- Create: `D:\Forensic\forensic-psychology-articles\09-psychology-of-sexual-violence.md`
- Create: `D:\Forensic\forensic-psychology-articles\10-forensic-psychology-and-victims-of-crime.md`

**Step 1: Read extracted source entries for chapters 6-10**

```bash
python -c "import json, pathlib; data=json.loads(pathlib.Path(r'D:\Forensic\forensic-psychology-articles\_source\chapters.json').read_text(encoding='utf-8')); print([c['title'] for c in data['chapters'][5:10]])"
```

**Step 2: Write detailed zh-TW Markdown articles**

Keep chapter-to-file mapping explicit and use conservative wording for legal / violence topics.

**Step 3: Verify file count for this batch**

Run: `python -c "from pathlib import Path; print(len(list(Path(r'D:\Forensic\forensic-psychology-articles').glob('0[6-9]-*.md'))) + len(list(Path(r'D:\Forensic\forensic-psychology-articles').glob('10-*.md'))))"`
Expected: `5`

### Task 5: Generate articles for chapters 11-13 and finalize index

**Files:**
- Create: `D:\Forensic\forensic-psychology-articles\11-family-violence-and-child-victimization.md`
- Create: `D:\Forensic\forensic-psychology-articles\12-correctional-psychology-in-adult-settings.md`
- Create: `D:\Forensic\forensic-psychology-articles\13-juvenile-justice-and-corrections.md`
- Modify: `D:\Forensic\forensic-psychology-articles\index.md`

**Step 1: Read extracted source entries for chapters 11-13**

```bash
python -c "import json, pathlib; data=json.loads(pathlib.Path(r'D:\Forensic\forensic-psychology-articles\_source\chapters.json').read_text(encoding='utf-8')); print([c['title'] for c in data['chapters'][10:]])"
```

**Step 2: Write final batch and replace placeholders in index**

Add one bullet link and one-line summary for each article.

**Step 3: Verify complete file set**

Run: `python -c "from pathlib import Path; files=sorted(p.name for p in Path(r'D:\Forensic\forensic-psychology-articles').glob('*.md')); print(len(files)); print(files[0]); print(files[-1])"`
Expected: `14`, first `01-...`, last `index.md` or `13-...` depending on sort order

### Task 6: Final verification

**Files:**
- Modify: `D:\Forensic\forensic-psychology-articles\index.md`

**Step 1: Verify source inventory and output inventory match**

```bash
python -c "import json; from pathlib import Path; data=json.loads(Path(r'D:\Forensic\forensic-psychology-articles\_source\chapters.json').read_text(encoding='utf-8')); article_files=sorted(p for p in Path(r'D:\Forensic\forensic-psychology-articles').glob('[0-9][0-9]-*.md')); print(len(data['chapters']), len(article_files))"
```

**Step 2: Spot-check frontmatter presence in all articles**

Run: `python -c "from pathlib import Path; bad=[]; 
for p in Path(r'D:\Forensic\forensic-psychology-articles').glob('[0-9][0-9]-*.md'):
    text=p.read_text(encoding='utf-8');
    if not text.startswith('---\n'): bad.append(p.name)
print(bad)"`
Expected: `[]`

**Step 3: Record completion status**

Report:

```text
Processed: 13/13 files
Updated: 13 articles + index.md
Needs verification: any explicitly marked items
Cross-links/index: updated
```
