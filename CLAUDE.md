# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenTranslator is an Electron-based desktop translation application that provides a DeepL-like interface for translating text using various LLM providers (OpenAI, Anthropic, or custom APIs). The app features a clean two-pane interface with source and target text areas, language selection, and settings management.

## Development Commands

```bash
# Start the application in development mode
npm start

# Start with development tools enabled
npm run dev

# Build for distribution
npm run build

# Create distributable packages
npm run dist

# Package without publishing
npm run pack

# Clean build artifacts
npm run clean-dist
```

## Architecture

The application follows a standard Electron architecture with three main processes:

### Main Process (`main.js`)
- Creates and manages application windows (main + settings modal)
- Handles IPC communication between processes
- Manages settings persistence in userData directory
- Implements translation logic with API calls to different providers
- Handles global shortcuts and menu creation

### Renderer Processes
- **Main Window**: `index.html` + `renderer.js` - Translation interface
- **Settings Window**: `settings.html` + `settings.js` - Configuration interface

### Preload Script (`preload.js`)
- Exposes secure APIs to renderer processes via `electronAPI`
- Bridges IPC communication between main and renderer processes

## Key Components

### Translation System
- Supports OpenAI (GPT models), Anthropic (Claude), and custom API endpoints
- Language detection and 13+ language support
- 5000 character limit per translation
- Translation logic centralized in main process for security

### Settings Management
- Settings stored as JSON in Electron's userData directory
- Modal settings window with real-time API testing
- Supports API provider switching with dynamic model selection

### IPC Communication
All renderer-to-main communication happens through exposed APIs:
- `getSettings()` / `saveSettings()` - Settings persistence
- `translateText()` - Main translation function
- `openSettings()` - Settings window management

## File Structure

- `main.js` - Main Electron process and app lifecycle
- `renderer.js` - Main window UI logic (OpenTranslator class)
- `settings.js` - Settings window logic (SettingsManager class)  
- `preload.js` - Secure IPC bridge
- `index.html/settings.html` - UI markup
- `styles.css/settings.css` - Styling

## API Integration

The app integrates with three API types:
- **OpenAI**: Uses chat completions endpoint with various GPT models
- **Anthropic**: Uses messages endpoint with Claude models
- **Custom**: Flexible endpoint supporting OpenAI-compatible responses

All API calls include proper error handling and user feedback through the status bar.