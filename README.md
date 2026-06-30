<img width="200" height="200" alt="loopa" src="https://github.com/user-attachments/assets/56bc52c9-b5d1-429a-bd57-bd897685bb31" />

[![GitHub license](https://img.shields.io/github/license/fadillahrohman/git-loopa)](https://github.com/fadillahrohman/git-loopa/blob/main/LICENSE)

Git Loopa is a desktop application based on Electron + React + TypeScript that helps manage the Git workflow visually. This application is designed to simplify the process of selecting repositories, viewing file statuses, staging/unstaging, creating commits with specific timestamps, and pushing to remote repositories.

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Electron_Software_Framework_Logo.svg" alt="Electron Logo" width="120" />
</div>

## User Interface

<img width="912" height="672" alt="image" src="https://github.com/user-attachments/assets/e608434f-f22a-40a1-9d31-7b6388725962" />



## Application Features

Git Loopa focuses on a commit workflow with custom dates and timestamps that is easier and more structured. Its main features include:

- Selecting a Git repository folder directly from the application.
- Displaying the active repository branch.
- Displaying the list of changed files along with their statuses.
- Staging, unstaging, and staging all / unstaging all files.
- Creating commits with customizable messages and dates/times.
- Providing commit time presets such as now, yesterday, and a few days ago.
- Pushing to a remote repository.
- Displaying confirmation prompts before committing and pushing.

## Use Case

<img width="2683" height="1267" alt="usecase" src="https://github.com/user-attachments/assets/f1b82962-34a9-40ef-88d9-becb510ee2a6" />


## Project Structure

Below is the main directory structure of the project along with their functions:

```text
git-loopa/
├── dist-electron/           # Build output from the Electron process
├── electron/                # Main process, preload, and IPC handlers
├── public/                  # Static assets used during the build process
├── src/                     # Frontend source code (React)
│   ├── features/            
│   │   └── commit/          # Core features for the commit workflow
│   │       ├── components/  # UI Components (branch bar, file list, intro, commit form)
│   │       └── hooks/       # Custom hooks (Git status, branch, commit, and push)
│   ├── services/            
│   │   └── gitService.ts    # Access layer to the Electron API from the frontend
│   ├── shared/              # IPC types, common UI components, and shared utilities
│   └── App.tsx              # Main application layout controller (from intro to form)
├── postcss.config.js        # PostCSS styling configuration
├── tailwind.config.js       # Tailwind CSS styling configuration
├── tsconfig.json            # Main TypeScript configuration
├── tsconfig.node.json       # Node environment-specific TypeScript configuration
└── vite.config.ts           # Vite bundler configuration

```
## Prerequisites

Before running the project, ensure your machine has:

* Node.js.
* npm.
* Git installed and available in your PATH.
* An operating system that supports Electron, such as Windows, macOS, or Linux.

If you want to build/package the desktop application, also ensure your environment can run Electron Builder.

## Installation and Setup

1. Clone this repository.

```bash
git clone https://github.com/fadillahrohman/git-loopa.git
cd git-loopa
```

2. Install dependencies.

```bash
npm install

```

3. Run development mode.

```bash
npm run dev

```

4. Build the desktop application.

```bash
npm run build

```

## Usage Flow

1. Open the application.
2. Click the repository selector and choose a Git project folder.
3. Review the changed files and the active branch.
4. Stage the files you want to commit.
5. Enter a commit message and set a timestamp if needed.
6. Click commit, or commit and push.

## Notes

* The application executes Git operations through the main Electron process.
* Commit timestamps are set via `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`.
* Pushing will use the active Git remote on the selected repository.
