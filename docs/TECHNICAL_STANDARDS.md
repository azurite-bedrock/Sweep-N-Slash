# Technical Standards
This document explains the technical standards and development scope about what is desired, what is not and why.

## Vision & Scope
Sweep 'N Slash is an add-on, not a mod. The primary goal is to bring The Combat Update's aspects into Bedrock Edition, not to mimic Java Edition. While there are certainly many features that this add-on could benefit from, it will not consider that are not related with The Combat Update.

## Technical Constraints
Because add-ons do not have the same freedom as modding, we adhere to the following technical boundaries:
- API Compliance: We only use official hooks from Scripting API and documented entry points. Features requiring "hacky" workarounds or destructive overwriting of core files are considered out of scope.
  - `player.json` is an exception for this, since the add-on as whole is based around 'disabling vanilla combat'.
- Zero-Regression: Any new feature must not negatively affect performance or alter gameplay in a way that could affect Bedrock experience.
- Maintenance Sustainability: Features that require constant maintenance to remain functional is not desired unless necessary.
