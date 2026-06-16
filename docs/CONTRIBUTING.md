# Contributing to Sweep 'N Slash

Thank you for your interest in contributing! This document covers everything you need to get started.

If you're unsure about anything, open an issue before doing significant work. We'd rather answer a question up front than ask you to redo it.

## Scope

Sweep 'N Slash is a focused project: it ports Java Edition 1.9 combat mechanics to Bedrock. Contributions should stay within that scope.

In scope:

- Bug fixes and correctness improvements to existing mechanics
- Weapon stats
- Performance optimizations
- Cross-compatibility with other packs
- Documentation and tooling

Out of scope:

- General combat feature requests unrelated to Java 1.9
- Features that require constant upkeep against Minecraft updates
- Gameplay changes outside the combat system

If you're not sure whether something fits, open an issue and describe the idea. See [`TECHNICAL_STANDARDS.md`](TECHNICAL_STANDARDS.md) and [`FREQUENTLY_MADE_SUGGESTIONS.md`](FREQUENTLY_MADE_SUGGESTIONS.md) for more detail on what the project does and doesn't take on.

## Environment Setup

### Prerequisites

| Tool         | Purpose                                        | Install                                                |
| ------------ | ---------------------------------------------- | ------------------------------------------------------ |
| **Regolith** | Build system, compiles and exports the addon   | [regolith.dev](https://regolith.dev)                   |
| **Deno**     | Runtime for `marathon` and `shush` filters     | [deno.com](https://deno.com)                           |
| **Node.js**  | TypeScript compilation via `gametests`         | [nodejs.org](https://nodejs.org)                       |
| **VS Code**  | Recommended editor (workspace config included) | [code.visualstudio.com](https://code.visualstudio.com) |

### First-time setup

1. Install the prerequisites above
2. Clone the repository
3. Open the workspace in VS Code (it should prompt you to install recommended extensions)
4. Install all Regolith filters:
    ```sh
    regolith install-all
    ```

### Building

Build profiles are defined in `config.json`:

```sh
regolith run dev            # development build, exports to Minecraft development folders
regolith run dev-gametest   # development build with gametest
regolith run pack           # release build, outputs SweepNSlash.mcaddon
regolith run pack-gametest  # release build with gametest
```

Regolith runs filters on a temporary copy of the project (`.regolith/tmp/`). Source files are never modified by the build. Output goes to your development export target or as a packed `.mcaddon`.

## Code Style

Formatting is handled by Prettier. The config (`.prettierrc.json`) enforces:

- 4-space indent
- 96-character line width
- Single quotes
- Semicolons

Run Prettier before committing. VS Code will auto-format on save if you have the recommended extensions installed.

### TypeScript conventions

All scripts must be `.ts`, no plain JavaScript.

Strict TypeScript is enabled (`noImplicitAny`, `strict`). The compiler will reject loose code.

## How to Contribute

### For bug fixes and small changes

1. Fork the repository
2. Create a branch (`fix/short-description`)
3. Make your changes
4. Open a pull request describing what changed and why

For obvious bugs or typos you can skip opening an issue first.

### For new features or non-trivial changes

1. **Open an issue first** to align on approach before spending time on it
2. Fork and create a branch (`feat/short-description`)
3. Implement, following the conventions in this document
4. Open a pull request referencing the issue

### For weapon stats

Weapon stats can be made in two ways:

- Custom components: add stat definitions directly in the pack's stats system
- MCBE-IPC: register stats from an external pack via the IPC layer (v3.4.1)

However, these can also be made by adding files in the repo.

See the existing stats in `packs/data/gametests/src/stats/` and `src/weaponStats/` for examples.

## Pitfalls

- No JS: all scripts must be TypeScript, no exceptions
- Stable API only: only stable & official Minecraft Scripting APIs; no experimental behavior that breaks between updates
- Regolith tmp is not source: `.regolith/tmp/` is a build artifact directory, never edit it directly
- Zero-regression: changes to combat mechanics must not affect gameplay outside combat scope or introduce performance regressions

## Code of Conduct

Be respectful and assume good faith. This project is open to contributors of all experience levels.
Discriminatory, harassing, or hostile behavior will not be tolerated and may result in removal from the project's spaces.

## License

By submitting a pull request, you agree that your contribution is licensed under the **MIT License** or **CC-BY-NC-SA-4.0** that covers this project, and that you have the rights to submit it under those terms.
