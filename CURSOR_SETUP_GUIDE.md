# Cursor Development Setup Guide for reef-pi

This guide will help you set up and develop the reef-pi project using Cursor IDE.

## Prerequisites

Before starting, ensure you have:
- **Git** installed (for version control)
- **Go 1.23.2** or later (for backend development)
- **Node.js** and **Yarn** (for frontend development)
- **Cursor IDE** installed ([download here](https://cursor.com))

## Step 1: Open Project in Cursor

1. **Open Cursor IDE**
2. **Open the project folder:**
   - Click `File` → `Open Folder...`
   - Navigate to `/Users/ranjibdey/reef-pi`
   - Click "Open"

   OR use the terminal:
   ```bash
   cd /Users/ranjibdey/reef-pi
   cursor .
   ```

## Step 2: Install Dependencies

### Backend (Go) Dependencies
```bash
cd /Users/ranjibdey/reef-pi
go mod download
```

### Frontend (JavaScript/React) Dependencies
```bash
cd /Users/ranjibdey/reef-pi
yarn install
```

If you don't have yarn, install it:
```bash
npm install -g yarn
```

## Step 3: Configure Cursor for reef-pi

### 3.1 Enable Codebase Indexing

Cursor will automatically start indexing your codebase. This may take a few minutes for a project of this size.

- **Monitor indexing:** Go to `Cursor Settings` → `Indexing & Docs`
- **Check indexing status:** Look for the indexing indicator in the status bar

### 3.2 Recommended Cursor Settings

1. **Open Settings:** Press `Cmd+,` (macOS) or `Ctrl+,` (Windows/Linux)
2. **Enable AI features:**
   - Tab autocomplete: Enabled by default
   - Inline edit: Enabled (press `Cmd+K` or `Ctrl+K`)
   - Chat: Enabled (press `Cmd+I` or `Ctrl+I`)

### 3.3 Create `.cursorignore` (Optional)

If you want to exclude certain files from indexing, create a `.cursorignore` file:
```
node_modules/
.git/
build/
bin/
*.log
```

## Step 4: Understanding the Project Structure

```
reef-pi/
├── commands/          # Go backend entry points
├── controller/        # Main backend logic
├── front-end/         # React frontend application
├── build/             # Build artifacts
├── go.mod             # Go dependencies
├── package.json       # JavaScript dependencies
├── Makefile           # Build commands
└── README.md          # Project documentation
```

## Step 5: Development Workflow

### 5.1 Building the Project

**Build everything:**
```bash
make bin
```

**Build only backend:**
```bash
make go
```

**Build only frontend:**
```bash
make build-ui
```

### 5.2 Running Tests

**Backend tests:**
```bash
make test
```

**Frontend linting:**
```bash
make js-lint
make sass-lint
```

### 5.3 Common Development Tasks

1. **Making code changes:**
   - Edit files in Cursor
   - Use Tab autocomplete for faster coding
   - Use `Cmd+K` (or `Ctrl+K`) for inline AI edits
   - Use `Cmd+I` (or `Ctrl+I`) to chat with AI about code

2. **Understanding code:**
   - Use `Cmd+Click` (or `Ctrl+Click`) to navigate to definitions
   - Use `Cmd+P` (or `Ctrl+P`) to quickly open files
   - Ask Cursor AI: "Explain this function" or "What does this code do?"

3. **Refactoring:**
   - Select code and use `Cmd+K` to ask for refactoring
   - Example: "Make this function more efficient" or "Extract this into a separate function"

4. **Adding features:**
   - Use Cursor Chat (`Cmd+I`) to discuss implementation approach
   - Example: "Add a new sensor type to the controller"

## Step 6: Using Cursor AI Features

### 6.1 Tab Autocomplete
- Start typing code and Cursor will suggest completions
- Press `Tab` to accept suggestions
- Press `Esc` to dismiss

### 6.2 Inline Edit (`Cmd+K` or `Ctrl+K`)
1. Select a block of code
2. Press `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux)
3. Type your instruction (e.g., "Add error handling")
4. Press `Enter` to apply changes

### 6.3 Chat Interface (`Cmd+I` or `Ctrl+I`)
1. Press `Cmd+I` (macOS) or `Ctrl+I` (Windows/Linux)
2. Ask questions like:
   - "How does the temperature controller work?"
   - "Where is the LED lighting code?"
   - "Add tests for the dosing pump module"
   - "Explain the API endpoint structure"

### 6.4 Code Generation
- Ask Cursor to generate boilerplate code
- Example: "Create a new controller module for XYZ sensor"

## Step 7: Git Workflow

### 7.1 Creating a Branch
```bash
git checkout -b feature/your-feature-name
```

### 7.2 Committing Changes
```bash
git add .
git commit -m "Your commit message"
```

### 7.3 Pushing Changes
```bash
git push origin feature/your-feature-name
```

**Note:** Before pushing, create a Pull Request on GitHub following the project's [Contributing Guidelines](.github/CONTRIBUTING.md).

## Step 8: Debugging

### Backend (Go)
- Use Go's built-in debugging or Delve
- Set breakpoints in Cursor
- Use `go run` for quick testing

### Frontend (React)
- Use browser DevTools
- React DevTools extension recommended
- Check browser console for errors

## Step 9: Useful Cursor Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Open Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Open Chat | `Cmd+I` | `Ctrl+I` |
| Inline Edit | `Cmd+K` | `Ctrl+K` |
| Quick File Open | `Cmd+P` | `Ctrl+P` |
| Go to Definition | `Cmd+Click` | `Ctrl+Click` |
| Find References | `Shift+F12` | `Shift+F12` |

## Step 10: Getting Help

1. **Project Documentation:**
   - Read [README.md](README.md)
   - Check [Development Documentation](https://reef-pi.github.io/additional-documentation/development/)

2. **Cursor Documentation:**
   - Visit [Cursor Docs](https://docs.cursor.com)
   - Use `Cmd+Shift+P` → "Cursor: Start Onboarding"

3. **Community:**
   - Join reef-pi [Slack channel](https://join.slack.com/t/reef-pi/shared_invite/enQtNDI4NzM4MjEzNDk1LTJjMzkzN2M4ZjUzODMxZjRjZWIzMGY2MWIyMzg2OGI2NTU2MThlZmM0ZGZiN2E2M2NmZWVhOThkOGNjZWRiNjM)
   - Check [reef2reef thread](http://www.reef2reef.com/threads/reef-pi-an-open-source-raspberry-pi-based-reef-tank-controller.289256/)

## Troubleshooting

### Indexing Issues
- If indexing seems stuck, restart Cursor
- Check `.cursorignore` isn't excluding important files
- Go to Settings → Indexing & Docs to see status

### Go Module Issues
```bash
go mod tidy
go mod download
```

### Frontend Build Issues
```bash
rm -rf node_modules yarn.lock
yarn install
```

### Cursor Not Responding
- Restart Cursor
- Check if there are too many files indexed
- Update Cursor to latest version

## Next Steps

1. ✅ Project cloned and opened in Cursor
2. ✅ Dependencies installed
3. ✅ Cursor configured
4. 🔄 Explore the codebase using Cursor AI
5. 🔄 Pick an issue or feature to work on
6. 🔄 Make your first contribution!

Happy coding! 🐠✨

