# OpenTranslator

A modern, Electron-based translation application that works with any LLM model. OpenTranslator provides a DeepL-like interface for translation using OpenAI, Anthropic Claude, or custom API endpoints.

## Features

- 🚀 **Multi-Provider Support**: Works with OpenAI GPT models, Anthropic Claude, or custom API endpoints
- 🎨 **Modern UI**: Clean, intuitive interface inspired by DeepL
- ⚡ **Fast Translation**: Real-time translation with keyboard shortcuts
- 🔧 **Customizable**: Configure your preferred API provider and model
- 📋 **Copy to Clipboard**: One-click copy of translated text
- 🌍 **Multiple Languages**: Support for 13+ languages including auto-detection
- 💾 **Settings Persistence**: Your configuration is automatically saved
- ⌨️ **Keyboard Shortcuts**: Quick access with global hotkeys

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd deepl-copy
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Configuration

### API Setup

1. Open the application and click the "Settings" button (or press `Cmd/Ctrl + ,`)
2. Choose your preferred API provider:
   - **OpenAI**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo, GPT-4o
   - **Anthropic**: Claude 3 Haiku, Claude 3 Sonnet, Claude 3 Opus
   - **Custom**: Your own API endpoint

3. Enter your API key and save the settings

### Supported Languages

- Auto-detect
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Japanese
- Korean
- Chinese
- Arabic
- Hindi

## Usage

### Basic Translation

1. Enter text in the source language field
2. Select source and target languages
3. Click "Translate" or press `Cmd/Ctrl + Enter`

### Keyboard Shortcuts

- `Cmd/Ctrl + ,` - Open Settings
- `Cmd/Ctrl + Enter` - Translate text
- `Cmd/Ctrl + Shift + T` - Focus on input field (global shortcut)

### Features

- **Auto-translate**: Enable in settings to translate as you type
- **History**: Save translation history (optional)
- **Character limit**: 5000 characters per translation
- **Language swap**: Quickly swap source and target languages
- **Copy translation**: One-click copy to clipboard

## Development

### Project Structure

```
deepl-copy/
├── main.js              # Main Electron process
├── renderer.js          # Renderer process (main UI)
├── preload.js           # Preload script for IPC
├── settings.js          # Settings window logic
├── index.html           # Main window HTML
├── settings.html        # Settings window HTML
├── styles.css           # Main window styles
├── settings.css         # Settings window styles
└── package.json         # Project configuration
```

### Building

To build the application for distribution:

```bash
npm run build
```

For production builds:

```bash
npm run dist
```

### Development Mode

Run with development tools:

```bash
npm run dev
```

## API Providers

### OpenAI

- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo, GPT-4o
- **API Key**: Get from [OpenAI Platform](https://platform.openai.com/)
- **Endpoint**: `https://api.openai.com/v1/chat/completions`

### Anthropic

- **Models**: Claude 3 Haiku, Claude 3 Sonnet, Claude 3 Opus
- **API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
- **Endpoint**: `https://api.anthropic.com/v1/messages`

### Custom API

- **Format**: Compatible with OpenAI-style API responses
- **Response**: Should return translation in `choices[0].message.content` or `response` field
- **Headers**: Include `Authorization: Bearer <your-api-key>`

## Troubleshooting

### Common Issues

1. **"Not configured" status**
   - Make sure you've entered your API key in settings
   - Verify the API provider is selected

2. **"Connection failed" error**
   - Check your API key is correct
   - Ensure you have sufficient API credits
   - Verify internet connection

3. **Translation not working**
   - Check the console for error messages
   - Verify your API provider is properly configured
   - Ensure the text is within the 5000 character limit

### Debug Mode

To enable debug mode and see detailed error messages:

1. Open Developer Tools (`Cmd/Ctrl + Shift + I`)
2. Check the Console tab for error messages
3. Verify network requests in the Network tab

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by DeepL's clean interface
- Built with Electron for cross-platform compatibility
- Uses modern web technologies for optimal performance

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information about your problem

---

**Note**: This application requires valid API keys from supported providers. Make sure to keep your API keys secure and never share them publicly. 