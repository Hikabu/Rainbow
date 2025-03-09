# Rainbow
# Transcendence Project

## Branching Strategy


- **main**: The stable branch, containing production-ready code.
- **dev**: The primary development branch, close to production-ready code.
- **debug/**_keywords_for_problem_: If someone encounters an issue they cannot solve, they should push the code here with an appropriate keyword in the branch name (e.g., `debug/login_error`).
  - ❗ **Never create a branch named just `debug`** (it would block `debug/*` branches).
- **features/**_feature_name_: Dedicated branch for new feature implementations, mainly for Arturo’s ideas (e.g., `features/tunnel`).
 - ❗ **Never create a branch named just `features`** (it would block `features/*` branches).  

### Frontend
- Uses Vue.js (not the best framework, but it handles cookies and routing well).
- **Only Yarn** is allowed as the package manager (**NO NPM** 😆).
- Install dependencies using:
  ```sh
  yarn add package_name
  ```
- To run the frontend live (without a container):
  ```sh
  yarn run dev
  ```
- If paths are highlighted in red, run ESLint to fix formatting:
  ```sh
  npm run lint -- --fix
  ```
  (Check the `eslint.config.js` for configuration.)

### Backend
- Backend is developed using **Django**.
- Uses **pipenv** for dependency management (**better than `requirements.txt` as it manages dependencies automatically**).
- Run the backend server with:
  ```sh
  pipenv run python3 manage.py runserver
  ```
  ⚠️ The backend **will not work without the database**. Ensure PostgreSQL is running first.
- To access the database inside the container:
  ```sh
  psql -U postgres -d postgress
  ```
  - View tables: `\dt`
  - Check user table: `SELECT * FROM intrauth_customuser;`

### Authentication
- **42 API login & sign-in is working** ✅.
- No logout button yet; to log out, manually delete tokens from **Inspect -> Application** in the browser.

### Containers & Makefile
- The project runs in **Docker containers**.
- The `Makefile` contains rules for managing frontend and backend services:
  - To stop the frontend: `make stopfront`
  - To stop the backend: `make stopbackend`
  - If changes are needed: `make blabla`, then `make` again.

### Development Tips
- If there are many highlights/errors in the backend, **switch to the recommended Python interpreter** in VS Code:
  - Open **Command Palette** (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS).
  - Select **Python: Select Interpreter** and choose the recommended option.

---

## Contribution Guidelines
1. Follow the branching strategy outlined above.
2. Ensure code is properly formatted (use ESLint for frontend and follow Python best practices for backend).
3. Use `pipenv` for backend dependencies and `yarn` for frontend dependencies.
4. If you encounter a persistent issue, push to `debug/your_issue_name`.
5. New features should be developed in `features/your_feature_name`.

Happy coding! 🚀