let fonts = [];
let selectedIndices = new Set();
let fontFaceStyleElements = [];
let collapsedSections = new Set();
let variableMode = new Set(); // Column indices in variable mode
let otMode = new Set(); // Column indices in OpenType features mode
let expandedFamilies = new Set(); // Which family groups are expanded
let currentVariations = {}; // Track axis values per column: { columnIndex: { "wght": 400, ... } }
let activeFeatures = {}; // Track active features per column: { columnIndex: Set(['liga', 'kern']) }
let viewMode = localStorage.getItem('fontAnalyzer_viewMode') || 'column'; // 'column', 'gallery', or 'horizontal'
let horizontalMetadataFields = JSON.parse(localStorage.getItem('fontAnalyzer_horizontalFields') || '["family", "subfamily", "glyphs", "weightClass", "format", "size"]');
let lastDirectoryHandle = null;
let familyOrder = []; // Custom order for family groups

// OpenType feature descriptions
const FEATURE_DESCRIPTIONS = {
    'liga': {
        name: 'Standard Ligatures',
        description: 'Replaces character pairs with ligatures (e.g., fi, fl)'
    },
    'dlig': {
        name: 'Discretionary Ligatures',
        description: 'Optional stylistic ligatures'
    },
    'hlig': {
        name: 'Historical Ligatures',
        description: 'Ligatures used historically'
    },
    'clig': {
        name: 'Contextual Ligatures',
        description: 'Context-dependent ligatures'
    },
    'kern': {
        name: 'Kerning',
        description: 'Adjusts spacing between character pairs'
    },
    'calt': {
        name: 'Contextual Alternates',
        description: 'Context-dependent character substitutions'
    },
    'swsh': {
        name: 'Swash',
        description: 'Decorative character variants'
    },
    'cswh': {
        name: 'Contextual Swash',
        description: 'Context-dependent swash variants'
    },
    'salt': {
        name: 'Stylistic Alternates',
        description: 'Alternative character forms'
    },
    'nalt': {
        name: 'Alternate Annotation Forms',
        description: 'Alternative number forms'
    },
    'frac': {
        name: 'Fractions',
        description: 'Converts numbers to fraction glyphs'
    },
    'afrc': {
        name: 'Alternative Fractions',
        description: 'Alternative fraction forms'
    },
    'ordn': {
        name: 'Ordinals',
        description: 'Converts numbers to ordinal forms'
    },
    'sups': {
        name: 'Superscript',
        description: 'Raises characters above baseline'
    },
    'subs': {
        name: 'Subscript',
        description: 'Lowers characters below baseline'
    },
    'sinf': {
        name: 'Scientific Inferiors',
        description: 'Scientific notation subscripts'
    },
    'numr': {
        name: 'Numerators',
        description: 'Numerator forms in fractions'
    },
    'dnom': {
        name: 'Denominators',
        description: 'Denominator forms in fractions'
    },
    'onum': {
        name: 'Oldstyle Figures',
        description: 'Numerals with varying heights'
    },
    'lnum': {
        name: 'Lining Figures',
        description: 'Numerals uniform in height'
    },
    'pnum': {
        name: 'Proportional Figures',
        description: 'Numerals with variable widths'
    },
    'tnum': {
        name: 'Tabular Figures',
        description: 'Numerals with equal widths'
    },
    'smcp': {
        name: 'Small Capitals',
        description: 'Lowercase letters as small caps'
    },
    'c2sc': {
        name: 'Small Capitals From Capitals',
        description: 'Converts capitals to small caps'
    },
    'pcap': {
        name: 'Petite Capitals',
        description: 'Smaller variant of small caps'
    },
    'c2pc': {
        name: 'Petite Capitals From Capitals',
        description: 'Converts capitals to petite caps'
    },
    'unic': {
        name: 'Unicase',
        description: 'Single case form combining upper and lower'
    },
    'titl': {
        name: 'Titling',
        description: 'Uppercase forms designed for all-caps'
    },
    'zero': {
        name: 'Slashed Zero',
        description: 'Zero with diagonal slash'
    },
    'aalt': {
        name: 'Access All Alternates',
        description: 'Access to all alternates'
    },
    'ccmp': {
        name: 'Glyph Composition/Decomposition',
        description: 'Character composition'
    },
    'locl': {
        name: 'Localized Forms',
        description: 'Localized character variants'
    },
    'mark': {
        name: 'Mark Positioning',
        description: 'Positioning for combining marks'
    },
    'mkmk': {
        name: 'Mark to Mark Positioning',
        description: 'Positioning between marks'
    },
    'rtlm': {
        name: 'Right-to-Left',
        description: 'Right-to-left text direction'
    },
    'vert': {
        name: 'Vertical Writing',
        description: 'Vertical text orientation'
    },
    'vrt2': {
        name: 'Vertical Alternates and Rotation',
        description: 'Vertical character variants'
    },
    'ss01': {
        name: 'Stylistic Set 1',
        description: 'First set of stylistic alternates'
    },
    'ss02': {
        name: 'Stylistic Set 2',
        description: 'Second set of stylistic alternates'
    },
    'ss03': {
        name: 'Stylistic Set 3',
        description: 'Third set of stylistic alternates'
    },
    'ss04': {
        name: 'Stylistic Set 4',
        description: 'Fourth set of stylistic alternates'
    },
    'ss05': {
        name: 'Stylistic Set 5',
        description: 'Fifth set of stylistic alternates'
    },
    'ss06': {
        name: 'Stylistic Set 6',
        description: 'Sixth set of stylistic alternates'
    },
    'ss07': {
        name: 'Stylistic Set 7',
        description: 'Seventh set of stylistic alternates'
    },
    'ss08': {
        name: 'Stylistic Set 8',
        description: 'Eighth set of stylistic alternates'
    },
    'ss09': {
        name: 'Stylistic Set 9',
        description: 'Ninth set of stylistic alternates'
    },
    'ss10': {
        name: 'Stylistic Set 10',
        description: 'Tenth set of stylistic alternates'
    },
    'ss11': {
        name: 'Stylistic Set 11',
        description: 'Eleventh set of stylistic alternates'
    },
    'ss12': {
        name: 'Stylistic Set 12',
        description: 'Twelfth set of stylistic alternates'
    },
    'ss13': {
        name: 'Stylistic Set 13',
        description: 'Thirteenth set of stylistic alternates'
    },
    'ss14': {
        name: 'Stylistic Set 14',
        description: 'Fourteenth set of stylistic alternates'
    },
    'ss15': {
        name: 'Stylistic Set 15',
        description: 'Fifteenth set of stylistic alternates'
    },
    'ss16': {
        name: 'Stylistic Set 16',
        description: 'Sixteenth set of stylistic alternates'
    },
    'ss17': {
        name: 'Stylistic Set 17',
        description: 'Seventeenth set of stylistic alternates'
    },
    'ss18': {
        name: 'Stylistic Set 18',
        description: 'Eighteenth set of stylistic alternates'
    },
    'ss19': {
        name: 'Stylistic Set 19',
        description: 'Nineteenth set of stylistic alternates'
    },
    'ss20': {
        name: 'Stylistic Set 20',
        description: 'Twentieth set of stylistic alternates'
    }
};

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.className = 'file-input';
fileInput.multiple = true;
fileInput.accept = '.ttf,.otf,.woff,.woff2';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

const fontList = document.getElementById('fontList');
const status = document.getElementById('status');
const comparisonWrapper = document.getElementById('comparisonWrapper');
const comparisonGrid = document.getElementById('comparisonGrid');
const emptyState = document.getElementById('emptyState');
const selectionInfo = document.getElementById('selectionInfo');
const sidebar = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resizeHandle');
const clearAllBtn = document.getElementById('clearAllBtn');

// Preview text state (replaces textarea)
const defaultPreviewText = `The quick brown fox
ABCDEFGHIJKLM
abcdefghijklm
0123456789`;
let previewText = defaultPreviewText;

// Check if File System Access API is supported
const isFileSystemAccessAPISupported = 'showDirectoryPicker' in window;

// Drag and drop handlers - make entire sidebar a drop zone
sidebar.addEventListener('dragover', (e) => {
    // Only handle file drops, not font item drags
    if (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.includes('application/x-moz-file')) {
        e.preventDefault();
        sidebar.classList.add('drag-over');
    }
});

sidebar.addEventListener('dragleave', (e) => {
    // Only remove drag-over if we're leaving the sidebar
    if (!sidebar.contains(e.relatedTarget)) {
        sidebar.classList.remove('drag-over');
    }
});

sidebar.addEventListener('drop', async (e) => {
    // Skip if this is a font item drag - let document handler deal with it
    if (draggedFontIndex !== null) {
        return;
    }
    
    // Only handle file drops, not font item drags
    if (!e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/x-moz-file')) {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    sidebar.classList.remove('drag-over');
    
    // Try to use File System Access API if available (for directory support)
    if (isFileSystemAccessAPISupported && e.dataTransfer.items) {
        const files = [];
        
        for (const item of e.dataTransfer.items) {
            try {
                const handle = await item.getAsFileSystemHandle();
                
                if (handle) {
                    if (handle.kind === 'directory') {
                        // Process directory recursively
                        const dirFiles = await processDirectoryRecursively(handle);
                        files.push(...dirFiles);
                    } else if (handle.kind === 'file') {
                        // Get the file
                        const file = await handle.getFile();
                        files.push(file);
                    }
                }
            } catch (error) {
                // If getAsFileSystemHandle fails, fall back to regular file handling
                console.warn('Error getting file system handle:', error);
            }
        }
        
        if (files.length > 0) {
            handleFiles(files);
            return;
        }
    }
    
    // Fallback to traditional file list (for files or browsers without API support)
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Unified browse handler - supports both files and directories
async function browseFonts(event) {
    // Prevent default and stop propagation
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // If File System Access API is available, show menu to choose
    if (isFileSystemAccessAPISupported) {
        const choice = await showBrowseMenu(event);
        if (choice === 'directory') {
            await browseDirectory();
        } else if (choice === 'files') {
            // Use modern file picker
            try {
                const fileHandles = await window.showOpenFilePicker({
                    multiple: true,
                    types: [{
                        description: 'Font files',
                        accept: {
                            'font/ttf': ['.ttf'],
                            'font/otf': ['.otf'],
                            'font/woff': ['.woff'],
                            'font/woff2': ['.woff2']
                        }
                    }]
                });
                
                const files = await Promise.all(
                    fileHandles.map(handle => handle.getFile())
                );
                handleFiles(files);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error selecting files:', error);
                    // Fallback to traditional file input
                    fileInput.click();
                }
            }
        }
        // If user cancelled menu, do nothing
    } else {
        // Fallback to traditional file input
        fileInput.click();
    }
}

// Show a simple menu to choose between files and directory
async function showBrowseMenu(event) {
    return new Promise((resolve) => {
        const menu = document.createElement('div');
        menu.className = 'browse-menu';
        
        // Find the button that was clicked
        const browseBtn = event ? event.target.closest('button') : null;
        if (browseBtn) {
            const rect = browseBtn.getBoundingClientRect();
            menu.style.left = `${rect.left}px`;
            menu.style.top = `${rect.bottom + 4}px`;
        } else {
            // Fallback: position near top of sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const rect = sidebar.getBoundingClientRect();
                menu.style.left = `${rect.left + 20}px`;
                menu.style.top = `${rect.top + 100}px`;
            }
        }
        
        const filesOption = document.createElement('div');
        filesOption.className = 'browse-menu-option';
        filesOption.textContent = 'Select Font Files';
        filesOption.onclick = (e) => {
            e.stopPropagation();
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
            resolve('files');
        };
        
        const dirOption = document.createElement('div');
        dirOption.className = 'browse-menu-option';
        dirOption.textContent = 'Select Font Directory';
        dirOption.onclick = (e) => {
            e.stopPropagation();
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
            resolve('directory');
        };
        
        menu.appendChild(filesOption);
        menu.appendChild(dirOption);
        document.body.appendChild(menu);
        
        // Close menu on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== browseBtn) {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
                resolve(null);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    });
}

// IndexedDB functions for directory handle persistence
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FontAnalyzerDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
        };
    });
}

async function saveDirectoryHandle(handle) {
    try {
        const db = await openDB();
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        await store.put(handle, 'lastDirectory');
        lastDirectoryHandle = handle;
    } catch (error) {
        console.warn('Could not save directory handle:', error);
    }
}

