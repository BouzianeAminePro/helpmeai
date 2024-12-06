# Helpmeai Chrome Extension

## Overview

Helpmeai is a Chrome extension designed to enhance your daily interactions with AI. It allows users to generate prompts, copy responses, and clear messages seamlessly. The extension communicates with a local server to fetch AI-generated responses based on user input.

## Features

- **Generate Prompts**: Users can generate prompts using predefined types.
- **Copy Responses**: Easily copy AI responses to the clipboard.
- **Clear Messages**: Clear the current message and response with a single click.
- **Real-time Updates**: The extension listens for changes in local storage to update the UI dynamically.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/helpmeai-extension.git
   cd helpmeai-extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top right corner.
   - Click on "Load unpacked" and select the directory where the extension files are located.

## Usage

- After installing the extension, you will see a button in the top right corner of your browser.
- Click the button to open the popup interface.
- Enter your message and select a prompt type to generate a response.
- Use the "Copy" button to copy the response to your clipboard.
- Click "Clear" to reset the message and response fields.

## Files Structure

- `src/App.jsx`: Main React component for the extension's popup interface.
- `public/content.js`: Content script that interacts with web pages.
- `public/background.js`: Background script that handles messages and storage.
- `public/manifest.json`: Configuration file for the Chrome extension.

## Dependencies

- React
- Chrome APIs

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the open-source community for their contributions and support.
