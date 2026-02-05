# AGENTS.md - PortManagement

Guide for AI agents working on this project.

## Virtual Subagents Workflow

Every non-trivial task follows a **three-phase approach**:

| Phase | Agent              | Focus                     | Output                      |
| ----- | ------------------ | ------------------------- | --------------------------- |
| 1     | 🎯 **Planner**     | Understand, scope, design | Plan with files/steps/risks |
| 2     | 🔨 **Implementer** | Write clean, tested code  | Changes + tests             |
| 3     | 🔍 **Reviewer**    | Verify quality            | Checklist + verification    |

### Planner 🎯

- Analyze request and clarify ambiguities
- Identify affected files and dependencies
- Propose step-by-step implementation plan
- Estimate risk and ask questions if needed

### Implementer 🔨

- Execute approved plan step by step
- Follow project conventions
- Add tests for new logic
- Keep changes minimal and focused

### Reviewer 🔍

- Run lint and tests
- Check code quality and conventions
- Verify build succeeds
- Provide verification steps

> **Skip phases** for trivial tasks (typo, config). See `01-agent-workflow.md` for details.

## Tech Stack

| Area          | Technology                            | Version |
| ------------- | ------------------------------------- | ------- |
| Framework     | Expo SDK                              | 53      |
| Runtime       | React Native                          | 0.79    |
| Navigation    | React Navigation                      | 7       |
| State         | Jotai (migrating from Redux)          | -       |
| Server State  | TanStack React Query                  | 5       |
| Backend       | Firebase (Functions, Firestore, Auth) | 22      |
| Observability | Firebase Crashlytics                  | 22      |

## Project Structure

```
src/
├── Screens/           # Screens by feature
├── components/        # Reusable components
├── Services/          # API and business logic
├── Router/            # Navigation configuration
├── Theme/             # Styles and theming
├── Translations/      # i18n (i18next)
├── atoms/             # Jotai state (in migration)
└── hooks/             # Custom hooks
```

## Main Commands

```bash
# Development
npm start                    # Expo dev server
npm run ios                  # Build + run iOS
npm run android              # Build + run Android

# Quality
npm run lint                 # ESLint
npm test                     # Jest

# Build
npm run prebuild             # Regenerate natives
npm run prebuild:clean       # Regenerate from scratch
npm run build:dev            # EAS build development
npm run build:production     # EAS build production
```

## Project Rules

Detailed rules are in `.cursor/rules/`:

| File                     | Purpose                      |
| ------------------------ | ---------------------------- |
| 00-foundation.md         | Workflow and core principles |
| 10-expo-react-native.md  | Expo/RN conventions          |
| 11-react-navigation.md   | Navigation patterns          |
| 12-state-jotai.md        | State management             |
| 13-react-query.md        | Cache and fetching           |
| 14-firebase-functions.md | Firebase backend             |
| 30-testing-quality.md    | Tests and quality            |
| 40-observability.md      | Logging and crashlytics      |

## Available Skills

Skills for specific tasks in `.cursor/skills/`:

### Build & Run

- **expo-run-ios** - Run on iOS
- **expo-run-android** - Run on Android
- **expo-prebuild-check** - Verify/regenerate natives
- **rn-ci-check** - CI suite (lint, test, build)

### Audits

- **navigation-audit** - Review route structure
- **jotai-audit** - Audit global state
- **rq-cache-audit** - Optimize React Query cache

### Debug & Ops

- **firebase-functions-emulator** - Local emulator
- **crash-triage** - Investigate crashes

## Workflow

### Before Implementing

1. Read relevant rules in `.cursor/rules/`
2. Clarify scope in 3-7 points
3. Propose plan with files to modify

### While Implementing

1. Small, focused changes
2. Follow existing codebase patterns
3. Add tests for new logic

### After Implementing

1. Run `npm run lint`
2. Run `npm test`
3. Verify build with `npx expo prebuild --clean` if native changes
4. Document: what changed, why, how to verify

## Business Context

PortManagement is a property management app for administrators and owners. Main features:

- Dashboard with statistics
- House/property management
- Maintenance checklists
- Incident system
- Chat/messaging
- Worker management

## Important Notes

- **Migration in progress**: Redux → Jotai (temporarily coexisting)
- **Firebase**: Use emulators for local development
- **i18n**: All visible text must use `t('key')`
- **Crashlytics**: Log significant errors with context