async function loadDirectoryHandle() {
    try {
        const db = await openDB();
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('lastDirectory');
        
        return new Promise((resolve) => {
            request.onsuccess = async () => {
                const handle = request.result;
                if (handle) {
                    // Verify permission
                    try {
                        const permission = await handle.queryPermission({ mode: 'read' });
                        if (permission === 'granted') {
                            lastDirectoryHandle = handle;
                            resolve(handle);
                            return;
                        }
                    } catch (e) {
                        // Handle might be stale
                    }
                }
                resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    } catch (error) {
        return null;
    }
}

// Browse directory handler
async function browseDirectory() {
    if (!isFileSystemAccessAPISupported) {
        showStatus('Directory browsing is not supported in this browser. Please use drag and drop or browse individual files.', 'error');
        return;
    }
    
    try {
        // Try to use last directory if available
        let directoryHandle;
        
        if (lastDirectoryHandle) {
            try {
                const permission = await lastDirectoryHandle.requestPermission({ mode: 'read' });
                if (permission === 'granted') {
                    directoryHandle = lastDirectoryHandle;
                } else {
                    directoryHandle = await window.showDirectoryPicker();
                }
            } catch (e) {
                // User denied or handle invalid, show picker
                directoryHandle = await window.showDirectoryPicker();
            }
        } else {
            directoryHandle = await window.showDirectoryPicker();
        }
        
        // Save for next time
        await saveDirectoryHandle(directoryHandle);
        
        showStatus('Scanning directory for font files...');
        
        const files = await processDirectoryRecursively(directoryHandle);
        
        if (files.length === 0) {
            showStatus('No valid font files found in directory', 'error');
            return;
        }
        
        handleFiles(files);
    } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
            console.error('Error browsing directory:', error);
            showStatus('Error accessing directory', 'error');
        }
    }
}

// Make browseFonts globally accessible
window.browseFonts = browseFonts;

// Reset preview text function
function resetPreviewText() {
    previewText = defaultPreviewText;
    // Update all preview panes
    document.querySelectorAll('.preview-text[contenteditable="true"]').forEach(preview => {
        preview.textContent = previewText;
    });
}

// Make resetPreviewText globally accessible
window.resetPreviewText = resetPreviewText;

// View mode toggle functions
function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem('fontAnalyzer_viewMode', mode);
    updateViewModeUI();
    if (selectedIndices.size > 0) {
        updateComparison();
    }
}

function updateViewModeUI() {
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === viewMode);
    });
    const modeNames = {
        'column': 'Column',
        'gallery': 'Gallery',
        'horizontal': 'Horizontal'
    };
    if (selectedIndices.size > 0) {
        selectionInfo.textContent = `${selectedIndices.size} font(s) selected • ${modeNames[viewMode]} View`;
    } else {
        selectionInfo.textContent = 'Select fonts to compare';
    }
}

// Initialize view mode UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateViewModeUI();
    });
} else {
    updateViewModeUI();
}

// Make preview text functions globally accessible
window.setViewMode = setViewMode;

// Re-align rows on window resize
window.addEventListener('resize', () => {
    if (selectedIndices.size > 0) {
        alignMetadataRows();
        // Re-render in gallery mode to update column count
        if (viewMode === 'gallery') {
            updateComparison();
        }
    }
});

