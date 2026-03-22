# Forensic Psychology Chapter Articles Design

**Goal:** Convert the EPUB `D:\Forensic\Introduction to forensic psychology _ research and.epub` into a detailed zh-TW public-education article set with one Markdown article per formal chapter.

## Scope

- Include the 13 formal chapters only.
- Exclude front matter, glossary, references, indexes, and advertisements as standalone articles.
- Write each output as a standalone zh-TW Markdown file in `D:\Forensic\forensic-psychology-articles\`.
- Add `index.md` to list and link all generated articles.

## Output Structure

Each article should contain:

- YAML frontmatter with `title`, `description`, `keywords`, `source_book`, `source_chapter`, `language`, `audience`, and `last_updated`
- Intro summary
- Key takeaways
- Core concepts rewritten for a general audience
- Practical implications and example situations
- Common myths / FAQ
- Support and help-seeking guidance when clinically relevant
- Source note and verification note when a claim cannot be fully confirmed from the EPUB text

## Content Strategy

- Preserve the chapter-to-article mapping so the output remains traceable to the source text.
- Rewrite for health-education readability rather than literal translation.
- Expand definitions, context, and practical interpretation where needed, but avoid unsupported claims beyond the chapter topic.
- Use careful language for clinical, legal, and risk-related statements.
- If the EPUB chapter includes incomplete reference detail, mark uncertain claims with `(needs verification)` or `[NEEDS VERIFICATION]`.

## Processing Plan

1. Extract the EPUB table of contents and chapter XHTML files.
2. Parse each chapter into usable plain text.
3. Create the output directory and index.
4. Generate articles in batches using parallel subagents because the article count exceeds 5.
5. Verify the expected file count and index links after generation.

## Chapter Inventory

1. Chapter One Introduction to Forensic Psychology
2. Chapter Two Police and Public Safety Psychology
3. Chapter Three Psychology of Investigations
4. Chapter Four Consulting and Testifying
5. Chapter Five Consulting With Criminal Courts
6. Chapter Six Family Law and Other Forms of Civil Litigation
7. Chapter Seven The Development Of Delinquent And Criminal Behavior
8. Chapter Eight Psychology Of Violence And Intimidation
9. Chapter Nine Psychology Of Sexual Violence
10. Chapter Ten Forensic Psychology and the Victims of Crime
11. Chapter Eleven Family Violence and Child Victimization
12. Chapter Twelve Correctional Psychology in Adult Settings
13. Chapter Thirteen Juvenile Justice and Corrections

## Constraints

- The repository is used only for coordination artifacts (`docs/plans/...`).
- Final article files live in `D:\Forensic\forensic-psychology-articles\` rather than inside the Next.js app.
- No git commit is created unless explicitly requested.
