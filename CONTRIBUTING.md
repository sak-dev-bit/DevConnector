# Contributing to DevConnector

Thank you for your interest in contributing to DevConnector! This project follows Agile methodologies and maintains high-quality Git hygiene to ensure scalability and reliability.

---

## Git Branching Strategy

We use a feature-branch workflow. Please follow these steps:

1.  **Main Branch**: The `main` branch is our production-ready branch. Do not commit directly to `main`.
2.  **Feature Branches**: Branch out from `main` using the format `feat/feature-name` or `fix/bug-name`.
    ```bash
    git checkout -b feat/user-authentication
    ```
3.  **Pull Requests**: Once your feature is ready, open a Pull Request (PR) against the `main` branch. Ensure your code passes all lint checks and tests.

---

## Commit Message Guidelines

To maintain a clean and readable history, we follow the **Conventional Commits** format. Each commit message should follow this pattern:

`<type>(<scope>): <description>`

### Commit Types:
-   `feat`: A new feature for the user, not a new feature for the build script.
-   `fix`: A bug fix for the user, not a fix to a build script.
-   `docs`: Changes to documentation.
-   `style`: Formatting, missing semi colons, etc.; no production code change.
-   `refactor`: Refactoring production code, e.g., renaming a variable.
-   `test`: Adding missing tests, refactoring tests; no production code change.
-   `chore`: Updating grunt tasks etc.; no production code change.

### Examples:
-   `feat(auth): add social login support`
-   `fix(api): correction of follow endpoint status codes`
-   `refactor(css): convert hardcoded colors to CSS variables`
-   `docs(readme): update tech stack and badges`

---

## PR Workflow

1.  **Fork & Clone**: Fork the repository and clone it to your local machine.
2.  **Develop**: Create a new branch and implement your changes.
3.  **Test**: Ensure the application builds and tests pass.
4.  **Commit**: Use descriptive commit messages following the Conventional Commits format.
5.  **Submit**: Push your branch and open a PR with a clear description of the changes.

---

## Development Environment Setup

1.  **Clone the Repo**: `git clone <repo-url>`
2.  **Install Dependencies**:
    -   Server: `cd server && npm install`
    -   Client: `cd client && npm install`
3.  **Environment Variables**: Create a `.env` file in the `server` directory based on the provided template.
4.  **Run Locally**: `npm run dev` (root directory) or run server and client separately.
