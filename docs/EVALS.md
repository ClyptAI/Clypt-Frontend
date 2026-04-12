# EVALS Resolver Pointers

Purpose: keep context lean and load the right skills only when needed.

## Resolver Rule (Required)

Before starting implementation work:

1. Classify the task type.
2. Load the matching skill pointers from this file.
3. Run the required checks for that task class before shipping.

For frontend behavior, interaction, or scoring/ranking logic changes, run the frontend eval checks and compare against the latest known-good behavior before shipping.

Canonical eval commands:

```bash
npm run lint
npm run test
```

## Task Router

| Task Type | Load First |
|---|---|
| Architecture/approach planning | `superpowers/skills/brainstorming`, `superpowers/skills/writing-plans`, `gstack/plan-eng-review`, `gstack/plan-ceo-review`, `gstack/office-hours` |
| Executing a multi-step approved plan | `superpowers/skills/executing-plans`, `superpowers/skills/subagent-driven-development`, `superpowers/skills/dispatching-parallel-agents` |
| Debugging regressions | `superpowers/skills/systematic-debugging`, `gstack/investigate`, `gitnexus/gitnexus-debugging`, `gstack/review` |
| Refactors/renames with blast-radius checks | `gitnexus/gitnexus-refactoring`, `gitnexus/gitnexus-impact-analysis`, `superpowers/skills/receiving-code-review` |
| React/Next component quality and performance | `react-best-practices`, `react-view-transitions`, `composition-patterns`, `web-design-guidelines`, `gstack/design-review` |
| UI QA test/report/fix loops | `gstack/qa`, `gstack/qa-only`, `gstack/browse`, `gstack/setup-browser-cookies` |
| Code review readiness | `superpowers/skills/requesting-code-review`, `superpowers/skills/verification-before-completion`, `gstack/review`, `gstack/codex` |
| External docs/API lookup | `context-hub/cli/skills/get-api-docs` |
| Branch/worktree/release workflow | `superpowers/skills/using-git-worktrees`, `superpowers/skills/finishing-a-development-branch`, `gstack/ship`, `gstack/document-release` |

## Installed Skill Pointers

These are lightweight pointers only. Load on demand per task type.
If the active agent is Claude, use the same relative paths but swap `../.agents/` with `../.claude/`.

### Superpowers (obra/superpowers)

- [`brainstorming`](../.agents/skills/superpowers/skills/brainstorming/SKILL.md)
- [`dispatching-parallel-agents`](../.agents/skills/superpowers/skills/dispatching-parallel-agents/SKILL.md)
- [`executing-plans`](../.agents/skills/superpowers/skills/executing-plans/SKILL.md)
- [`finishing-a-development-branch`](../.agents/skills/superpowers/skills/finishing-a-development-branch/SKILL.md)
- [`receiving-code-review`](../.agents/skills/superpowers/skills/receiving-code-review/SKILL.md)
- [`requesting-code-review`](../.agents/skills/superpowers/skills/requesting-code-review/SKILL.md)
- [`subagent-driven-development`](../.agents/skills/superpowers/skills/subagent-driven-development/SKILL.md)
- [`systematic-debugging`](../.agents/skills/superpowers/skills/systematic-debugging/SKILL.md)
- [`test-driven-development`](../.agents/skills/superpowers/skills/test-driven-development/SKILL.md)
- [`using-git-worktrees`](../.agents/skills/superpowers/skills/using-git-worktrees/SKILL.md)
- [`using-superpowers`](../.agents/skills/superpowers/skills/using-superpowers/SKILL.md)
- [`verification-before-completion`](../.agents/skills/superpowers/skills/verification-before-completion/SKILL.md)
- [`writing-plans`](../.agents/skills/superpowers/skills/writing-plans/SKILL.md)

### GitNexus (code intelligence)

- [`gitnexus-guide`](../.agents/skills/gitnexus/gitnexus-guide/SKILL.md)
- [`gitnexus-cli`](../.agents/skills/gitnexus/gitnexus-cli/SKILL.md)
- [`gitnexus-exploring`](../.agents/skills/gitnexus/gitnexus-exploring/SKILL.md)
- [`gitnexus-debugging`](../.agents/skills/gitnexus/gitnexus-debugging/SKILL.md)
- [`gitnexus-impact-analysis`](../.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md)
- [`gitnexus-refactoring`](../.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md)

### Gstack (garrytan/gstack)

- [`browse`](../.agents/skills/gstack/browse/SKILL.md)
- [`careful`](../.agents/skills/gstack/careful/SKILL.md)
- [`codex`](../.agents/skills/gstack/codex/SKILL.md)
- [`design-consultation`](../.agents/skills/gstack/design-consultation/SKILL.md)
- [`design-review`](../.agents/skills/gstack/design-review/SKILL.md)
- [`document-release`](../.agents/skills/gstack/document-release/SKILL.md)
- [`guard`](../.agents/skills/gstack/guard/SKILL.md)
- [`investigate`](../.agents/skills/gstack/investigate/SKILL.md)
- [`office-hours`](../.agents/skills/gstack/office-hours/SKILL.md)
- [`plan-ceo-review`](../.agents/skills/gstack/plan-ceo-review/SKILL.md)
- [`plan-design-review`](../.agents/skills/gstack/plan-design-review/SKILL.md)
- [`plan-eng-review`](../.agents/skills/gstack/plan-eng-review/SKILL.md)
- [`qa`](../.agents/skills/gstack/qa/SKILL.md)
- [`qa-only`](../.agents/skills/gstack/qa-only/SKILL.md)
- [`review`](../.agents/skills/gstack/review/SKILL.md)
- [`setup-browser-cookies`](../.agents/skills/gstack/setup-browser-cookies/SKILL.md)
- [`ship`](../.agents/skills/gstack/ship/SKILL.md)

### Context Hub (andrewyng/context-hub)

- [`get-api-docs`](../.agents/skills/context-hub/cli/skills/get-api-docs/SKILL.md)

### Vercel Skills (vercel-labs/agent-skills)

- [`react-best-practices`](../.agents/skills/react-best-practices/SKILL.md)
- [`react-view-transitions`](../.agents/skills/react-view-transitions/SKILL.md)
- [`composition-patterns`](../.agents/skills/composition-patterns/SKILL.md)
- [`web-design-guidelines`](../.agents/skills/web-design-guidelines/SKILL.md)
