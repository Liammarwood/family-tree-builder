# Contributing to Family Tree Builder

Thank you for your interest in contributing to the Family Tree Builder project!

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases and changelog generation. Please format your commit messages as follows:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature (triggers a minor version bump)
- **fix**: A bug fix (triggers a patch version bump)
- **docs**: Documentation changes only
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverting a previous commit

### Examples

```bash
feat: add ability to export family tree as PDF
fix: resolve issue with sibling node positioning
docs: update README with installation instructions
style: format code with prettier
refactor: simplify auto-layout algorithm
perf: optimize tree rendering performance
test: add tests for family tree merge functionality
build: upgrade Next.js to version 15
ci: update GitHub Actions workflow
chore: update dependencies
```

### Breaking Changes

If your commit introduces breaking changes, add `BREAKING CHANGE:` in the commit body or footer:

```bash
feat: redesign family tree data structure

BREAKING CHANGE: The family tree data format has changed.
Users will need to migrate their existing trees.
```

This will trigger a major version bump.

### Scope (Optional)

You can optionally specify a scope to provide more context:

```bash
feat(sharing): add WebRTC-based tree sharing
fix(layout): correct partner node alignment
docs(readme): add PWA setup instructions
```

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run build (`npm run build`)
6. Commit your changes using conventional commits
7. Push to your branch (`git push origin feat/amazing-feature`)
8. Open a Pull Request

## Automated Releases

When commits are merged to the `main` branch, the CI/CD pipeline automatically:

1. Analyzes commits since the last release
2. Determines the version bump based on commit types
3. Generates a changelog
4. Updates package.json version
5. Creates a git tag
6. Publishes a GitHub release

No manual version management is needed!

## Questions?

If you have any questions about contributing, feel free to open an issue or discussion on GitHub.
