## 1. Dependencies & Setup

- [ ] 1.1 Add `pacote` and `libnpmconfig` to `packages/sora-cli/package.json` dependencies
- [ ] 1.2 Remove `isomorphic-git` from `packages/sora-cli/package.json` dependencies
- [ ] 1.3 Run `pnpm install` to update lockfile
- [ ] 1.4 Spike: verify `libnpmconfig.read()` + spread + `pacote.extract()` works with current Node version

## 2. Template Selection (template-selection spec)

- [ ] 2.1 Define `TEMPLATES` constant array with `{pkg, desc}` entries in `new.ts`
- [ ] 2.2 Update oclif `static args` to `[name, template]` (template optional)
- [ ] 2.3 Implement interactive template selection: show list when template arg is missing, add "Custom" option that prompts for package name via inquirer

## 3. NPM Download (npm-template-download spec)

- [ ] 3.1 Replace `isomorphic-git` import with `pacote` and `libnpmconfig` imports
- [ ] 3.2 Read npm config via `libnpmconfig.read()`, spread to plain object
- [ ] 3.3 Replace `git.clone()` call with `pacote.extract(templateSpec, dir, npmOpts)`
- [ ] 3.4 Update ora spinner message to show downloading package name

## 4. Post-processing

- [ ] 4.1 Keep existing package.json post-processing logic (metadata override + field deletion)
- [ ] 4.2 Add completion message hint: `cd <name> && pnpm install`

## 5. Cleanup & Verification

- [ ] 5.1 Remove unused `git`/`http`/`oFS`/`pathModule` imports from `new.ts`
- [ ] 5.2 Run `pnpm build` in sora-cli to verify TypeScript compilation
- [ ] 5.3 Run `pnpm lint` in sora-cli to verify linting passes
- [ ] 5.4 Manual test: `sora new test-project` (interactive selection)
- [ ] 5.5 Manual test: `sora new test-project @sora-soft/example-template` (direct)