// Recursively process directory and extract all font files
async function processDirectoryRecursively(directoryHandle) {
    const fontFiles = [];
    const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    
    async function traverseDirectory(dirHandle, path = '') {
        try {
            for await (const [name, handle] of dirHandle.entries()) {
                const currentPath = path ? `${path}/${name}` : name;
                
                if (handle.kind === 'directory') {
                    // Recursively process subdirectories
                    await traverseDirectory(handle, currentPath);
                } else if (handle.kind === 'file') {
                    // Check if file is a font file
                    const ext = name.toLowerCase();
                    if (fontExtensions.some(extSuffix => ext.endsWith(extSuffix))) {
                        try {
                            const file = await handle.getFile();
                            fontFiles.push(file);
                        } catch (error) {
                            console.error(`Error reading file ${currentPath}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error traversing directory ${path}:`, error);
        }
    }
    
    await traverseDirectory(directoryHandle);
    return fontFiles;
}

async function handleFiles(fileList) {
    const files = Array.from(fileList).filter(file => {
        const ext = file.name.toLowerCase();
        return ext.endsWith('.ttf') || ext.endsWith('.otf') ||
               ext.endsWith('.woff') || ext.endsWith('.woff2');
    });

    if (files.length === 0) {
        showStatus('No valid font files found', 'error');
        return;
    }

    showStatus(`Processing ${files.length} font file(s)...`);

    for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const font = fontkit.create(arrayBuffer);

            // Extract comprehensive metadata
            const metadata = extractMetadata(font, file);

            fonts.push({
                id: `font_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...metadata,
                font: font,
                file: file,
                assignedFamily: null // User-assigned family override
            });
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
        }
    }

    if (fonts.length > 0) {
        showStatus(`Successfully loaded ${fonts.length} font(s)`, 'success');
        // Auto-expand families for newly loaded fonts
        fonts.forEach(font => {
            const family = extractFamilyName(font, font.filename);
            expandedFamilies.add(family);
        });
        renderFontList();
    } else {
        showStatus('Failed to load any fonts', 'error');
    }
}

// Helper function to safely extract numeric values (handles 0 correctly)
function getNumericValue(obj, ...propertyNames) {
    if (!obj) return null;
    for (const prop of propertyNames) {
        const value = obj[prop];
        if (value != null) return value;
    }
    return null;
}

// Helper function to format numeric or null value
function formatNumericValue(value) {
    return value != null ? value : 'N/A';
}

function extractNameTableEntries(font) {
    const entries = {};
    // Initialize all entries to null
    [1, 2, 3, 4, 5, 6, 16, 17].forEach(nameID => {
        entries[nameID] = null;
    });
    
    if (font.name) {
        // Fontkit processes name table and stores in records object
        // Structure: font.name.records[nameID][language] = string
        // Or: font.name.records[NAMES[nameID]][language] = string
        const nameMap = {
            1: 'fontFamily',
            2: 'fontSubfamily',
            3: 'uniqueSubfamily',
            4: 'fullName',
            5: 'version',
            6: 'postscriptName',
            16: 'preferredFamily',
            17: 'preferredSubfamily'
        };
        
        // Try accessing via processed records object
        if (font.name.records) {
            [1, 2, 3, 4, 5, 6, 16, 17].forEach(nameID => {
                const nameKey = nameMap[nameID];
                if (nameKey && font.name.records[nameKey]) {
                    // Try English first
                    const enValue = font.name.records[nameKey]['en'] || 
                                   font.name.records[nameKey]['en-US'] ||
                                   font.name.records[nameKey]['English'];
                    if (enValue) {
                        entries[nameID] = enValue;
                    } else {
                        // Try any language
                        const languages = Object.keys(font.name.records[nameKey]);
                        if (languages.length > 0) {
                            entries[nameID] = font.name.records[nameKey][languages[0]];
                        }
                    }
                }
                // Also try direct numeric key
                if (!entries[nameID] && font.name.records[nameID]) {
                    const enValue = font.name.records[nameID]['en'] || 
                                   font.name.records[nameID]['en-US'] ||
                                   font.name.records[nameID]['English'];
                    if (enValue) {
                        entries[nameID] = enValue;
                    } else {
                        const languages = Object.keys(font.name.records[nameID]);
                        if (languages.length > 0) {
                            entries[nameID] = font.name.records[nameID][languages[0]];
                        }
                    }
                }
            });
        }
        
        // Fallback: Try font.name.names array (raw records)
        if (font.name.names && Array.isArray(font.name.names)) {
            [1, 2, 3, 4, 5, 6, 16, 17].forEach(nameID => {
                if (!entries[nameID]) {
                    // Try Windows first (platformID 3, encodingID 1)
                    let record = font.name.names.find(n => 
                        n.nameID === nameID && 
                        n.platformID === 3 && 
                        (n.encodingID === 1 || n.encodingID === 10)
                    );
                    // Fallback to Mac (platformID 1, encodingID 0)
                    if (!record) {
                        record = font.name.names.find(n => 
                            n.nameID === nameID && 
                            n.platformID === 1 && 
                            n.encodingID === 0
                        );
                    }
                    // Fallback to any record with this nameID
                    if (!record) {
                        record = font.name.names.find(n => n.nameID === nameID);
                    }
                    if (record) {
                        try {
                            if (record.toUnicode) {
                                entries[nameID] = record.toUnicode();
                            } else if (record.string) {
                                entries[nameID] = typeof record.string === 'string' ? record.string : String(record.string);
                            }
                        } catch (e) {
                            // Keep null
                        }
                    }
                }
            });
        }
        
        // Final fallback: Try direct properties
        if (!entries[1] && font.name.familyName) entries[1] = font.name.familyName;
        if (!entries[2] && font.name.subfamilyName) entries[2] = font.name.subfamilyName;
        if (!entries[4] && font.name.fullName) entries[4] = font.name.fullName;
        if (!entries[6] && font.name.postscriptName) entries[6] = font.name.postscriptName;
    }
    
    return entries;
}

function extractFsSelectionBits(font) {
    const os2 = font['OS/2'];
    if (!os2) return {};
    
    // Fontkit processes fsSelection as a bitfield with named properties
    // According to fontkit OS2.js: ['italic', 'underscore', 'negative', 'outlined', 'strikeout', 'bold', 'regular', 'useTypoMetrics', 'wws', 'oblique']
    // So bit 0 = italic, bit 5 = bold, bit 6 = regular, bit 7 = useTypoMetrics, bit 8 = wws
    
    // Try accessing as object properties first (fontkit may expose them directly)
    if (os2.fsSelection && typeof os2.fsSelection === 'object') {
        return {
            isItalic: !!(os2.fsSelection.italic),
            isBold: !!(os2.fsSelection.bold),
            isRegular: !!(os2.fsSelection.regular),
            useTypoMetrics: !!(os2.fsSelection.useTypoMetrics),
            wws: !!(os2.fsSelection.wws)
        };
    }
    
    // Fallback: interpret as numeric bitfield
    const fsSelection = typeof os2.fsSelection === 'number' ? os2.fsSelection : 0;
    return {
        isItalic: !!(fsSelection & 0x01),      // bit 0
        isBold: !!(fsSelection & 0x20),        // bit 5
        isRegular: !!(fsSelection & 0x40),    // bit 6
        useTypoMetrics: !!(fsSelection & 0x80), // bit 7
        wws: !!(fsSelection & 0x100)          // bit 8
    };
}

function interpretFsType(fsType) {
    if (fsType === undefined || fsType === null) return 'N/A';
    const restrictions = [];
    if (fsType & 0x0002) restrictions.push('Restricted License');
    if (fsType & 0x0004) restrictions.push('Preview & Print');
    if (fsType & 0x0008) restrictions.push('Editable');
    if (fsType & 0x0010) restrictions.push('No Subsetting');
    if (fsType & 0x0020) restrictions.push('Bitmap Only');
    return restrictions.length > 0 ? restrictions.join(', ') : 'Installable';
}

function extractMetadata(font, file) {
    const tables = font._src?.tables || {};
    const name = font.name;
    const os2 = font['OS/2'];
    const head = font.head;
    const hhea = font.hhea;
    const post = font.post;

    // Extract name table entries
    const nameTableEntries = extractNameTableEntries(font);

    // Extract OS/2 values with fallback property names
    const capHeight = getNumericValue(os2, 'capHeight', 'sCapHeight', 'sCapheight');
    const xHeight = getNumericValue(os2, 'xHeight', 'sxHeight', 'sxheight');
    const typoAscender = getNumericValue(os2, 'ascent', 'sTypoAscender', 'typoAscender');
    const typoDescender = getNumericValue(os2, 'descent', 'sTypoDescender', 'typoDescender');
    const typoLineGap = getNumericValue(os2, 'lineGap', 'sTypoLineGap', 'typoLineGap');
    const winAscent = getNumericValue(os2, 'winAscent', 'usWinAscent');
    const winDescent = getNumericValue(os2, 'winDescent', 'usWinDescent');
    const weightClass = getNumericValue(os2, 'weightClass', 'usWeightClass');
    const widthClass = getNumericValue(os2, 'widthClass', 'usWidthClass');
    const vendorID = os2?.vendID || os2?.vendorID || null;
    
    // Extract fsSelection bits
    const fsSelectionBits = extractFsSelectionBits(font);
    
    // Extract fsType
    const fsType = os2?.fsType !== undefined ? os2.fsType : null;
    const fsTypeInterpreted = interpretFsType(fsType);
    
    // Extract strikeout metrics from OS/2
    const strikeoutPosition = getNumericValue(os2, 'yStrikeoutPosition', 'strikeoutPosition');
    const strikeoutSize = getNumericValue(os2, 'yStrikeoutSize', 'strikeoutSize');
    
    // Check if font is fixed pitch (from post table)
    const isFixedPitch = post?.isFixedPitch || false;

    // Extract features to check if font has OpenType features
    const features = extractOpenTypeFeatures(font);
    const hasOpenTypeFeatures = features && features.length > 0;

    return {
        // Basic info
        filename: file.name,
        family: font.familyName ?? 'Unknown',
        subfamily: font.subfamilyName ?? 'Regular',
        fullName: font.fullName ?? 'N/A',
        postscriptName: font.postscriptName ?? 'N/A',
        version: font.version ?? 'Unknown',
        copyright: font.copyright ?? 'N/A',
        
        // Name table entries (for Basic Information section)
        nameTableEntries: nameTableEntries,
        vendorID: vendorID,

        // Format and size (for header display)
        format: font.type ?? getFormatFromFilename(file.name),
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        
        // Fixed pitch flag
        isFixedPitch: isFixedPitch,

        // Metrics
        unitsPerEm: formatNumericValue(font.unitsPerEm),
        ascent: formatNumericValue(font.ascent),
        descent: formatNumericValue(font.descent),
        lineGap: formatNumericValue(font.lineGap),
        capHeight: formatNumericValue(capHeight),
        xHeight: formatNumericValue(xHeight),

        // Additional metrics
        typoAscender: formatNumericValue(typoAscender),
        typoDescender: formatNumericValue(typoDescender),
        typoLineGap: formatNumericValue(typoLineGap),
        winAscent: formatNumericValue(winAscent),
        winDescent: formatNumericValue(winDescent),

        // Font Properties
        glyphs: font.numGlyphs ?? 0,
        weightClass: formatNumericValue(weightClass),
        widthClass: formatNumericValue(widthClass),
        
        // Metrics
        italicAngle: formatNumericValue(post?.italicAngle),
        underlineThickness: formatNumericValue(post?.underlineThickness),
        underlinePosition: formatNumericValue(post?.underlinePosition),
        strikeoutPosition: formatNumericValue(strikeoutPosition),
        strikeoutSize: formatNumericValue(strikeoutSize),
        
        // Miscellaneous
        fsSelectionBits: fsSelectionBits,
        fsType: fsType,
        fsTypeInterpreted: fsTypeInterpreted,

        // Font tables
        availableTables: Object.keys(tables),

        // OpenType features
        features: features,
        hasOpenTypeFeatures: hasOpenTypeFeatures,

        // Variable font info
        variableAxes: extractVariableAxes(font),
        isVariable: isVariableFont(font),
        namedVariations: extractNamedVariations(font)
    };
}

// Helper function to check if font is variable
function isVariableFont(font) {
    if (!font) return false;
    // Check if variationAxes exists and has entries
    if (font.variationAxes && Object.keys(font.variationAxes).length > 0) {
        return true;
    }
    // Fallback: check for fvar table
    const tables = font._src?.tables || {};
    return tables.fvar !== undefined;
}

// Helper function to extract and clean family name
function extractFamilyName(fontData, filename) {
    // Priority 0: Assigned family (user-moved font to different family)
    if (fontData && fontData.assignedFamily) {
        return fontData.assignedFamily;
    }
    
    // Priority 1: Name ID 16 (preferred family name) if available
    if (fontData && fontData.nameTableEntries && fontData.nameTableEntries[16] && fontData.nameTableEntries[16] !== 'Unknown') {
        return fontData.nameTableEntries[16];
    }
    
    // Priority 2: Name ID 1 (family name) if available and not 'Unknown'
    if (fontData && fontData.family && fontData.family !== 'Unknown') {
        return fontData.family;
    }
    
    // Priority 3: Parse filename (first hyphen as delimiter)
    const nameWithoutExt = filename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    const firstHyphenIndex = nameWithoutExt.indexOf('-');
    if (firstHyphenIndex > 0) {
        return nameWithoutExt.substring(0, firstHyphenIndex);
    }
    
    return 'Ungrouped';
}

// Group fonts by family name
function groupFontsByFamily(fonts) {
    const groups = {};
    
    fonts.forEach((font, index) => {
        const family = extractFamilyName(font, font.filename);
        if (!groups[family]) {
            groups[family] = [];
        }
        groups[family].push({ font, index });
    });
    
    // Sort families alphabetically, but 'Ungrouped' always last
    const sorted = {};
    Object.keys(groups)
        .sort((a, b) => {
            if (a === 'Ungrouped') return 1;
            if (b === 'Ungrouped') return -1;
            return a.localeCompare(b);
        })
        .forEach(key => {
            sorted[key] = groups[key];
        });
    
    return sorted;
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractFeatureWithLabel(font, featureTag, featureRecord) {
    let label = null;
    let uinameid = null;
    
    // Check for FeatureParams with UINameID in GSUB
    if (font.GSUB && font.GSUB.featureList) {
        const featureList = font.GSUB.featureList;
        const feature = featureList[featureTag];
        
        if (feature) {
            // Try to access FeatureParams - fontkit might store it differently
            if (feature.FeatureParams && feature.FeatureParams.UINameID) {
                uinameid = feature.FeatureParams.UINameID;
            } else if (feature.featureParams && feature.featureParams.uinameid) {
                uinameid = feature.featureParams.uinameid;
            }
            
            // Look up in name table
            if (uinameid && font.name) {
                try {
                    const nameRecords = font.name.names || [];
                    const nameRecord = nameRecords.find(n => n.nameID === uinameid);
                    if (nameRecord && nameRecord.toUnicode) {
                        label = nameRecord.toUnicode();
                    }
                } catch (e) {
                    // Name table access might fail
                }
            }
        }
    }
    
    // Fallback for stylistic sets
    if (featureTag.match(/^ss\d{2}$/) && !label) {
        const ssNum = parseInt(featureTag.slice(2));
        label = `Stylistic Set ${ssNum}`;
    }
    
    return { tag: featureTag, label, uinameid };
}

function extractOpenTypeFeatures(font) {
    const features = []; // Array of { tag, label, uinameid }
    const featureSet = new Set();
    
    try {
        // Debug: log what's available on the font object
        // console.log('Font object keys:', Object.keys(font));
        // console.log('Font.GSUB:', font.GSUB);
        // console.log('Font.GPOS:', font.GPOS);
        
        // Method 1: Try fontkit's GSUB table access
        if (font.GSUB) {
            const gsub = font.GSUB;
            
            // Try accessing featureList directly - fontkit stores features as keys on featureList object
            if (gsub.featureList) {
                const featureList = gsub.featureList;
                
                // featureList might be an object with feature tags as keys
                const featureListKeys = Object.keys(featureList);
                featureListKeys.forEach(key => {
                    // Keys might be feature tags directly, or indices
                    // If it's a 4-character string, it's likely a feature tag
                    if (key.length === 4 && /^[a-z0-9]{4}$/.test(key)) {
                        if (!featureSet.has(key)) {
                            featureSet.add(key);
                            const featureInfo = extractFeatureWithLabel(font, key, featureList[key]);
                            features.push(featureInfo);
                        }
                    }
                });
                
                // Also try featureRecords array if it exists
                if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                    featureList.featureRecords.forEach(record => {
                        if (record && record.tag && !featureSet.has(record.tag)) {
                            featureSet.add(record.tag);
                            const featureInfo = extractFeatureWithLabel(font, record.tag, record);
                            features.push(featureInfo);
                        }
                    });
                }
                
                // Try iterating over featureList values - they might be feature objects
                Object.entries(featureList).forEach(([key, value]) => {
                    if (value && typeof value === 'object') {
                        const tag = value.tag || value.FeatureTag || key;
                        if (tag && tag.length === 4 && /^[a-z0-9]{4}$/.test(tag) && !featureSet.has(tag)) {
                            featureSet.add(tag);
                            const featureInfo = extractFeatureWithLabel(font, tag, value);
                            features.push(featureInfo);
                        }
                    }
                });
            }
            
            // Try accessing via table property (fontkit might nest it)
            if (gsub.table && gsub.table.featureList) {
                const featureList = gsub.table.featureList;
                if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                    featureList.featureRecords.forEach(record => {
                        if (record && record.tag) {
                            featureSet.add(record.tag);
                        }
                    });
                }
            }
            
            // Try direct features property
            if (gsub.features && typeof gsub.features === 'object') {
                Object.keys(gsub.features).forEach(tag => {
                    featureSet.add(tag);
                });
            }
        }
        
        // Method 2: Try fontkit's GPOS table access
        if (font.GPOS) {
            const gpos = font.GPOS;
            
            if (gpos.featureList) {
                const featureList = gpos.featureList;
                
                // featureList might be an object with feature tags as keys
                const featureListKeys = Object.keys(featureList);
                featureListKeys.forEach(key => {
                    // Keys might be feature tags directly
                    if (key.length === 4 && /^[a-z0-9]{4}$/.test(key)) {
                        featureSet.add(key);
                    }
                });
                
                // Also try featureRecords array if it exists
                if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                    featureList.featureRecords.forEach(record => {
                        if (record && record.tag) {
                            featureSet.add(record.tag);
                        }
                    });
                }
                
                // Try iterating over featureList values
                Object.values(featureList).forEach(value => {
                    if (value && typeof value === 'object') {
                        if (value.tag) featureSet.add(value.tag);
                        if (value.FeatureTag) featureSet.add(value.FeatureTag);
                    }
                });
            }
            
            if (gpos.table && gpos.table.featureList) {
                const featureList = gpos.table.featureList;
                if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                    featureList.featureRecords.forEach(record => {
                        if (record && record.tag) {
                            featureSet.add(record.tag);
                        }
                    });
                }
            }
            
            if (gpos.features && typeof gpos.features === 'object') {
                Object.keys(gpos.features).forEach(tag => {
                    featureSet.add(tag);
                });
            }
        }
        
        // Method 3: Try accessing via font._src (internal fontkit structure)
        if (font._src) {
            const src = font._src;
            
            // Try GSUB from source
            if (src.GSUB) {
                const gsub = src.GSUB;
                if (gsub.featureList && gsub.featureList.featureRecords) {
                    gsub.featureList.featureRecords.forEach(record => {
                        if (record && record.tag) {
                            featureSet.add(record.tag);
                        }
                    });
                }
            }
            
            // Try GPOS from source
            if (src.GPOS) {
                const gpos = src.GPOS;
                if (gpos.featureList && gpos.featureList.featureRecords) {
                    gpos.featureList.featureRecords.forEach(record => {
                        if (record && record.tag) {
                            featureSet.add(record.tag);
                        }
                    });
                }
            }
        }
        
        // Method 4: Try direct font.features property
        if (font.features && typeof font.features === 'object') {
            Object.keys(font.features).forEach(tag => {
                featureSet.add(tag);
            });
        }
        
        // Method 5: Try accessing via font.layout (fontkit might use this)
        if (font.layout) {
            const layout = font.layout;
            if (layout.GSUB && layout.GSUB.features) {
                Object.keys(layout.GSUB.features).forEach(tag => {
                    featureSet.add(tag);
                });
            }
            if (layout.GPOS && layout.GPOS.features) {
                Object.keys(layout.GPOS.features).forEach(tag => {
                    featureSet.add(tag);
                });
            }
        }
        
        // Method 6: Try accessing raw table data via font._tables or font.tables
        const tables = font._tables || font.tables || {};
        if (tables.GSUB) {
            const gsub = tables.GSUB;
            if (gsub.featureList && gsub.featureList.featureRecords) {
                gsub.featureList.featureRecords.forEach(record => {
                    if (record && (record.tag || record.FeatureTag)) {
                        featureSet.add(record.tag || record.FeatureTag);
                    }
                });
            }
        }
        if (tables.GPOS) {
            const gpos = tables.GPOS;
            if (gpos.featureList && gpos.featureList.featureRecords) {
                gpos.featureList.featureRecords.forEach(record => {
                    if (record && (record.tag || record.FeatureTag)) {
                        featureSet.add(record.tag || record.FeatureTag);
                    }
                });
            }
        }
        
        // Method 7: Try parsing from font._src.tables (most direct access)
        if (font._src && font._src.tables) {
            const srcTables = font._src.tables;
            if (srcTables.GSUB) {
                try {
                    const gsubTable = srcTables.GSUB;
                    // Try to access featureList from the parsed table
                    if (gsubTable.featureList) {
                        const featureList = gsubTable.featureList;
                        if (featureList.featureRecords) {
                            featureList.featureRecords.forEach(record => {
                                const tag = record.tag || record.FeatureTag || record.featureTag;
                                if (tag) {
                                    featureSet.add(tag);
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Table might not be parsed yet
                }
            }
            if (srcTables.GPOS) {
                try {
                    const gposTable = srcTables.GPOS;
                    if (gposTable.featureList) {
                        const featureList = gposTable.featureList;
                        if (featureList.featureRecords) {
                            featureList.featureRecords.forEach(record => {
                                const tag = record.tag || record.FeatureTag || record.featureTag;
                                if (tag) {
                                    featureSet.add(tag);
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Table might not be parsed yet
                }
            }
        }
        
        // If we didn't get features with labels, fall back to just tags
        if (features.length === 0 && featureSet.size > 0) {
            Array.from(featureSet).sort().forEach(tag => {
                const featureInfo = extractFeatureWithLabel(font, tag, null);
                features.push(featureInfo);
            });
        }
        
        // Sort by tag
        features.sort((a, b) => a.tag.localeCompare(b.tag));
        
        // Debug logging - only log if still no features found after all methods
        if (features.length === 0) {
            console.log('No features found after all extraction methods. Inspecting structure...');
            if (font.GSUB && font.GSUB.featureList) {
                const featureList = font.GSUB.featureList;
                console.log('GSUB.featureList keys:', Object.keys(featureList));
                console.log('GSUB.featureList sample value:', Object.values(featureList)[0]);
            }
        }
        
        return features;
    } catch (error) {
        console.warn('Error extracting OpenType features:', error);
        return [];
    }
}

function extractVariableAxes(font) {
    if (font.variationAxes) {
        return Object.entries(font.variationAxes).map(([tag, axis]) => ({
            tag,
            name: axis.name || tag,
            min: axis.min,
            max: axis.max,
            default: axis.default
        }));
    }
    return [];
}

function extractNamedVariations(font) {
    if (font.namedVariations) {
        return Object.entries(font.namedVariations).map(([name, coordinates]) => ({
            name,
            coordinates
        }));
    }
    return [];
}

function getFormatFromFilename(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    return ext.toUpperCase();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function renderFontList() {
    fontList.innerHTML = '';

    // Empty state
    if (fonts.length === 0) {
        fontList.innerHTML = `
            <div class="font-list-browse"><button class="btn" onclick="browseFonts(event)">𝓕 Load Fonts</button></div>
            <div class="empty-state">
                <h4>NO FONTS LOADED</h4>
                <small>Drag and Drop Fonts Here</small>
                <small>to Add to File List</small>
            </div>
        `;
        return;
    }

    // Add browse button at top
    let html = '<div class="font-list-browse"><button class="btn" onclick="browseFonts(event)">𝓕 Load Fonts</button></div>';
    
    // Group fonts by family
    const grouped = groupFontsByFamily(fonts);
    
    // Initialize or update familyOrder
    const currentFamilies = Object.keys(grouped);
    if (familyOrder.length === 0 || !currentFamilies.every(f => familyOrder.includes(f))) {
        // Initialize or add missing families
        const sortedFamilies = Object.keys(grouped).sort((a, b) => {
            if (a === 'Ungrouped') return 1;
            if (b === 'Ungrouped') return -1;
            return a.localeCompare(b);
        });
        
        // Preserve existing order for families that still exist, add new ones at end
        const existingOrder = familyOrder.filter(f => currentFamilies.includes(f));
        const newFamilies = sortedFamilies.filter(f => !familyOrder.includes(f));
        familyOrder = [...existingOrder, ...newFamilies];
    }
    
    // Remove families that no longer exist
    familyOrder = familyOrder.filter(f => currentFamilies.includes(f));
    
    // Render families in custom order
    familyOrder.forEach(family => {
        const familyFonts = grouped[family];
        if (!familyFonts) return;
        const isExpanded = expandedFamilies.has(family);
        const arrow = isExpanded ? '▼' : '▶';
        const expandedClass = isExpanded ? 'expanded' : 'collapsed';
        
        // Check if all fonts in family are selected
        const familyIndices = familyFonts.map(({ index }) => index);
        const allSelected = familyIndices.every(idx => selectedIndices.has(idx));
        const someSelected = familyIndices.some(idx => selectedIndices.has(idx));
        const toggleState = allSelected ? 'checked' : (someSelected ? 'indeterminate' : '');
        
        html += `
            <div class="font-family-group ${expandedClass}" data-family-name="${escapeHtml(family)}">
                <div class="font-family-header" 
                     draggable="true"
                     data-family-name="${escapeHtml(family)}"
                     ondragstart="handleFamilyDragStart(event, '${escapeHtml(family)}')"
                     ondragend="handleFamilyDragEnd(event)"
                     onclick="toggleFamily('${escapeHtml(family)}')">
                    <span class="family-drag-handle" title="Drag to reorder or remove">⋮⋮</span>
                    <span class="family-arrow" onclick="event.stopPropagation(); toggleFamily('${escapeHtml(family)}')">${arrow}</span>
                    <input type="checkbox" class="family-toggle" ${allSelected ? 'checked' : ''} ${someSelected && !allSelected ? 'indeterminate' : ''} onclick="event.stopPropagation(); toggleFamilySelection('${escapeHtml(family)}', event)" title="Toggle all fonts in family">
                    <span class="family-name">${escapeHtml(family)}</span>
                    <span class="family-count">(${familyFonts.length})</span>
                </div>
                <div class="font-family-items ${expandedClass}">
                    ${familyFonts.map(({ font: fontData, index }) => renderFontItem(fontData, index)).join('')}
                </div>
            </div>
        `;
    });
    
    fontList.innerHTML = html;
    
    // Attach drag handlers after rendering
    attachFontDragHandlers();
}

// Render individual font item
function renderFontItem(fontData, index) {
    const isSelected = selectedIndices.has(index);
    
    // Generate badges
    let badgesHtml = '';
    if (fontData.isVariable) {
        badgesHtml += '<span class="font-list-badge vf-badge" title="Variable Font">VF</span>';
    }
    if (fontData.hasOpenTypeFeatures) {
        badgesHtml += '<span class="font-list-badge ot-badge" title="OpenType Features">O</span>';
    }
    
    return `
        <div class="font-item ${isSelected ? 'selected' : ''}"
             data-font-index="${index}" 
             data-drag-type="font"
             onclick="toggleSelection(${index}, event)" 
             draggable="true"
             ondragstart="handleFontDragStart(event, ${index})"
             ondragend="handleFontDragEnd(event)">
            <span class="font-drag-handle" title="Drag to reorder or remove">⋮⋮</span>
            ${badgesHtml}
            <span class="font-name">${escapeHtml(fontData.filename)}</span>
            
        </div>
    `;
}

function removeFont(index) {
    // Remove from fonts array
    fonts.splice(index, 1);
    
    // Update selectedIndices - need to adjust indices for items after removed item
    const newSelectedIndices = new Set();
    selectedIndices.forEach(selectedIndex => {
        if (selectedIndex < index) {
            // Before removed item, keep same index
            newSelectedIndices.add(selectedIndex);
        } else if (selectedIndex > index) {
            // After removed item, decrement index
            newSelectedIndices.add(selectedIndex - 1);
        }
        // If selectedIndex === index, don't add (removed item)
    });
    selectedIndices = newSelectedIndices;
    
    // Update variable mode indices (decrement indices after removed item)
    const newVariableMode = new Set();
    variableMode.forEach(modeIndex => {
        if (modeIndex < index) {
            newVariableMode.add(modeIndex);
        } else if (modeIndex > index) {
            newVariableMode.add(modeIndex - 1);
        }
        // If modeIndex === index, don't add (removed column)
    });
    variableMode = newVariableMode;
    
    // Update currentVariations indices
    const newVariations = {};
    Object.keys(currentVariations).forEach(key => {
        const colIdx = parseInt(key);
        if (colIdx < index) {
            newVariations[key] = currentVariations[key];
        } else if (colIdx > index) {
            newVariations[colIdx - 1] = currentVariations[key];
        }
        // If colIdx === index, don't add (removed column)
    });
    currentVariations = newVariations;
    
    // Update activeFeatures indices
    const newActiveFeatures = {};
    Object.keys(activeFeatures).forEach(key => {
        const colIdx = parseInt(key);
        if (colIdx < index) {
            newActiveFeatures[key] = activeFeatures[key];
        } else if (colIdx > index) {
            newActiveFeatures[colIdx - 1] = activeFeatures[key];
        }
        // If colIdx === index, don't add (removed column)
    });
    activeFeatures = newActiveFeatures;
    
    // Clear font face styles
    fontFaceStyleElements.forEach(el => el.remove());
    fontFaceStyleElements = [];
    
    // Re-render list and update comparison
    renderFontList();
    updateComparison();
}

function clearAllFonts() {
    // Clear all arrays and sets
    fonts = [];
    selectedIndices.clear();
    collapsedSections.clear();
    variableMode.clear();
    expandedFamilies.clear();
    currentVariations = {};
    activeFeatures = {};
    
    // Clear font face styles
    fontFaceStyleElements.forEach(el => el.remove());
    fontFaceStyleElements = [];
    
    // Reset UI
    renderFontList();
    updateComparison();
}

// Toggle family group expanded/collapsed state
function toggleFamily(family) {
    if (expandedFamilies.has(family)) {
        expandedFamilies.delete(family);
    } else {
        expandedFamilies.add(family);
    }
    renderFontList();
}

// Make toggleFamily globally accessible
window.toggleFamily = toggleFamily;

function toggleFamilySelection(family, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Get all fonts in this family
    const grouped = groupFontsByFamily(fonts);
    const familyFonts = grouped[family] || [];
    const familyIndices = familyFonts.map(({ index }) => index);
    
    // Check if all are selected
    const allSelected = familyIndices.every(idx => selectedIndices.has(idx));
    
    if (allSelected) {
        // Deselect all
        familyIndices.forEach(idx => selectedIndices.delete(idx));
    } else {
        // Select all
        familyIndices.forEach(idx => selectedIndices.add(idx));
    }
    
    renderFontList();
    updateComparison();
}

// Make toggleFamilySelection globally accessible
window.toggleFamilySelection = toggleFamilySelection;

// Add event listener for clear all button
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllFonts);
}

// Drag and drop handlers for font items
let draggedFontIndex = null;
let draggedFontElement = null;
let draggedFamilyName = null;

function handleFontDragStart(event, index) {
    draggedFontIndex = index;
    draggedFontElement = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
    
    // Add dragging class for visual feedback
    event.target.classList.add('dragging');
    
    // Show trash zone
    const trash = createTrashZone();
    trash.classList.add('visible');
    
    // Create ghost image
    const dragImage = event.target.cloneNode(true);
    dragImage.style.opacity = '0.5';
    dragImage.style.transform = 'rotate(2deg)';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);
    setTimeout(() => {
        if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
        }
    }, 0);
}

function handleFontDragEnd(event) {
    // Hide trash zone
    if (trashZone) {
        trashZone.classList.remove('visible', 'drag-over-trash');
    }
    
    draggedFontIndex = null;
    draggedFontElement = null;
    event.target.classList.remove('dragging');
    
    // Remove all drop indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    document.querySelectorAll('.font-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.font-family-items.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// Family drag handlers
function handleFamilyDragStart(event, familyName) {
    draggedFamilyName = familyName;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', familyName);
    event.currentTarget.classList.add('dragging');
    
    // Show trash zone
    const trash = createTrashZone();
    trash.classList.add('visible');
    
    event.stopPropagation(); // Prevent font-level drag
}

function handleFamilyDragEnd(event) {
    draggedFamilyName = null;
    event.currentTarget.classList.remove('dragging');
    
    if (trashZone) {
        trashZone.classList.remove('visible', 'drag-over-trash');
    }
    
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    document.querySelectorAll('.font-family-header.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// Family header drag handlers for reordering
function handleFamilyHeaderDragOver(event) {
    if (draggedFamilyName === null) return;
    
    const targetFamily = event.currentTarget.getAttribute('data-family-name');
    if (targetFamily === draggedFamilyName) {
        event.dataTransfer.dropEffect = 'none';
        return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
}

function handleFamilyHeaderDragEnter(event) {
    if (draggedFamilyName === null) return;
    
    const targetFamily = event.currentTarget.getAttribute('data-family-name');
    if (targetFamily !== draggedFamilyName) {
        event.currentTarget.classList.add('drag-over');
        
        // Show drop indicator
        document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        
        const rect = event.currentTarget.getBoundingClientRect();
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        indicator.style.position = 'fixed';
        indicator.style.left = `${rect.left}px`;
        indicator.style.width = `${rect.width}px`;
        indicator.style.height = '2px';
        indicator.style.backgroundColor = 'var(--color-primary)';
        indicator.style.zIndex = '1000';
        indicator.style.pointerEvents = 'none';
        indicator.style.top = `${rect.top}px`;
        document.body.appendChild(indicator);
    }
}

function handleFamilyHeaderDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleFamilyHeaderDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedFamilyName === null) return;
    
    const targetFamily = event.currentTarget.getAttribute('data-family-name');
    if (targetFamily === draggedFamilyName) {
        event.currentTarget.classList.remove('drag-over');
        document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        return;
    }
    
    // Reorder families
    const draggedIndex = familyOrder.indexOf(draggedFamilyName);
    const targetIndex = familyOrder.indexOf(targetFamily);
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        // Remove dragged family from its current position
        familyOrder.splice(draggedIndex, 1);
        
        // Calculate new target index (adjust if dragged was before target)
        // If we removed an item before the target, target index shifts down by 1
        const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        familyOrder.splice(newTargetIndex, 0, draggedFamilyName);
        
        // Re-render
        renderFontList();
    }
    
    // Cleanup
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    event.currentTarget.classList.remove('drag-over');
}

// Make drag handlers globally accessible
window.handleFontDragStart = handleFontDragStart;
window.handleFontDragEnd = handleFontDragEnd;
window.handleFamilyDragStart = handleFamilyDragStart;
window.handleFamilyDragEnd = handleFamilyDragEnd;

// Attach drag handlers to font items and family containers after rendering
function attachFontDragHandlers() {
    // Attach handlers to font items
    const fontItems = document.querySelectorAll('.font-item[data-drag-type="font"]');
    fontItems.forEach(item => {
        // Remove existing listeners by cloning (keeps inline handlers)
        const hasListeners = item.dataset.hasDragListeners === 'true';
        if (hasListeners) {
            // Clone to remove event listeners but keep inline handlers
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            item = newItem;
        }
        
        // Mark as having listeners
        item.dataset.hasDragListeners = 'true';
        
        // Attach drag handlers
        item.addEventListener('dragover', handleFontDragOver);
        item.addEventListener('drop', handleFontDrop);
        item.addEventListener('dragenter', handleFontDragEnter);
        item.addEventListener('dragleave', handleFontDragLeave);
    });
    
    // Attach handlers to family item containers
    const familyItems = document.querySelectorAll('.font-family-items');
    familyItems.forEach(container => {
        const hasListeners = container.dataset.hasDragListeners === 'true';
        if (hasListeners) {
            const newContainer = container.cloneNode(true);
            container.parentNode.replaceChild(newContainer, container);
            container = newContainer;
        }
        
        container.dataset.hasDragListeners = 'true';
        
        container.addEventListener('dragover', handleFamilyItemsDragOver);
        container.addEventListener('drop', handleFamilyItemsDrop);
        container.addEventListener('dragenter', handleFamilyItemsDragEnter);
        container.addEventListener('dragleave', handleFamilyItemsDragLeave);
    });
    
    // Attach handlers to family headers for reordering
    const familyHeaders = document.querySelectorAll('.font-family-header');
    familyHeaders.forEach(header => {
        const hasListeners = header.dataset.hasReorderListeners === 'true';
        if (hasListeners) {
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            header = newHeader;
        }
        
        header.dataset.hasReorderListeners = 'true';
        
        header.addEventListener('dragover', handleFamilyHeaderDragOver);
        header.addEventListener('drop', handleFamilyHeaderDrop);
        header.addEventListener('dragenter', handleFamilyHeaderDragEnter);
        header.addEventListener('dragleave', handleFamilyHeaderDragLeave);
    });
}

function handleFontDragOver(event) {
    if (draggedFontIndex === null) return;
    
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    
    const targetIndex = parseInt(event.currentTarget.getAttribute('data-font-index'));
    if (targetIndex === draggedFontIndex || isNaN(targetIndex)) return;
    
    // Show drop indicator
    const rect = event.currentTarget.getBoundingClientRect();
    const isAfter = event.clientY > rect.top + rect.height / 2;
    
    // Remove existing indicators
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    
    // Add indicator
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    indicator.style.position = 'fixed';
    indicator.style.left = `${rect.left}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = '2px';
    indicator.style.backgroundColor = 'var(--color-primary)';
    indicator.style.zIndex = '1000';
    indicator.style.pointerEvents = 'none';
    
    if (isAfter) {
        indicator.style.top = `${rect.bottom}px`;
    } else {
        indicator.style.top = `${rect.top}px`;
    }
    
    document.body.appendChild(indicator);
}

function handleFontDragEnter(event) {
    if (draggedFontIndex === null) return;
    
    const targetIndex = parseInt(event.currentTarget.getAttribute('data-font-index'));
    if (targetIndex !== draggedFontIndex && !isNaN(targetIndex)) {
        event.currentTarget.classList.add('drag-over');
    }
}

function handleFontDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleFontDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedFontIndex === null) return;
    
    const targetIndex = parseInt(event.currentTarget.getAttribute('data-font-index'));
    if (targetIndex === draggedFontIndex || isNaN(targetIndex)) {
        event.currentTarget.classList.remove('drag-over');
        return;
    }
    
    // Get the target font's family to check if we're moving across families
    const targetFont = fonts[targetIndex];
    const draggedFont = fonts[draggedFontIndex];
    const targetFamily = extractFamilyName(targetFont, targetFont.filename);
    const draggedFamily = extractFamilyName(draggedFont, draggedFont.filename);
    
    // If moving to different family, update the font's family metadata
    if (targetFamily !== draggedFamily) {
        // Update the font's assigned family to match target family
        fonts[draggedFontIndex].assignedFamily = targetFamily;
    }
    
    // Reorder fonts
    const fontToMove = fonts[draggedFontIndex];
    if (!fontToMove) {
        event.currentTarget.classList.remove('drag-over');
        return;
    }
    
    fonts.splice(draggedFontIndex, 1);
    
    const newIndex = targetIndex > draggedFontIndex ? targetIndex - 1 : targetIndex;
    fonts.splice(newIndex, 0, fontToMove);
    
    // Update selected indices
    const oldSelected = Array.from(selectedIndices);
    selectedIndices.clear();
    oldSelected.forEach(oldIdx => {
        if (oldIdx === draggedFontIndex) {
            selectedIndices.add(newIndex);
        } else if (oldIdx < draggedFontIndex && oldIdx >= newIndex) {
            selectedIndices.add(oldIdx + 1);
        } else if (oldIdx > draggedFontIndex && oldIdx <= newIndex) {
            selectedIndices.add(oldIdx - 1);
        } else {
            selectedIndices.add(oldIdx);
        }
    });
    
    // Cleanup
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    event.currentTarget.classList.remove('drag-over');
    
    // Re-render
    renderFontList();
    updateComparison();
}

// Family container drag handlers
function handleFamilyItemsDragOver(event) {
    if (draggedFontIndex === null) return;
    
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    
    const container = event.currentTarget;
    const fontItems = Array.from(container.querySelectorAll('.font-item'));
    
    // Find the insertion point
    const rect = container.getBoundingClientRect();
    const mouseY = event.clientY;
    
    let insertIndex = -1;
    
    if (fontItems.length === 0) {
        // Empty container - insert at start
        insertIndex = 0;
    } else {
        // Find which item we're over or if we're at the end
        for (let i = 0; i < fontItems.length; i++) {
            const itemRect = fontItems[i].getBoundingClientRect();
            if (mouseY < itemRect.top + itemRect.height / 2) {
                // Insert before this item
                insertIndex = parseInt(fontItems[i].getAttribute('data-font-index'));
                break;
            }
        }
        
        // If we didn't find a position, insert after last item
        if (insertIndex === -1) {
            const lastItem = fontItems[fontItems.length - 1];
            const lastIndex = parseInt(lastItem.getAttribute('data-font-index'));
            insertIndex = lastIndex + 1;
        }
    }
    
    // Show drop indicator
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    indicator.style.position = 'fixed';
    indicator.style.left = `${rect.left}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = '2px';
    indicator.style.backgroundColor = 'var(--color-primary)';
    indicator.style.zIndex = '1000';
    indicator.style.pointerEvents = 'none';
    
    if (fontItems.length === 0 || insertIndex > parseInt(fontItems[fontItems.length - 1]?.getAttribute('data-font-index') || -1)) {
        // At the end
        indicator.style.top = `${rect.bottom - 2}px`;
    } else {
        // Before an item
        const targetItem = fontItems.find(item => parseInt(item.getAttribute('data-font-index')) === insertIndex);
        if (targetItem) {
            const itemRect = targetItem.getBoundingClientRect();
            indicator.style.top = `${itemRect.top}px`;
        } else {
            indicator.style.top = `${rect.top}px`;
        }
    }
    
    document.body.appendChild(indicator);
    container.dataset.dropIndex = insertIndex;
}

function handleFamilyItemsDragEnter(event) {
    if (draggedFontIndex === null) return;
    event.currentTarget.classList.add('drag-over');
}

function handleFamilyItemsDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleFamilyItemsDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedFontIndex === null) return;
    
    const container = event.currentTarget;
    const dropIndex = parseInt(container.dataset.dropIndex);
    
    if (isNaN(dropIndex)) {
        container.classList.remove('drag-over');
        return;
    }
    
    // Extract family name from the container's parent .font-family-group element
    const familyGroup = container.closest('.font-family-group');
    const familyHeader = familyGroup?.querySelector('.font-family-header');
    const familyName = familyHeader?.querySelector('.family-name')?.textContent;
    
    // If dropping into a family container, set assignedFamily to that family
    if (familyName) {
        fonts[draggedFontIndex].assignedFamily = familyName;
    }
    
    // Reorder fonts
    const fontToMove = fonts[draggedFontIndex];
    if (!fontToMove) {
        container.classList.remove('drag-over');
        return;
    }
    
    fonts.splice(draggedFontIndex, 1);
    
    // Calculate new index (accounting for removal)
    const newIndex = dropIndex > draggedFontIndex ? dropIndex - 1 : dropIndex;
    fonts.splice(newIndex, 0, fontToMove);
    
    // Update selected indices
    const oldSelected = Array.from(selectedIndices);
    selectedIndices.clear();
    oldSelected.forEach(oldIdx => {
        if (oldIdx === draggedFontIndex) {
            selectedIndices.add(newIndex);
        } else if (oldIdx < draggedFontIndex && oldIdx >= newIndex) {
            selectedIndices.add(oldIdx + 1);
        } else if (oldIdx > draggedFontIndex && oldIdx <= newIndex) {
            selectedIndices.add(oldIdx - 1);
        } else {
            selectedIndices.add(oldIdx);
        }
    });
    
    // Cleanup
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    container.classList.remove('drag-over');
    delete container.dataset.dropIndex;
    
    // Re-render
    renderFontList();
    updateComparison();
}

// Handle drag outside sidebar for removal - trash zone
let trashZone = null;

function createTrashZone() {
    if (trashZone) return trashZone;
    
    trashZone = document.createElement('div');
    trashZone.id = 'trashZone';
    trashZone.className = 'trash-zone';
    trashZone.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        <span>Drop to Remove</span>
    `;
    document.body.appendChild(trashZone);
    
    // Add drag handlers to trash zone
    trashZone.addEventListener('dragover', (e) => {
        if (draggedFontIndex !== null || draggedFamilyName !== null) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            trashZone.classList.add('drag-over-trash');
        }
    });
    
    trashZone.addEventListener('dragleave', () => {
        trashZone.classList.remove('drag-over-trash');
    });
    
    trashZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedFontIndex !== null) {
            removeFont(draggedFontIndex);
            trashZone.classList.remove('drag-over-trash', 'visible');
        } else if (draggedFamilyName !== null) {
            // Remove all fonts in family
            const grouped = groupFontsByFamily(fonts);
            const familyFonts = grouped[draggedFamilyName] || [];
            const indicesToRemove = familyFonts.map(f => f.index).sort((a, b) => b - a);
            
            // Remove in reverse order to maintain indices
            indicesToRemove.forEach(idx => {
                fonts.splice(idx, 1);
            });
            
            // Update selectedIndices
            selectedIndices.clear();
            
            renderFontList();
            updateComparison();
            trashZone.classList.remove('drag-over-trash', 'visible');
        }
    });
    
    return trashZone;
}

