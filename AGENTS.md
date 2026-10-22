<!-- RASTER:fast-workflow:start v=3 -->
## Agent fast workflow (CI-first) — managed by Raster

Raster keeps this block current (v3); edit outside the markers only. If this project's own instructions say something
more specific about checks, tests, hooks or CI, they win over this block. The design gate and the script/Codex guards named below
apply when available in this project; where they are not, the rules are convention.

## Principle
CI is the source of truth. Do locally only what is cheap and scoped to the files you changed; never repeat what the commit/push
hooks or CI already run; never reproduce a CI failure locally when the CI system can tell you exactly what failed. Time spent
waiting on whole-repo gates is wasted: a 2-file change must not cost an hour.

## Design quality (applies to every task that modifies files)
Speed never means duplicated or tangled code. Two checkpoints, cheap first, an LLM only when flagged:
- **Start of any task that will modify a file — reuse scan (≈1 query, never blocks):** before writing, search the code graph /
  module READMEs for what already exists (`graphify query "<task keywords>"`, or the project's equivalent: grep for the symbol,
  read the area's README/ports). Reuse existing modules, ports and registries instead of writing a parallel one. Note which files are
  near their size ceiling and which import-direction rules apply.
- **End of the task, on the modified files — design gate:** check that the change keeps one responsibility per module (S), extends
  through registries/ports instead of a new `switch` on kinds (O), depends on interfaces not concrete adapters (D), keeps ports small
  (I), and that none of the new functions duplicates existing code (search by name/signature and by shape). If the project has
  `npm run check:changed`, its `design` step does this deterministically; when it reports `needs-review`, apply its concrete
  refactor steps once (one iteration, never a loop) and report what you changed. When nothing flags, say so in one line.
- It is allowed to be slow at first: verdicts are cached by file content, accepted findings are remembered, and project conventions
  are learned, so the same checks get faster and more precise over time.

## The loop (every change)
1. **Work in a worktree/branch**, reuse an existing worktree's dependencies when possible (copy, never symlink/junction
   `node_modules`). Do not wait on an unneeded full install.
