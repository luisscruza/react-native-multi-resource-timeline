# Contributing to React Native Multi-Resource Timeline

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/react-native-multi-resource-timeline.git
   cd react-native-multi-resource-timeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the example app**
   ```bash
   cd example
   npm install
   cd ..
   ```

4. **Start development**
   ```bash
   # Build the library in watch mode
   npm run build:watch
   
   # In another terminal, run the example
   cd example
   npm start
   ```

## Code Style

We use ESLint and Prettier to maintain code quality and consistency.

- Run `npm run lint` to check for linting errors
- Run `npm run lint:fix` to automatically fix linting issues
- Code is automatically formatted with Prettier

## Testing

- Write tests for new features and bug fixes
- Run `npm test` to run the test suite
- Run `npm run test:watch` for watch mode during development

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/react-native-multi-resource-timeline/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/react-native-multi-resource-timeline/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please [open an issue](https://github.com/yourusername/react-native-multi-resource-timeline/issues/new) with:

- Clear description of the feature
- Use case and why it would be valuable
- If possible, mockups or examples

## Development Guidelines

### File Structure
- Keep components in `src/components/`
- Put hooks in `src/hooks/`
- Utilities go in `src/utils/`
- Styles in `src/styles/`
- Types in `src/types/`

### Commit Messages
We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `style: code style changes`
- `refactor: code refactoring`
- `test: adding or updating tests`
- `chore: maintenance tasks`

### TypeScript
- Use TypeScript for all new code
- Add proper type definitions
- Avoid `any` types when possible

### Performance
- Consider performance implications of changes
- Use React DevTools Profiler for performance testing
- Test with large datasets

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