// Trash zone handles removal via its own drop handler
// No need for document-level drag handlers anymore

function toggleSelection(index, event) {
    // Prevent event from bubbling if needed
    if (event) {
        event.stopPropagation();
    }
    
    // Simple toggle - no Cmd/Ctrl logic
    if (selectedIndices.has(index)) {
        selectedIndices.delete(index);
    } else {
        selectedIndices.add(index);
    }

    renderFontList();
    updateComparison();
}

function updateComparison() {
    if (selectedIndices.size === 0) {
        comparisonGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        updateViewModeUI();
        // Clear variable mode and OT mode when no fonts selected
        variableMode.clear();
        otMode.clear();
        currentVariations = {};
        activeFeatures = {};
        return;
    }

    emptyState.classList.add('hidden');
    comparisonGrid.classList.remove('hidden');
    updateViewModeUI();

    // Clean up variable mode and OT mode for columns that no longer exist
    const numFonts = selectedIndices.size;
    const validIndices = new Set(Array.from({length: numFonts}, (_, i) => i));
    variableMode = new Set(Array.from(variableMode).filter(idx => validIndices.has(idx)));
    otMode = new Set(Array.from(otMode).filter(idx => validIndices.has(idx)));
    
    // Clean up variations for removed columns
    const newVariations = {};
    Object.keys(currentVariations).forEach(key => {
        const idx = parseInt(key);
        if (validIndices.has(idx)) {
            newVariations[key] = currentVariations[key];
        }
    });
    currentVariations = newVariations;
    
    // Clean up active features for removed columns
    const newActiveFeatures = {};
    Object.keys(activeFeatures).forEach(key => {
        const idx = parseInt(key);
        if (validIndices.has(idx)) {
            newActiveFeatures[key] = activeFeatures[key];
        }
    });
    activeFeatures = newActiveFeatures;

    comparisonGrid.className = 'comparison-grid';
    comparisonGrid.classList.add(`${viewMode}-mode`);

    if (viewMode === 'horizontal') {
        // Horizontal mode: single column, each font is a row
        comparisonGrid.classList.add('cols-1');
    } else if (viewMode === 'gallery') {
        // Gallery mode: responsive grid with many columns (handled by CSS auto-fill)
        // No need to set --col-count, CSS handles it
    } else {
        // Column mode: existing behavior
        if (numFonts === 1) comparisonGrid.classList.add('cols-1');
        else if (numFonts === 2) comparisonGrid.classList.add('cols-2');
        else if (numFonts === 3) comparisonGrid.classList.add('cols-3');
        else if (numFonts === 4) comparisonGrid.classList.add('cols-4');
        else {
            comparisonGrid.classList.add('cols-many');
            comparisonGrid.style.setProperty('--col-count', numFonts);
        }
    }

    fontFaceStyleElements.forEach(el => el.remove());
    fontFaceStyleElements = [];

    comparisonGrid.innerHTML = '';

    // Filter out invalid indices and map to fonts
    const validSelectedIndices = Array.from(selectedIndices).filter(i => i >= 0 && i < fonts.length && fonts[i] != null);
    const selectedFonts = validSelectedIndices.map(i => fonts[i]).filter(font => font != null);
    
    // Update selectedIndices to only include valid indices
    selectedIndices.clear();
    validSelectedIndices.forEach(i => selectedIndices.add(i));
    
    // If no valid fonts, show empty state
    if (selectedFonts.length === 0) {
        comparisonGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        updateViewModeUI();
        return;
    }
    
    const fontUrls = [];
    let loadedCount = 0;

    selectedFonts.forEach((fontData, columnIndex) => {
        if (!fontData || !fontData.file) {
            console.warn('Invalid font data at index:', columnIndex);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            fontUrls[columnIndex] = e.target.result;
            loadedCount++;

            if (loadedCount === selectedFonts.length) {
                renderComparison(selectedFonts, fontUrls);
            }
        };
        reader.onerror = function(error) {
            console.error('Error reading font file:', error);
            loadedCount++;
            // Continue even if one font fails
            if (loadedCount === selectedFonts.length) {
                renderComparison(selectedFonts, fontUrls);
            }
        };
        reader.readAsDataURL(fontData.file);
    });
}