2. **Reuse scan, then edit.** Read only what you need (the project's code graph / search tool first, then the exact lines) and
   run the start-of-task reuse scan above.
3. **Local gate = changed files only:**
   - fixers first: `eslint --fix <changed files>` and `prettier --write <changed files>` (they fix import order and formatting in
     seconds; never hand-edit those);
   - type-check only the affected project (incremental), not the whole app;
   - run only the tests you added/changed and their direct importers (by explicit path);
   - the file-size ratchet also runs on the changed files only (the whole repo only for an explicit "verify everything" task:
     `check:changed --all` / `FULL_CHECK=1`);
   - if the project has `npm run check:changed` (or equivalent), run that instead of the three above, with `--fix`.
   Do NOT run whole-repo `lint`, `format:check`, `typecheck` or the full test suite unless a hook/CI reports a problem outside
   your files. Do not re-run what the commit hook just ran.
4. **Design gate** on the modified files (see above), then **commit and push.** Commit/pre-push hooks are the local gate (staged lint/format/typecheck, selected tests). Never
   `--no-verify`.
5. **Open the PR and let CI be the full gate.** Then WAIT FOR THE RESULT WITHOUT POLLING IN A LOOP:
   - if the project has Raster's `raster ci watch`, run it once and wait for the notice;
   - otherwise check at most once every ~4 minutes, doing useful work in between (never `sleep` loops).
6. **On failure, read exactly what failed from the CI system; do not reproduce it locally:**
   - Forgejo/Gitea 12+: `GET /api/v1/repos/{owner}/{repo}/actions/runs?head_sha=<sha>&page=1&limit=10` → `.../actions/runs/{run_id}/jobs` →
     `.../actions/runs/{run_id}/logs` (or `.../actions/jobs/{job_id}/logs`); auth with the git credential/PAT. Filter by `head_sha` or
     `status=failure`, and ALWAYS send `page=1` together with `limit`: without `page`, Forgejo 17 ignores `limit` and returns every run
     of the repository (145 MB and ~10 s with 9k runs, because each row embeds its whole event payload);
   - GitHub Actions: `gh run list --branch <b> --limit 1`, `gh run view <id> --log-failed`, check-run annotations;
   - Azure Pipelines: `az pipelines runs list`, build timeline, `az pipelines runs show` / build logs, failed test results;
   - Raster: `raster ci failure [<pr>|<sha>]` (structured: failing step, first error, failing files/tests).
   Fix only what the failure names, push, repeat. A failure that only reproduces under load (a known-flaky test with a timeout)
   is re-run, not "fixed".
7. **Done = PR open, CI green, report** (PR number, CI state, what changed, anything not done). Do not merge unless asked.

## Scope and evidence (one owner per check, reuse only proven success)
- **Resolve the PR's actual target branch.** A stacked PR targets its parent PR, not main, and the feature branch's tracking upstream is
  not its PR target. Record it: `git config branch.<current-branch>.agentFastBase <target-ref>` (runners also accept
  `FAST_WORKFLOW_BASE` / `CHECK_CHANGED_BASE`). Scope = changes since the merge base with that target plus staged, unstaged and
  untracked files, minus generated output. If the target cannot be resolved, stop and fix the ref: never fall back to all tests.
- **One owner per check.** If a mandatory commit/push hook already performs a check, that hook owns it: do not run it by hand right
  before or after. Editing: reuse code, scoped fixers, a focused diagnostic only for an open question. Commit: staged lint/format and
  affected-project type checks. Push: this PR's unvalidated changes only. CI: full integration of the proposed state.
- **Reuse results, never attempts.** A receipt needs the step and arguments, the real PR base, input contents (untracked bytes too),
  relevant config/lockfiles, runtime identity and a confirmed successful completion. Queued, failed, killed, timed-out or unknown is
  not success. Changed base, rewritten history, config, dependencies or runtime invalidate the affected evidence; missing evidence
  means a scoped run, never an automatic full suite. Never infer that all tests passed because lint passed.
- **Report separately:** files changed, test files executed, test cases passed, checks reused. Cases are not files.

## Enforcement per tool (so it does not depend on remembering)
- **Any agent (script guard):** whole-repo `npm run lint|format:check|typecheck|check|test` refuse inside an agent session (not CI, not a
  git hook) and print `npm run check:changed -- --fix`; set `FULL_CHECK=1` only when the task really is "verify everything".
- **Claude Code, any project (user-level `fast-gate` hook, old and new repos):** refuses whole-repo gates in repos with 250+ files or `check:changed`,
  and refuses REWORK (the same verification on an unchanged tree within 30 minutes); quoted text and heredocs are never judged; it fails open.
  `FULL_CHECK=1` verifies everything on purpose, `FORCE_RERUN=1` is a deliberate scoped rerun, never to defeat a refusal.
- **Git pre-push (agent sessions only):** skips lint/format/tests with one printed line because the commit hook ran the fixers and CI runs
  the tests; humans in a terminal keep the full hook, `FULL_CHECK=1` forces it. `--no-verify` is never used.
- **Claude Code (repo hook):** the heavy-command hook allows scoped `npx eslint|prettier|vitest <files>` and denies unscoped runs; start/end hooks
  inject the reuse scan and run the design gate once per turn.
- **Codex:** command rules in `<CODEX_HOME>/rules/*.rules` forbid the whole-repo commands (with the justification above) and allow
  `npm run check:changed`; hooks (`UserPromptSubmit`/`Stop`) where the installed version supports them; otherwise the git hooks.
- **Raster Code (opencode) and Raster's own tasks:** the same managed instruction block, the script guard, and the design gate in the
  mechanical pre-review of every delivery; the task context starts with the reuse-scan block.

## Rules that save the most time
- One focused change per PR; stack PRs, open each as soon as it is green; do not wait to bundle.
- No sleeps while waiting; no repeated full runs; no "let me also run the whole suite to be safe".
- If a machine-wide lock queues your command, that is a signal you chose a whole-repo command: scope it.
- Prefer a faster/cheaper model for mechanical edits (renames, import order, test fixtures); keep the large model for design.
- Parallelism: at most 2 heavy agents per modest workstation; heavy verification belongs on the big server/CI.
- Use the database/process/host the project designates; never delete shared state or force-push without explicit approval.
- Never print secrets or tokens; redact them in logs and fixtures.

## Quick card
resolve PR target → reuse scan → `fix` changed files → run own tests → design gate → `commit` (hooks) → `push` → open PR → wait for CI (one check per ~4 min) → on red read
CI log → fix named files only → push.
<!-- RASTER:fast-workflow:end -->
