# Fontsite

A web-based font comparison and analysis tool for examining font metadata, variable font axes, and OpenType features.

## Overview

Fontsite is a browser-based application that allows you to load, compare, and analyze font files. It provides detailed metadata inspection, variable font control, and OpenType feature exploration in an intuitive interface.

## Features

- **Drag-and-Drop Support**: Drop individual font files or entire directories
- **Directory Browsing**: Browse and load fonts from directories using the File System Access API
- **Multiple View Modes**:
  - **Column View**: Full detail panels with all metadata
  - **Gallery View**: Compact grid of font previews
  - **Horizontal View**: Preview pane with customizable metadata fields
- **Variable Font Controls**: Interactive sliders for adjusting variable font axes
- **OpenType Features**: Explore and toggle OpenType features with detailed descriptions
- **Family Grouping**: Fonts automatically grouped by family name with collapsible sections
- **Star Selection**: Quick selection for comparison using star buttons
- **Editable Preview**: In-place text editing with synchronized preview across all fonts

## Usage

1. **Load Fonts**:
   - Drag and drop font files (TTF, OTF, WOFF, WOFF2) onto the drop zone
   - Or click "Browse" to select files or directories
   - Use Shift+Click on Browse for directory selection

2. **Select Fonts for Comparison**:
   - Click the star button (☆) to select fonts
   - Or click directly on font items
   - Selected fonts appear in the comparison view

3. **Explore Fonts**:
   - Click the VF badge to access variable font controls
   - Click the OT badge to explore OpenType features
   - Use view mode buttons to switch between Column, Horizontal, and Gallery views

4. **Edit Preview Text**:
   - Click in the preview pane to edit text
   - Changes sync across all displayed fonts
   - Use the Reset button to restore default text

## Technology Stack

- **HTML5/CSS3/JavaScript**: Pure client-side application
- **Fontkit**: Font parsing and metadata extraction (via CDN)
- **File System Access API**: Directory browsing support (Chrome/Edge)

## Browser Requirements

- Modern browser with File System Access API support (Chrome 86+, Edge 86+)
- For directory support: Chrome/Edge recommended
- Other browsers can still use file selection (no directory support)

## File Support

- TTF (TrueType)
- OTF (OpenType)
- WOFF (Web Open Font Format)
- WOFF2 (Web Open Font Format 2)

## Project Structure

```
Fontsite/
├── index.html      # Main HTML structure
├── styles.css      # All styling and layout
├── script.js       # Application logic and font processing
└── README.md       # This file
```

## Development

No build process required - open `index.html` directly in a browser or serve via a local web server.

## License

See repository for license information.