function renderComparison(selectedFonts, fontUrls) {
    selectedFonts.forEach((fontData, columnIndex) => {
        const fontFaceName = `comparison-font-${columnIndex}`;
        const fontFaceStyle = document.createElement('style');
        fontFaceStyle.textContent = `
            @font-face {
                font-family: '${fontFaceName}';
                src: url('${fontUrls[columnIndex]}');
            }
        `;
        document.head.appendChild(fontFaceStyle);
        fontFaceStyleElements.push(fontFaceStyle);
    });

    selectedFonts.forEach((fontData, columnIndex) => {
        const column = document.createElement('div');
        column.className = 'font-column';
        column.dataset.columnIndex = columnIndex;

        const fontFaceName = `comparison-font-${columnIndex}`;
        const isInVariableMode = variableMode.has(columnIndex);

        // Initialize variations for this column if not exists
        if (fontData.isVariable && !currentVariations[columnIndex]) {
            const defaults = {};
            fontData.variableAxes.forEach(axis => {
                defaults[axis.tag] = axis.default;
            });
            currentVariations[columnIndex] = defaults;
        }

        const vfBadgeClass = fontData.isVariable 
            ? `vf-badge ${isInVariableMode ? 'vf-badge-active' : ''}`
            : '';
        const vfBadgeHtml = fontData.isVariable 
            ? `<span class="${vfBadgeClass}" data-column-index="${columnIndex}" title="Variable Font - Click to toggle controls">VF</span>`
            : '';
        
        // Create OT badge if font has OpenType features
        const isInOTMode = otMode.has(columnIndex);
        const otBadgeClass = fontData.hasOpenTypeFeatures 
            ? `ot-badge ${isInOTMode ? 'ot-badge-active' : ''}`
            : '';
        const otBadgeHtml = fontData.hasOpenTypeFeatures 
            ? `<span class="${otBadgeClass}" data-column-index="${columnIndex}" title="OpenType Features - Click to toggle controls">O</span>`
            : '';
        
        // Determine which content to show based on view mode
        let contentHtml = '';
        if (viewMode === 'column') {
            if (isInVariableMode && fontData.isVariable) {
                contentHtml = createVariableControlsPanel(fontData, columnIndex);
            } else if (isInOTMode && fontData.hasOpenTypeFeatures) {
                contentHtml = createOpenTypeFeaturesPanel(fontData, columnIndex);
            } else {
                contentHtml = createDetailsPanel(fontData, columnIndex);
            }
        } else if (viewMode === 'horizontal') {
            contentHtml = createHorizontalMetadataPanel(fontData, columnIndex);
        }
        // Gallery mode: contentHtml stays empty
        
        column.innerHTML = `
            <div class="font-column-header">
                <div class="font-column-header-meta">
                    <div class="font-column-header-badges">
                        ${vfBadgeHtml}${otBadgeHtml}
                    </div>
                    <span class="file-size">${fontData.size}</span>
                </div>
                <h3 class="font-column-header-title">${fontData.filename}</h3>
            </div>

            <div class="preview-section">
                <div class="preview-text preview-text-${columnIndex}" 
                     contenteditable="true" 
                     style="font-family: '${fontFaceName}';"
                     data-column-index="${columnIndex}"></div>
                <button class="preview-reset-btn" 
                        data-column-index="${columnIndex}"
                        title="Reset preview text to default"
                        onclick="resetPreviewText()">Reset</button>
            </div>

            ${contentHtml}
        `;

        comparisonGrid.appendChild(column);
        
        // Set preview text content (use textContent to avoid HTML issues)
        const previewElement = column.querySelector('.preview-text');
        if (previewElement) {
            previewElement.textContent = previewText;
        }

        // Apply current variations if in variable mode
        if (isInVariableMode && fontData.isVariable) {
            updateFontVariation(columnIndex, currentVariations[columnIndex]);
        }
    });

    // Attach collapse handlers
    document.querySelectorAll('.section-header').forEach(header => {
        header.onclick = () => {
            toggleSection(header);
            // Re-align rows after section toggle
            setTimeout(alignMetadataRows, 100);
        };
    });

    // Attach VF badge click handlers
    document.querySelectorAll('.vf-badge').forEach(badge => {
        badge.onclick = (e) => {
            e.stopPropagation();
            const columnIndex = parseInt(badge.dataset.columnIndex);
            toggleVariableMode(columnIndex);
        };
    });
    
    // Attach OT badge click handlers
    document.querySelectorAll('.ot-badge').forEach(badge => {
        badge.onclick = (e) => {
            e.stopPropagation();
            const columnIndex = parseInt(badge.dataset.columnIndex);
            toggleOpenTypeMode(columnIndex);
        };
    });

    // Attach variable control handlers
    attachVariableControlHandlers();

           // Align rows across columns
           setTimeout(alignMetadataRows, 50);
           
           // Apply active features to preview
           selectedFonts.forEach((fontData, columnIndex) => {
               applyFeaturesToPreview(columnIndex);
           });
           
           // Attach editable preview handlers
           attachEditablePreviewHandlers();
           
           // Attach popover handlers for feature items
           attachFeaturePopoverHandlers();
       }

