# Slice 02: Add PR hygiene and repository workflow templates

## Goal

Encode the refactor workflow directly into GitHub repo metadata.

## Scope

- add `CODEOWNERS`
- add pull request template
- add issue forms
- add issue configuration

## Non-goals

- no branch protection setting changes from code
- no workflow behavior changes

## Risks

- templates that are too heavy will annoy contributors
- code owner patterns may need iteration

## Validation

- issue forms render correctly
- PR template reflects refactor invariants
- ownership paths reflect current repo structure

## Completion criteria

- new PRs and issues collect the minimum information required for safe refactor review
