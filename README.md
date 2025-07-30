# SnapHashQR Desktop App

A Mac desktop application for secure image verification using blockchain technology, built with Electron.

## Features

- **Secure Image Capture**: Take photos with metadata collection
- **Cryptographic Hashing**: Generate SHA-256 hashes for image verification
- **QR Code Generation**: Create QR codes for easy sharing and verification
- **Blockchain Verification**: Verify image authenticity against blockchain records
- **Native Mac Experience**: Built specifically for macOS with native menu integration

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/DanielCrispRTG/loveable-html-build.git
   cd loveable-html-build
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Running the App
```bash
npm start
```

### Development Mode (with logging)
```bash
npm run dev
```

### Building the App
```bash
npm run build-mac
```

This will create a `.app` file in the `dist` folder that you can distribute.

## Project Structure

```
loveable-html-build/
├── main.js              # Main Electron process
├── index.html           # Main UI (exact replica of original HTML)
├── package.json         # Project configuration
├── README.md           # This file
└── dist/               # Built applications (created after build)
```

## Technologies Used

- **Electron**: Cross-platform desktop app framework
- **HTML5/CSS3**: Modern web technologies for UI
- **JavaScript**: Application logic and interactivity
- **Node.js**: Backend runtime environment

## Features Implementation Status

- ✅ Main UI (exact replica of original HTML)
- ✅ Native macOS menu integration
- ✅ Window management and controls
- 🔄 Camera capture functionality (placeholder implemented)
- 🔄 QR code scanning and generation
- 🔄 Cryptographic hashing (SHA-256)
- 🔄 Blockchain integration
- 🔄 Image verification system

## Development Notes

The current version includes the complete UI from the original HTML with:
- All original styling and animations preserved
- Desktop-optimized interactions (buttons instead of links)
- Native macOS menu bar integration
- Proper window management
- Security-focused Electron configuration

Next development phases will include:
1. Camera access and photo capture
2. Cryptographic hash generation
3. QR code creation and scanning
4. Blockchain integration for verification
5. Local storage for captured images and hashes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Contact

Daniel Crisp - RTG
Project Link: [https://github.com/DanielCrispRTG/loveable-html-build](https://github.com/DanielCrispRTG/loveable-html-build)