// Attach handlers for editable preview panes
function attachEditablePreviewHandlers() {
    document.querySelectorAll('.preview-text[contenteditable="true"]').forEach(preview => {
        // Check if already has listener (data attribute)
        if (preview.dataset.hasListener === 'true') return;
        preview.dataset.hasListener = 'true';
        
        preview.addEventListener('input', (e) => {
            // Get text content and preserve line breaks
            const text = e.target.innerText;
            previewText = text;
            
            // Sync to all other preview panes
            document.querySelectorAll('.preview-text[contenteditable="true"]').forEach(otherPreview => {
                if (otherPreview !== e.target) {
                    otherPreview.innerText = text;
                }
            });
        });
        
        preview.addEventListener('blur', (e) => {
            // Update previewText state when focus is lost
            previewText = e.target.innerText;
        });
        
        preview.addEventListener('keydown', (e) => {
            // Allow Enter for line breaks
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('insertLineBreak');
            }
        });
    });
}

// Create horizontal mode metadata panel
function createHorizontalMetadataPanel(fontData, columnIndex) {
    const fieldMap = {
        'family': ['Family', fontData.family],
        'subfamily': ['Subfamily', fontData.subfamily],
        'glyphs': ['Glyphs', fontData.glyphs],
        'weightClass': ['Weight', fontData.weightClass],
        'format': ['Format', fontData.format],
        'size': ['Size', fontData.size],
        'unitsPerEm': ['Units/Em', fontData.unitsPerEm],
        'isVariable': ['Variable', fontData.isVariable ? 'Yes' : 'No'],
        'hasOpenTypeFeatures': ['OT Features', fontData.hasOpenTypeFeatures ? 'Yes' : 'No']
    };
    
    const rows = horizontalMetadataFields
        .filter(field => fieldMap[field])
        .map(field => {
            const [label, value] = fieldMap[field];
            return `<div class="horizontal-metadata-row">
                <div class="horizontal-metadata-label">${label}</div>
                <div class="horizontal-metadata-value">${value || 'N/A'}</div>
            </div>`;
        }).join('');
    
    return `
        <div class="horizontal-metadata-panel">
            ${rows}
        </div>
    `;
}

function createBasicInformationSection(fontData, columnIndex) {
    const nameEntries = fontData.nameTableEntries || {};
    const rows = [
        ['01 • Family', nameEntries[1] || '', 'row-name-id-1'],
        ['02 • Subfamily', nameEntries[2] || '', 'row-name-id-2'],
        ['03 • Unique Identifier', nameEntries[3] || '', 'row-name-id-3'],
        ['04 • Full Name', nameEntries[4] || '', 'row-name-id-4'],
        ['05 • Version', nameEntries[5] || '', 'row-name-id-5'],
        ['06 • PostScript', nameEntries[6] || '', 'row-name-id-6'],
        ['16 • Typographic Family', nameEntries[16] || '', 'row-name-id-16'],
        ['17 • Typographic Subfamily', nameEntries[17] || '', 'row-name-id-17'],
        ['Vendor ID', fontData.vendorID || '', 'row-vendor-id']
    ];
    return createSection('Basic Information', rows, columnIndex);
}

function createMiscellaneousSection(fontData, columnIndex) {
    const fsBits = fontData.fsSelectionBits || {};
    
    const rows = [
        ['is Monospaced', fontData.isFixedPitch ? 'Yes' : 'No', 'row-fixed-pitch'],
        ['is Italic', fsBits.isItalic ? 'Yes' : 'No', 'row-fs-italic'],
        ['is Bold', fsBits.isBold ? 'Yes' : 'No', 'row-fs-bold'],
        ['is Regular', fsBits.isRegular ? 'Yes' : 'No', 'row-fs-regular'],
        ['Typo Metrics', fsBits.useTypoMetrics ? 'Yes' : 'No', 'row-fs-typo-metrics'],
        ['WWS', fsBits.wws ? 'Yes' : 'No', 'row-fs-wws'],
        ['Underline Position', fontData.underlinePosition, 'row-underline-position'],
        ['Underline Thickness', fontData.underlineThickness, 'row-underline-thickness'],
        ['Strikeout Position', fontData.strikeoutPosition, 'row-strikeout-position'],
        ['Strikeout Size', fontData.strikeoutSize, 'row-strikeout-size'],
        ['fsType', fontData.fsTypeInterpreted || 'N/A', 'row-fstype']
    ];
    
    return createSection('Miscellaneous', rows, columnIndex);
}

function createDetailsPanel(fontData, columnIndex) {
    return `
        ${createBasicInformationSection(fontData, columnIndex)}

        ${createSection('Font Properties', [
            ['Number of Glyphs', fontData.glyphs, 'row-glyphs'],
            ['Weight Class', fontData.weightClass, 'row-weight-class'],
            ['Width Class', fontData.widthClass, 'row-width-class']
        ], columnIndex)}

        ${createSection('Metrics', [
            ['Units Per Em', fontData.unitsPerEm, 'row-units-per-em'],
            ['Italic Angle', fontData.italicAngle, 'row-italic-angle'],
            ['Cap Height', fontData.capHeight, 'row-cap-height'],
            ['x-Height', fontData.xHeight, 'row-x-height'],
            ['hhea Ascender', fontData.ascent, 'row-hhea-ascender'],
            ['hhea Descender', fontData.descent, 'row-hhea-descender'],
            ['hhea Line Gap', fontData.lineGap, 'row-hhea-line-gap'],
            ['typo Ascent', fontData.typoAscender, 'row-typo-ascender'],
            ['typo Descent', fontData.typoDescender, 'row-typo-descender'],
            ['typo Line Gap', fontData.typoLineGap, 'row-typo-line-gap'],
            ['Win Ascent', fontData.winAscent, 'row-win-ascent'],
            ['Win Descent', fontData.winDescent, 'row-win-descent']
        ], columnIndex)}

        ${createMiscellaneousSection(fontData, columnIndex)}

        ${fontData.features && fontData.features.length > 0 ? createFeaturesSection(fontData.features, columnIndex) : ''}

        ${fontData.variableAxes.length > 0 ? createVariableAxesSection(fontData.variableAxes, columnIndex) : ''}

        ${fontData.availableTables.length > 0 ? createTablesSection(fontData.availableTables, columnIndex) : ''}
    `;
}

function formatAxisValue(value, axis) {
    const range = axis.max - axis.min;
    if (range > 100) {
        return Math.round(value);
    }
    // For smaller ranges, keep 1-2 decimal places
    return parseFloat(value.toFixed(2));
}

function calculateTicks(axis) {
    const range = axis.max - axis.min;
    
    // Special handling for weight axis
    if (axis.tag === 'wght') {
        const ticks = [];
        const start = Math.ceil(axis.min / 100) * 100;
        const end = Math.floor(axis.max / 100) * 100;
        for (let i = start; i <= end; i += 100) {
            if (i >= axis.min && i <= axis.max) {
                ticks.push(i);
            }
        }
        return ticks;
    }
    
    // For other axes, calculate reasonable interval
    // Aim for 5-10 ticks
    const targetTicks = 8;
    const interval = range / targetTicks;
    
    // Round to nearest power of 10, 5, or 2
    const magnitude = Math.pow(10, Math.floor(Math.log10(interval)));
    let roundedInterval = magnitude;
    
    if (interval / magnitude >= 5) {
        roundedInterval = magnitude * 5;
    } else if (interval / magnitude >= 2) {
        roundedInterval = magnitude * 2;
    }
    
    const ticks = [];
    let current = Math.ceil(axis.min / roundedInterval) * roundedInterval;
    while (current <= axis.max) {
        if (current >= axis.min) {
            ticks.push(current);
        }
        current += roundedInterval;
    }
    
    return ticks;
}

