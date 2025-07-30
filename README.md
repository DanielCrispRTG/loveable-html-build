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
- ✅ Camera capture functionality with metadata collection
- ✅ QR code scanning with nimiq/qr-scanner library
- ✅ Cryptographic hashing (SHA-256) with metadata
- ✅ QR code generation for verification
- ✅ Image verification system with local storage
- ✅ Multi-section navigation (Home, Capture, Verify)
- 🔄 Blockchain integration (placeholder for future enhancement)
- 🔄 Advanced verification with external APIs

## Development Notes

The current version includes:
- Complete UI from the original HTML with desktop optimizations
- Full camera capture functionality using WebRTC APIs
- QR code scanning using the nimiq/qr-scanner library
- SHA-256 hash generation with image metadata
- QR code generation for verification sharing
- Local storage for verification records
- Multi-section navigation (Home, Capture, Verify)
- Native macOS menu bar integration
- Proper window management and security configuration

### Integrated Libraries:
1. **Camera Capture**: Based on jserodio/electrocam with enhancements
2. **QR Scanner**: nimiq/qr-scanner - lightweight, high-performance QR scanning
3. **Hash Generation**: Custom SHA-256 implementation with metadata
4. **QR Generation**: Custom QR code generation for verification data

### Current Functionality:
- **Capture Mode**: Access camera, capture photos, generate hashes, create QR codes
- **Verify Mode**: Scan QR codes or manually enter hashes for verification
- **Storage**: Local verification records with image previews
- **Security**: Cryptographic hashing with device metadata for authenticity

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
