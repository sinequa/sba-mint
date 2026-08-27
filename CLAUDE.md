# Mint — conventions for Claude Code

## Branch naming

Kebab-case, with the Jira ticket number right after the `type/` prefix (not at the end):

```
fix/ES-30542-ipad-preview-floating-box       # correct
fix/ipad-preview-floating-box-ES-30542       # wrong — ticket must come first
```

## Lint / format (oxlint + oxfmt)

"No bulk reformat" only means: don't reformat files you're not otherwise touching (no drive-by
whole-repo/whole-directory sweeps — most of the codebase isn't oxfmt-clean yet, see `.oxfmtrc.json`).

Running `oxfmt` on a file you're genuinely editing for the task at hand is fine, even if that file
wasn't oxfmt-clean and the formatter ends up rewriting the whole file. No need to revert or hand-edit
around it — `lint-staged` will do the same on commit via the pre-commit hook.