function snapToNearestTick(columnIndex, axisTag, currentValue) {
    const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
    const fontData = selectedFonts[columnIndex];
    const axis = fontData.variableAxes.find(a => a.tag === axisTag);
    if (!axis) return currentValue;
    
    const ticks = calculateTicks(axis);
    if (ticks.length === 0) return currentValue;
    
    // Find nearest tick
    let nearestTick = ticks[0];
    let minDistance = Math.abs(currentValue - ticks[0]);
    
    ticks.forEach(tick => {
        const distance = Math.abs(currentValue - tick);
        if (distance < minDistance) {
            minDistance = distance;
            nearestTick = tick;
        }
    });
    
    // Calculate threshold (2-5% of range or fixed value)
    const range = axis.max - axis.min;
    const threshold = Math.max(range * 0.03, axis.tag === 'wght' ? 15 : 2);
    
    // Snap if within threshold
    if (minDistance <= threshold) {
        return nearestTick;
    }
    
    return currentValue;
}

function createVariableControlsPanel(fontData, columnIndex) {
    const axes = fontData.variableAxes || [];
    const namedVariations = fontData.namedVariations || [];
    const variations = currentVariations[columnIndex] || {};

    let axesHtml = '';
    axes.forEach(axis => {
        const currentValue = variations[axis.tag] ?? axis.default;
        const axisId = `axis-${columnIndex}-${axis.tag}`;
        const ticks = calculateTicks(axis);
        const datalistId = `${axisId}-ticks`;
        const range = axis.max - axis.min;
        
        // Determine step size based on range
        const step = range > 100 ? 1 : (range > 10 ? 0.1 : 0.01);
        
        // Format displayed values
        const formattedValue = formatAxisValue(currentValue, axis);
        const formattedMin = formatAxisValue(axis.min, axis);
        const formattedMax = formatAxisValue(axis.max, axis);
        const formattedDefault = formatAxisValue(axis.default, axis);
        
        axesHtml += `
            <div class="variable-axis-control" data-axis-tag="${axis.tag}" data-column-index="${columnIndex}">
                <div class="axis-label">
                    <span class="axis-name">${axis.name}</span>
                    <span class="axis-tag">(${axis.tag})</span>
                </div>
                <div class="axis-controls">
                    <input type="range" 
                           class="axis-slider" 
                           id="${axisId}-slider"
                           list="${datalistId}"
                           min="${axis.min}" 
                           max="${axis.max}" 
                           step="${step}"
                           value="${currentValue}">
                    <datalist id="${datalistId}">
                        ${ticks.map(tick => `<option value="${tick}"></option>`).join('')}
                    </datalist>
                    <input type="number" 
                           class="axis-input" 
                           id="${axisId}-input"
                           min="${axis.min}" 
                           max="${axis.max}" 
                           step="${step}"
                           value="${formattedValue}">
                </div>
                <div class="axis-range">
                    <span class="axis-min">${formattedMin}</span>
                    <span class="axis-default">Default: ${formattedDefault}</span>
                    <span class="axis-max">${formattedMax}</span>
                </div>
            </div>
        `;
    });

    let namedVariationsHtml = '';
    if (namedVariations.length > 0) {
        namedVariationsHtml = `
            <div class="named-variations-section">
                <div class="section-header">
                    <span>Preset Styles</span>
                </div>
                <div class="section-content">
                    <select class="named-variations-select" data-column-index="${columnIndex}">
                        <option value="">Select a preset...</option>
                        ${namedVariations.map((variation, idx) => 
                            `<option value="${idx}">${variation.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    return `
        <div class="variable-controls-panel" data-column-index="${columnIndex}">
            <div class="variable-controls-header">
                <h4>Variable Font Controls</h4>
                <button class="btn-reset-variations" data-column-index="${columnIndex}">Reset to Defaults</button>
            </div>
            <div class="variable-axes-section">
                ${axesHtml}
            </div>
            ${namedVariationsHtml}
            ${fontData.hasOpenTypeFeatures ? createOpenTypeFeaturesInVFPanel(fontData, columnIndex) : ''}
        </div>
    `;
}

function createOpenTypeFeaturesPanel(fontData, columnIndex) {
    const features = fontData.features || [];
    const isActive = activeFeatures[columnIndex] || new Set();
    
    // Sort features: stylistic sets first, then alphabetical
    const sortedFeatures = sortFeatures(features);
    
    return `
        <div class="variable-controls-panel">
            <div class="variable-controls-header">
                <h4>OpenType Features</h4>
            </div>
            <div class="features-expanded-panel">
                ${sortedFeatures.length > 0 ? sortedFeatures.map(f => {
                    const featureTag = typeof f === 'string' ? f : f.tag;
                    const featureInfo = FEATURE_DESCRIPTIONS[featureTag];
                    const featureName = featureInfo ? featureInfo.name : `OpenType feature: ${featureTag}`;
                    const featureDescription = featureInfo ? featureInfo.description : '';
                    const isFeatureActive = isActive.has(featureTag);
                    
                    return `
                        <div class="feature-expanded-row ${isFeatureActive ? 'active' : ''}" 
                             data-column-index="${columnIndex}" 
                             data-feature-tag="${featureTag}"
                             onclick="toggleFeature(${columnIndex}, '${featureTag}')">
                            <div class="feature-expanded-content">
                                <div class="feature-expanded-header">
                                    <span class="feature-expanded-tag">${featureTag}</span>
                                    <span class="feature-expanded-name">${featureName}</span>
                                </div>
                                ${featureDescription ? `<div class="feature-expanded-description">${featureDescription}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="metadata-row"><div class="metadata-value metadata-empty">No OpenType features found</div></div>'}
            </div>
        </div>
    `;
}

function createOpenTypeFeaturesInVFPanel(fontData, columnIndex) {
    const features = fontData.features || [];
    const isActive = activeFeatures[columnIndex] || new Set();
    
    if (features.length === 0) return '';
    
    // Sort features: stylistic sets first, then alphabetical
    const sortedFeatures = sortFeatures(features);
    
    return `
        <div class="named-variations-section ot-features-in-vf">
            <h5>OpenType Features</h5>
            <div class="features-list-panel">
                ${sortedFeatures.map(f => {
                    const featureTag = typeof f === 'string' ? f : f.tag;
                    const featureInfo = FEATURE_DESCRIPTIONS[featureTag];
                    const featureName = featureInfo ? featureInfo.name : `OpenType feature: ${featureTag}`;
                    const featureDescription = featureInfo ? featureInfo.description : '';
                    const isFeatureActive = isActive.has(featureTag);
                    
                    // Escape for HTML attributes
                    const escapedName = featureName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const escapedDescription = featureDescription.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    
                    return `
                        <div class="feature-item ${isFeatureActive ? 'active' : ''}" 
                             data-column-index="${columnIndex}" 
                             data-feature-tag="${featureTag}"
                             data-feature-name="${escapedName}"
                             data-feature-description="${escapedDescription}"
                             onclick="toggleFeature(${columnIndex}, '${featureTag}')">
                            <span class="feature-tag">${featureTag}</span>
                            <div class="feature-popover">
                                <div class="feature-popover-name">${featureName}</div>
                                <div class="feature-popover-description">${featureDescription}</div>
                                <div class="feature-popover-arrow"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function toggleOpenTypeMode(columnIndex) {
    if (otMode.has(columnIndex)) {
        otMode.delete(columnIndex);
    } else {
        otMode.add(columnIndex);
        // Exit variable mode if in it
        if (variableMode.has(columnIndex)) {
            variableMode.delete(columnIndex);
        }
    }
    updateComparison();
}

function toggleVariableMode(columnIndex) {
    if (variableMode.has(columnIndex)) {
        variableMode.delete(columnIndex);
    } else {
        variableMode.add(columnIndex);
        // Exit OT mode if in it
        if (otMode.has(columnIndex)) {
            otMode.delete(columnIndex);
        }
    }
    // Re-render the comparison to update the view
    updateComparison();
}

function updateFontVariation(columnIndex, variations) {
    const previewElement = document.querySelector(`.preview-text-${columnIndex}`);
    if (!previewElement) return;

    // Build font-variation-settings CSS value
    const settings = Object.entries(variations)
        .map(([tag, value]) => `"${tag}" ${value}`)
        .join(', ');

    previewElement.style.fontVariationSettings = settings;
}

function attachVariableControlHandlers() {
    // Slider handlers
    document.querySelectorAll('.axis-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const columnIndex = parseInt(e.target.closest('.variable-axis-control').dataset.columnIndex);
            const axisTag = e.target.closest('.variable-axis-control').dataset.axisTag;
            const value = parseFloat(e.target.value);
            
            // Get axis for formatting
            const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
            const fontData = selectedFonts[columnIndex];
            const axis = fontData.variableAxes.find(a => a.tag === axisTag);
            
            // Update input field with formatted value
            const inputId = e.target.id.replace('-slider', '-input');
            const input = document.getElementById(inputId);
            if (input && axis) {
                input.value = formatAxisValue(value, axis);
            }
            
            // Update variations
            if (!currentVariations[columnIndex]) {
                currentVariations[columnIndex] = {};
            }
            currentVariations[columnIndex][axisTag] = value;
            
            // Apply to preview
            updateFontVariation(columnIndex, currentVariations[columnIndex]);
            
            // Check and sync preset
            checkAndSyncPreset(columnIndex);
        });
        
        // Add mouseup handler for snapping to ticks
        slider.addEventListener('mouseup', (e) => {
            const columnIndex = parseInt(e.target.closest('.variable-axis-control').dataset.columnIndex);
            const axisTag = e.target.closest('.variable-axis-control').dataset.axisTag;
            const currentValue = parseFloat(e.target.value);
            
            // Snap to nearest tick
            const snappedValue = snapToNearestTick(columnIndex, axisTag, currentValue);
            
            if (snappedValue !== currentValue) {
                // Update slider
                e.target.value = snappedValue;
                
                // Get axis for formatting
                const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
                const fontData = selectedFonts[columnIndex];
                const axis = fontData.variableAxes.find(a => a.tag === axisTag);
                
                // Update input field with formatted value
                const inputId = e.target.id.replace('-slider', '-input');
                const input = document.getElementById(inputId);
                if (input && axis) {
                    input.value = formatAxisValue(snappedValue, axis);
                }
                
                // Update variations
                if (!currentVariations[columnIndex]) {
                    currentVariations[columnIndex] = {};
                }
                currentVariations[columnIndex][axisTag] = snappedValue;
                
                // Apply to preview
                updateFontVariation(columnIndex, currentVariations[columnIndex]);
                
                // Check and sync preset
                checkAndSyncPreset(columnIndex);
            }
        });
    });

    // Input field handlers
    document.querySelectorAll('.axis-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const columnIndex = parseInt(e.target.closest('.variable-axis-control').dataset.columnIndex);
            const axisTag = e.target.closest('.variable-axis-control').dataset.axisTag;
            let value = parseFloat(e.target.value);
            
            // Get axis for formatting
            const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
            const fontData = selectedFonts[columnIndex];
            const axis = fontData.variableAxes.find(a => a.tag === axisTag);
            
            // Constrain to min/max
            const sliderId = e.target.id.replace('-input', '-slider');
            const slider = document.getElementById(sliderId);
            if (slider) {
                const min = parseFloat(slider.min);
                const max = parseFloat(slider.max);
                value = Math.max(min, Math.min(max, value));
                
                // Format and update display
                if (axis) {
                    e.target.value = formatAxisValue(value, axis);
                } else {
                    e.target.value = value;
                }
                slider.value = value;
            }
            
            // Update variations
            if (!currentVariations[columnIndex]) {
                currentVariations[columnIndex] = {};
            }
            currentVariations[columnIndex][axisTag] = value;
            
            // Apply to preview
            updateFontVariation(columnIndex, currentVariations[columnIndex]);
            
            // Check and sync preset
            checkAndSyncPreset(columnIndex);
        });
        
        // Add blur handler to snap to tick when input loses focus
        input.addEventListener('blur', (e) => {
            const columnIndex = parseInt(e.target.closest('.variable-axis-control').dataset.columnIndex);
            const axisTag = e.target.closest('.variable-axis-control').dataset.axisTag;
            const currentValue = parseFloat(e.target.value);
            
            // Snap to nearest tick
            const snappedValue = snapToNearestTick(columnIndex, axisTag, currentValue);
            
            if (snappedValue !== currentValue) {
                // Get axis for formatting
                const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
                const fontData = selectedFonts[columnIndex];
                const axis = fontData.variableAxes.find(a => a.tag === axisTag);
                
                // Update input with formatted value
                if (axis) {
                    e.target.value = formatAxisValue(snappedValue, axis);
                } else {
                    e.target.value = snappedValue;
                }
                
                // Update slider
                const sliderId = e.target.id.replace('-input', '-slider');
                const slider = document.getElementById(sliderId);
                if (slider) {
                    slider.value = snappedValue;
                }
                
                // Update variations
                if (!currentVariations[columnIndex]) {
                    currentVariations[columnIndex] = {};
                }
                currentVariations[columnIndex][axisTag] = snappedValue;
                
                // Apply to preview
                updateFontVariation(columnIndex, currentVariations[columnIndex]);
                
                // Check and sync preset
                checkAndSyncPreset(columnIndex);
            }
        });
    });

    // Named variations dropdown
    document.querySelectorAll('.named-variations-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const columnIndex = parseInt(e.target.dataset.columnIndex);
            const selectedIndex = parseInt(e.target.value);
            
            if (selectedIndex >= 0) {
                const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
                const fontData = selectedFonts[columnIndex];
                const variation = fontData.namedVariations[selectedIndex];
                
                if (variation && variation.coordinates) {
                    // Update current variations
                    currentVariations[columnIndex] = { ...variation.coordinates };
                    
                    // Update sliders and inputs
                    Object.entries(variation.coordinates).forEach(([tag, value]) => {
                        const axisControl = document.querySelector(
                            `.variable-axis-control[data-axis-tag="${tag}"][data-column-index="${columnIndex}"]`
                        );
                        if (axisControl) {
                            const slider = axisControl.querySelector('.axis-slider');
                            const input = axisControl.querySelector('.axis-input');
                            const axis = fontData.variableAxes.find(a => a.tag === tag);
                            
                            if (slider) slider.value = value;
                            if (input && axis) {
                                input.value = formatAxisValue(value, axis);
                            } else if (input) {
                                input.value = value;
                            }
                        }
                    });
                    
                    // Apply to preview
                    updateFontVariation(columnIndex, currentVariations[columnIndex]);
                }
            }
        });
    });

    // Reset button
    document.querySelectorAll('.btn-reset-variations').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const columnIndex = parseInt(e.target.dataset.columnIndex);
            resetVariations(columnIndex);
        });
    });
}

