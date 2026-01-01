# Font Analyzer

A web-based font analysis and comparison tool for inspecting font files, viewing metadata, testing OpenType features, and managing variable font axes.

## Features

### Font Management
- **Drag & Drop**: Load font files by dragging them into the sidebar
- **File Browser**: Browse and select fonts from your file system
- **Font List**: Organized sidebar with font families and individual font files
- **Resizable Sidebar**: Adjustable sidebar width for optimal viewing

### Font Comparison
- **Multiple View Modes**:
  - **Column View**: Side-by-side comparison of selected fonts
  - **Horizontal View**: Split layout with preview on left, metadata on right
  - **Gallery View**: Grid layout for quick visual comparison
- **Dynamic Alignment**: Headers and metadata rows automatically align across columns

### Font Preview
- **Editable Preview Text**: Click to edit and customize preview text
- **Character Counter**: Track character count with 500 character limit
- **Reset Button**: Quickly restore default preview text
- **Fixed Height Panels**: Consistent preview heights with scrolling for overflow

### Font Metadata
- **Basic Information**: Family, subfamily, unique identifier, version, PostScript name
- **Font Properties**: Glyph count, weight class, width class
- **Metrics**: Units per em, italic angle, cap height, x-height, ascender/descender values
- **Miscellaneous**: Additional font table information

### Variable Font Support
- **Axis Controls**: Interactive sliders for weight, width, slant, and custom axes
- **Preset Styles**: Quick selection of named variation instances
- **Snap to Ticks**: Option to snap slider values to defined axis stops
- **Reset to Defaults**: Restore all axes to default values
- **Real-time Preview**: See changes instantly in the preview panel

### OpenType Features
- **Feature Toggle**: Enable/disable OpenType features with visual feedback
- **Feature Grid**: Compact grid view of available features
- **Expanded View**: Detailed list with feature tags and descriptions
- **Feature Count**: Display total number of available features
- **Stylistic Sets**: Support for ss01-ss20 and other stylistic alternates
- **Contextual Features**: Access to calt, ccmp, and other contextual alternates

### User Interface
- **Card-Based Design**: Clean, modular card layout for all sections
- **Collapsible Sections**: Expand/collapse metadata sections as needed
- **Responsive Layout**: Adapts to different screen sizes
- **Modern Styling**: OKLCH color system with consistent design tokens

## Usage

### Loading Fonts

1. **Drag & Drop**: Drag font files (`.ttf`, `.otf`, `.woff`, `.woff2`) into the sidebar
2. **Browse Button**: Click "Browse Fonts" in the sidebar to select files from your system
3. **Multiple Selection**: Select multiple fonts to compare side-by-side

### Comparing Fonts

1. Select fonts from the sidebar to add them to the comparison view
2. Choose a view mode (Column, Horizontal, or Gallery) from the header controls
3. Scroll through metadata sections to compare properties across fonts

### Using Variable Font Controls

1. Click the "VF" badge on a variable font to enable variable font mode
2. Adjust axis sliders to change weight, width, slant, or other axes
3. Use "Snap to Ticks" for precise axis value selection
4. Select a preset style from the dropdown for quick variations
5. Click "Reset to Defaults" to restore original axis values

### Testing OpenType Features

1. Click the "O" badge on a font with OpenType features
2. Toggle features on/off by clicking feature cards
3. See changes reflected immediately in the preview text
4. Hover over features for detailed descriptions

### Editing Preview Text

1. Click on the preview text area to edit
2. Type custom text to test the font
3. Character counter shows current count (limit: 500 characters)
4. Click "Reset" to restore default preview text

## Technical Details

### Dependencies

- **opentype.js**: Font parsing and OpenType feature support
- **@pdf-lib/fontkit**: Font file reading and metadata extraction
- **SortableJS**: Drag and drop functionality for font list

### Browser Support

Modern browsers with support for:
- ES6+ JavaScript
- CSS Grid and Flexbox
- File API
- Drag and Drop API

### File Structure

```
Fontsite/
├── index.html          # Main HTML structure
├── css/
│   ├── base.css                    # Base styles and resets
│   ├── variables.css               # Design tokens and spacing
│   ├── OKLCH-color-variables.css   # Color system (OKLCH)
│   ├── layouts.css                 # Layout utilities
│   ├── components.css              # Component styles
│   └── utilities.css               # Utility classes
└── js/
    └── script.js                   # Main application logic
```

### Key Technologies

- **Vanilla JavaScript**: No framework dependencies
- **CSS Custom Properties**: Design token system
- **OKLCH Colors**: Modern color space for consistent theming
- **Modular CSS**: Organized by component and function

## Development

### Running Locally

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No build process required - works directly from file system

### Code Organization

The JavaScript is organized into clear sections:
- Icons and utilities
- Font loading and parsing
- UI rendering functions
- Event handlers
- Variable font controls
- OpenType feature management
- Metadata extraction and display

## License

This project is part of the Good Font Scripts collection.