function checkAndSyncPreset(columnIndex) {
    const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
    const fontData = selectedFonts[columnIndex];
    if (!fontData || !fontData.isVariable) return;
    
    const variations = currentVariations[columnIndex];
    if (!variations) return;
    
    const namedVariations = fontData.namedVariations || [];
    if (namedVariations.length === 0) return;
    
    // Find matching preset
    const matchingPresetIndex = namedVariations.findIndex(variation => {
        // Check if all coordinates in the preset match current variations
        // A preset may only define some axes, so we check if all preset-defined axes match
        const presetCoords = variation.coordinates || {};
        const presetTags = Object.keys(presetCoords);
        
        if (presetTags.length === 0) return false;
        
        // All preset coordinates must match current variations
        return presetTags.every(tag => {
            const presetValue = presetCoords[tag];
            const currentValue = variations[tag];
            if (currentValue == null) return false;
            
            // Use tolerance - for most axes, 0.01 is fine, but for weight use 1.0
            const tolerance = tag === 'wght' ? 1.0 : 0.01;
            return Math.abs(presetValue - currentValue) < tolerance;
        });
    });
    
    // Update dropdown
    const select = document.querySelector(
        `.named-variations-select[data-column-index="${columnIndex}"]`
    );
    if (select) {
        select.value = matchingPresetIndex >= 0 ? matchingPresetIndex.toString() : '';
    }
}

function resetVariations(columnIndex) {
    const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
    const fontData = selectedFonts[columnIndex];
    
    if (!fontData || !fontData.isVariable) return;
    
    // Reset to defaults
    const defaults = {};
    fontData.variableAxes.forEach(axis => {
        defaults[axis.tag] = axis.default;
    });
    currentVariations[columnIndex] = defaults;
    
    // Update sliders and inputs
    fontData.variableAxes.forEach(axis => {
        const axisControl = document.querySelector(
            `.variable-axis-control[data-axis-tag="${axis.tag}"][data-column-index="${columnIndex}"]`
        );
        if (axisControl) {
            const slider = axisControl.querySelector('.axis-slider');
            const input = axisControl.querySelector('.axis-input');
            if (slider) slider.value = axis.default;
            if (input) {
                input.value = formatAxisValue(axis.default, axis);
            }
        }
    });
    
    // Reset named variations dropdown
    const select = document.querySelector(
        `.named-variations-select[data-column-index="${columnIndex}"]`
    );
    if (select) select.value = '';
    
    // Apply to preview
    updateFontVariation(columnIndex, currentVariations[columnIndex]);
    
    // Check and sync preset after reset
    checkAndSyncPreset(columnIndex);
}

function alignMetadataRows() {
    // Get all columns
    const columns = document.querySelectorAll('.font-column');
    if (columns.length === 0) return;

    // Get all unique row IDs
    const rowIds = new Set();
    columns.forEach(column => {
        column.querySelectorAll('.metadata-row[data-row-id]').forEach(row => {
            const rowId = row.getAttribute('data-row-id');
            if (rowId) rowIds.add(rowId);
        });
    });

    // For each row ID, find all matching rows and align their heights
    rowIds.forEach(rowId => {
        const matchingRows = Array.from(document.querySelectorAll(`.metadata-row[data-row-id="${rowId}"]`))
            .filter(row => {
                // Only align rows that are in visible (non-collapsed) sections
                const section = row.closest('.section-content');
                return section && !section.classList.contains('collapsed');
            });

        if (matchingRows.length === 0) return;

        // Find the maximum height
        let maxHeight = 0;
        matchingRows.forEach(row => {
            // Reset height to auto to get natural height
            row.style.height = 'auto';
            const height = row.offsetHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        // Set all matching rows to the same height
        if (maxHeight > 0) {
            matchingRows.forEach(row => {
                row.style.height = `${maxHeight}px`;
            });
        }
    });
}

function createSection(title, rows, columnIndex) {
    const sectionId = `${title.toLowerCase().replace(/\s+/g, '-')}-${columnIndex}`;
    const isCollapsed = collapsedSections.has(title);

    return `
        <div class="metadata-section">
            <div class="section-header" data-section="${title}">
                <span>${title}</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">
                ${rows.map(([label, value, rowId]) => `
                    <div class="metadata-row" data-row-id="${rowId || ''}">
                        <div class="metadata-label">${label}</div>
                        <div class="metadata-value">${value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}


// Make toggleFeature globally accessible for inline handlers
window.toggleFeature = function(columnIndex, featureTag) {
    if (!activeFeatures[columnIndex]) {
        activeFeatures[columnIndex] = new Set();
    }
    
    if (activeFeatures[columnIndex].has(featureTag)) {
        activeFeatures[columnIndex].delete(featureTag);
    } else {
        activeFeatures[columnIndex].add(featureTag);
    }
    
    applyFeaturesToPreview(columnIndex);
    
    // Update UI to reflect active state (handle both feature-item and feature-expanded-row)
    const featureItem = document.querySelector(
        `.feature-item[data-column-index="${columnIndex}"][data-feature-tag="${featureTag}"]`
    );
    const featureRow = document.querySelector(
        `.feature-expanded-row[data-column-index="${columnIndex}"][data-feature-tag="${featureTag}"]`
    );
    
    const isActive = activeFeatures[columnIndex].has(featureTag);
    
    if (featureItem) {
        if (isActive) {
            featureItem.classList.add('active');
        } else {
            featureItem.classList.remove('active');
        }
    }
    
    if (featureRow) {
        if (isActive) {
            featureRow.classList.add('active');
        } else {
            featureRow.classList.remove('active');
        }
    }
};

function applyFeaturesToPreview(columnIndex) {
    const previewElement = document.querySelector(`.preview-text-${columnIndex}`);
    if (!previewElement) return;
    
    const features = activeFeatures[columnIndex] || new Set();
    if (features.size === 0) {
        previewElement.style.fontFeatureSettings = 'normal';
    } else {
        const featureString = Array.from(features).map(tag => `"${tag}" 1`).join(', ');
        previewElement.style.fontFeatureSettings = featureString;
    }
}

// Sort features: stylistic sets (ss01-ss20) first, then alphabetical
function sortFeatures(features) {
    const sorted = [...features];
    
    return sorted.sort((a, b) => {
        const tagA = typeof a === 'string' ? a : a.tag;
        const tagB = typeof b === 'string' ? b : b.tag;
        
        // Check if either is a stylistic set
        const isSSA = tagA.startsWith('ss') && /^ss\d{2}$/.test(tagA);
        const isSSB = tagB.startsWith('ss') && /^ss\d{2}$/.test(tagB);
        
        // Both are stylistic sets - sort numerically
        if (isSSA && isSSB) {
            const numA = parseInt(tagA.slice(2));
            const numB = parseInt(tagB.slice(2));
            return numA - numB;
        }
        
        // Only A is stylistic set - A comes first
        if (isSSA && !isSSB) return -1;
        
        // Only B is stylistic set - B comes first
        if (!isSSA && isSSB) return 1;
        
        // Neither is stylistic set - sort alphabetically
        return tagA.localeCompare(tagB);
    });
}

function createFeaturesSection(features, columnIndex) {
    const sectionId = `features-${columnIndex}`;
    const isCollapsed = collapsedSections.has('OpenType Features');
    const featureCount = features && features.length > 0 ? features.length : 0;
    const isActive = activeFeatures[columnIndex] || new Set();
    
    // Sort features: stylistic sets first, then alphabetical
    const sortedFeatures = sortFeatures(features);

    return `
        <div class="metadata-section">
            <div class="section-header" data-section="OpenType Features">
                <span>OpenType Features (${featureCount})</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">
                ${featureCount > 0 ? `
                    <div class="features-list">
                        ${sortedFeatures.map(f => {
                            const featureTag = typeof f === 'string' ? f : f.tag;
                            const featureInfo = FEATURE_DESCRIPTIONS[featureTag];
                            const featureName = featureInfo ? featureInfo.name : `OpenType feature: ${featureTag}`;
                            const featureDescription = featureInfo ? featureInfo.description : '';
                            const isFeatureActive = isActive.has(featureTag);
                            
                            // Escape for HTML attributes
                            const escapedName = featureName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            const escapedDescription = featureDescription.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            
                            return `
                                <div class="feature-item ${isFeatureActive ? 'active' : ''}" 
                                     data-column-index="${columnIndex}" 
                                     data-feature-tag="${featureTag}"
                                     data-feature-name="${escapedName}"
                                     data-feature-description="${escapedDescription}"
                                     onclick="toggleFeature(${columnIndex}, '${featureTag}')">
                                    <span class="feature-tag">${featureTag}</span>
                                    <div class="feature-popover">
                                        <div class="feature-popover-name">${featureName}</div>
                                        <div class="feature-popover-description">${featureDescription}</div>
                                        <div class="feature-popover-arrow"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="metadata-row">
                        <div class="metadata-value metadata-empty">
                            No OpenType features found in this font
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
}

function createVariableAxesSection(axes, columnIndex) {
    const sectionId = `variable-${columnIndex}`;
    const isCollapsed = collapsedSections.has('Variable Axes');

    return `
        <div class="metadata-section">
            <div class="section-header" data-section="Variable Axes">
                <span>Variable Axes (${axes.length})</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">
                ${axes.map(axis => `
                    <div class="metadata-row">
                        <div class="metadata-label">${axis.tag}</div>
                        <div class="metadata-value">${axis.min} - ${axis.max} (default: ${axis.default})</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createTablesSection(tables, columnIndex) {
    const sectionId = `tables-${columnIndex}`;
    const isCollapsed = collapsedSections.has('Font Tables');

    return `
        <div class="metadata-section">
            <div class="section-header" data-section="Font Tables">
                <span>Font Tables (${tables.length})</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">
                <div class="metadata-row">
                    <div class="metadata-value">
                        ${tables.map(t => `<span class="ot-feature">${t}</span>`).join(' ')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleSection(header) {
    const sectionName = header.dataset.section;
    const isCurrentlyCollapsed = collapsedSections.has(sectionName);
    
    // Find all matching sections across all columns
    const allMatchingHeaders = document.querySelectorAll(`[data-section="${sectionName}"]`);
    
    // Toggle all matching sections
    allMatchingHeaders.forEach(matchingHeader => {
        const toggle = matchingHeader.querySelector('.section-toggle');
        const content = matchingHeader.nextElementSibling;
        
        if (isCurrentlyCollapsed) {
            // Expand all
            collapsedSections.delete(sectionName);
            toggle.classList.remove('collapsed');
            content.classList.remove('collapsed');
        } else {
            // Collapse all
            collapsedSections.add(sectionName);
            toggle.classList.add('collapsed');
            content.classList.add('collapsed');
        }
    });
    
    // Re-align rows after state changes
    setTimeout(alignMetadataRows, 100);
}

function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = 'status';
    if (type === 'error') status.classList.add('error');
    status.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
}

// Sidebar resize functionality
function initSidebarResize() {
    if (!resizeHandle || !sidebar) return;

    const SIDEBAR_MIN_WIDTH = 250;
    const SIDEBAR_MAX_WIDTH = 600;
    const STORAGE_KEY = 'fontAnalyzer_sidebarWidth';

    // Restore saved width
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth) {
        const width = parseInt(savedWidth, 10);
        if (width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
            document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
        }
    }

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    function startResize(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    function doResize(e) {
        if (!isResizing) return;
        
        const diff = e.clientX - startX;
        let newWidth = startWidth + diff;
        
        // Constrain to min/max
        newWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, newWidth));
        
        // Update sidebar width
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        
        // Re-align rows if fonts are displayed
        if (selectedIndices.size > 0) {
            alignMetadataRows();
        }
    }

    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Save width to localStorage
        const currentWidth = sidebar.offsetWidth;
        localStorage.setItem(STORAGE_KEY, currentWidth.toString());
    }

    resizeHandle.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

// Initialize sidebar resize and font list on page load
function initializeApp() {
    initSidebarResize();
    // Ensure fontList element exists before rendering
    if (fontList) {
        renderFontList(); // Initialize font list with browse button
    }
}

// Load directory handle on startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        initializeApp();
        await loadDirectoryHandle();
    });
} else {
    // DOM already loaded
    initializeApp();
    loadDirectoryHandle();
}

