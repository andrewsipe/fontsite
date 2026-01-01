/* ============================================
   FONTSITE 2.0 - FONT ANALYZER
   Organized into clear sections for maintainability
   ============================================ */

// Debug flag - set to true to enable verbose console logging
const DEBUG = false;

/* ============================================
   MODULE: ICONS
   (Organized as if this were js/icons.js)
   Tabler Icons helper function for consistent icon usage
   ============================================ */

/**
 * Tabler Icons SVG paths
 * Source: https://tabler.io/icons
 */
const iconPaths = {
    'typography': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20l3 0" /><path d="M14 20l7 0" /><path d="M6.9 15l6.9 0" /><path d="M10.2 6.3l5.8 13.7" /><path d="M5 20l6 -16l2 0l7 16" />',
    'file-typography': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M11 18h2" /><path d="M12 18v-7" /><path d="M9 12v-1h6v1" />',
    'layout-columns': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M12 4l0 16" />',
    'layout-rows': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M4 12l16 0" />',
    'layout-grid': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />',
    'folder-open': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" />',
    'grip-vertical': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',
    'check': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" />'
};

/**
 * Generate inline SVG icon HTML
 * @param {string} name - Icon name (e.g., 'typography', 'layout-columns')
 * @param {Object} options - Icon options
 * @param {string} options.size - Icon size (default: '1em')
 * @param {string} options.color - Icon color (default: 'currentColor')
 * @param {string} options.class - Additional CSS classes
 * @param {number} options.strokeWidth - Stroke width (default: 2)
 * @returns {string} - HTML string for the SVG icon
 */
function icon(name, options = {}) {
    const size = options.size;
    const className = options.class || '';
    
    if (!iconPaths[name]) {
        console.warn(`Icon "${name}" not found`);
        return '';
    }
    
    // If size is provided, use inline style; otherwise rely on CSS 1em default
    const sizeStyle = size ? `width: ${size}; height: ${size};` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-${name} ${className}" style="${sizeStyle}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]}</svg>`;
}

/* ============================================
   MODULE: STATE MANAGEMENT
   (Organized as if this were js/state.js)
   Centralized state object and state management functions
   ============================================ */

/**
 * Create initial application state
 * @returns {Object} Initial state object
 */
function createState() {
    return {
        // Font data
        fonts: [],
        
        // Selection - array maintains order, easier to work with than Set
        selected: [], // Array of font indices
        
        // Column states - each column has mode, variations, features
        columns: {}, // columnIndex -> { 
                      //   mode: 'normal'|'variable'|'opentype', 
                      //   variations: {}, 
                      //   features: Set(),
                      //   highlight: false // Future: comparison highlighting
                      // }
        
        // View settings
        view: {
            mode: localStorage.getItem('fontAnalyzer_viewMode') || 'column', // 'column', 'gallery', 'horizontal'
            sidebarWidth: parseInt(localStorage.getItem('fontAnalyzer_sidebarWidth')) || 350,
            // Future: preview settings, theme, focus mode
        },
        
        // UI state
        ui: {
            collapsedSections: new Set(),
            expandedFamilies: new Set(),
            horizontalMetadataFields: JSON.parse(localStorage.getItem('fontAnalyzer_horizontalFields') || '["family", "subfamily", "glyphs", "weightClass", "format", "size"]'),
            snapToTicks: localStorage.getItem('fontAnalyzer_snapToTicks') !== 'false', // Default to true
            familyOrder: [], // Custom order for family groups
            // Future: glyph viewer state
        },
        
        // Internal state (not part of user-facing state)
        _internal: {
            fontFaceStyleElements: [],
            fontFaceStyleMap: new Map(), // dataUrl -> { styleElement, fontFaceName }
            lastDirectoryHandle: null,
        },
        
        // Future feature state hooks (commented for now, will be uncommented as features are added):
        // preview: { size: 'auto', waterfall: false, sampleText: 'default' },
        // theme: { mode: 'auto', tint: null, contrast: 1.0 },
        // glyphViewer: { active: false, search: '', filter: 'all', selected: null },
        // focus: { active: false, target: null }
    };
}

// Initialize state
let state = createState();

/**
 * Get current state (read-only access)
 * @returns {Object} Current state object
 */
function getState() {
    return state;
}

/**
 * Update state immutably
 * @param {Object|Function} updates - Object with updates or function that returns updates
 */
function updateState(updates) {
    if (typeof updates === 'function') {
        state = { ...state, ...updates(state) };
    } else {
        state = { ...state, ...updates };
    }
    // Trigger render (will be connected to render functions)
    if (typeof render === 'function') {
        render();
    }
}

/**
 * Get column state for a specific column index
 * @param {number} columnIndex - Column index
 * @returns {Object} Column state object
 */
function getColumnState(columnIndex) {
    if (!state.columns[columnIndex]) {
        state.columns[columnIndex] = {
            mode: 'normal',
            variations: {},
            features: new Set(),
            highlight: false
        };
    }
    return state.columns[columnIndex];
}

/**
 * Update column state immutably
 * @param {number} columnIndex - Column index
 * @param {Object} updates - Updates to apply to column state
 */
function updateColumnState(columnIndex, updates) {
    const currentColumn = getColumnState(columnIndex);
    state.columns[columnIndex] = { ...currentColumn, ...updates };
    // Deep copy Sets and objects that need to be immutable
    if (updates.features !== undefined) {
        state.columns[columnIndex].features = new Set(updates.features);
    }
    if (updates.variations !== undefined) {
        state.columns[columnIndex].variations = { ...updates.variations };
    }
}

// Legacy state variables for backward compatibility during migration
// These will be removed once all code is migrated to use state object
let fonts = state.fonts;
let selectedIndices = new Set(state.selected);
let collapsedSections = state.ui.collapsedSections;
let variableMode = new Set();
let otMode = new Set();
let expandedFamilies = state.ui.expandedFamilies;
let currentVariations = {};
let activeFeatures = {};
let viewMode = state.view.mode;
let horizontalMetadataFields = state.ui.horizontalMetadataFields;
let snapToTicks = state.ui.snapToTicks;
let familyOrder = state.ui.familyOrder;
let fontFaceStyleElements = state._internal.fontFaceStyleElements;
const fontFaceStyleMap = state._internal.fontFaceStyleMap;
let lastDirectoryHandle = state._internal.lastDirectoryHandle;

// OpenType feature friendly names from Microsoft OpenType spec
// Source: https://learn.microsoft.com/en-us/typography/opentype/spec/featurelist
const FEATURE_NAMES = {
    'aalt': 'Access All Alternates',
    'abvf': 'Above-base Forms',
    'abvm': 'Above-base Mark Positioning',
    'abvs': 'Above-base Substitutions',
    'afrc': 'Alternative Fractions',
    'akhn': 'Akhand',
    'apkn': 'Kerning for Alternate Proportional Widths',
    'blwf': 'Below-base Forms',
    'blwm': 'Below-base Mark Positioning',
    'blws': 'Below-base Substitutions',
    'calt': 'Contextual Alternates',
    'case': 'Case-sensitive Forms',
    'ccmp': 'Glyph Composition / Decomposition',
    'cfar': 'Conjunct Form After Ro',
    'chws': 'Contextual Half-width Spacing',
    'cjct': 'Conjunct Forms',
    'clig': 'Contextual Ligatures',
    'cpct': 'Centered CJK Punctuation',
    'cpsp': 'Capital Spacing',
    'cswh': 'Contextual Swash',
    'curs': 'Cursive Positioning',
    'c2pc': 'Petite Capitals From Capitals',
    'c2sc': 'Small Capitals From Capitals',
    'dist': 'Distances',
    'dlig': 'Discretionary Ligatures',
    'dnom': 'Denominators',
    'dtls': 'Dotless Forms',
    'expt': 'Expert Forms',
    'falt': 'Final Glyph on Line Alternates',
    'fin2': 'Terminal Forms #2',
    'fin3': 'Terminal Forms #3',
    'fina': 'Terminal Forms',
    'flac': 'Flattened Accent Forms',
    'frac': 'Fractions',
    'fwid': 'Full Widths',
    'half': 'Half Forms',
    'haln': 'Halant Forms',
    'halt': 'Alternate Half Widths',
    'hist': 'Historical Forms',
    'hkna': 'Horizontal Kana Alternates',
    'hlig': 'Historical Ligatures',
    'hngl': 'Hangul',
    'hojo': 'Hojo Kanji Forms (JIS X 0212-1990 Kanji Forms)',
    'hwid': 'Half Widths',
    'init': 'Initial Forms',
    'isol': 'Isolated Forms',
    'ital': 'Italics',
    'jalt': 'Justification Alternates',
    'jp78': 'JIS78 Forms',
    'jp83': 'JIS83 Forms',
    'jp90': 'JIS90 Forms',
    'jp04': 'JIS2004 Forms',
    'kern': 'Kerning',
    'lfbd': 'Left Bounds',
    'liga': 'Standard Ligatures',
    'ljmo': 'Leading Jamo Forms',
    'lnum': 'Lining Figures',
    'locl': 'Localized Forms',
    'ltra': 'Left-to-right Alternates',
    'ltrm': 'Left-to-right Mirrored Forms',
    'mark': 'Mark Positioning',
    'med2': 'Medial Forms #2',
    'medi': 'Medial Forms',
    'mgrk': 'Mathematical Greek',
    'mkmk': 'Mark to Mark Positioning',
    'mset': 'Mark Positioning via Substitution',
    'nalt': 'Alternate Annotation Forms',
    'nlck': 'NLC Kanji Forms',
    'nukt': 'Nukta Forms',
    'numr': 'Numerators',
    'onum': 'Oldstyle Figures',
    'opbd': 'Optical Bounds',
    'ordn': 'Ordinals',
    'ornm': 'Ornaments',
    'palt': 'Proportional Alternate Widths',
    'pcap': 'Petite Capitals',
    'pkna': 'Proportional Kana',
    'pnum': 'Proportional Figures',
    'pref': 'Pre-base Forms',
    'pres': 'Pre-base Substitutions',
    'pstf': 'Post-base Forms',
    'psts': 'Post-base Substitutions',
    'pwid': 'Proportional Widths',
    'qwid': 'Quarter Widths',
    'rand': 'Randomize',
    'rclt': 'Required Contextual Alternates',
    'rkrf': 'Rakar Forms',
    'rlig': 'Required Ligatures',
    'rphf': 'Reph Form',
    'rtbd': 'Right Bounds',
    'rtla': 'Right-to-left Alternates',
    'rtlm': 'Right-to-left Mirrored Forms',
    'ruby': 'Ruby Notation Forms',
    'rvrn': 'Required Variation Alternates',
    'salt': 'Stylistic Alternates',
    'sinf': 'Scientific Inferiors',
    'size': 'Optical size',
    'smcp': 'Small Capitals',
    'smpl': 'Simplified Forms',
    // Stylistic Sets (ss01-ss20) are generated dynamically - see getFeatureName()
    'ssty': 'Math Script-style Alternates',
    'stch': 'Stretching Glyph Decomposition',
    'subs': 'Subscript',
    'sups': 'Superscript',
    'swsh': 'Swash',
    'titl': 'Titling',
    'tjmo': 'Trailing Jamo Forms',
    'tnam': 'Traditional Name Forms',
    'tnum': 'Tabular Figures',
    'trad': 'Traditional Forms',
    'twid': 'Third Widths',
    'unic': 'Unicase',
    'valt': 'Alternate Vertical Metrics',
    'vapk': 'Kerning for Alternate Proportional Vertical Metrics',
    'vatu': 'Vattu Variants',
    'vchw': 'Vertical Contextual Half-width Spacing',
    'vert': 'Vertical Alternates',
    'vhal': 'Alternate Vertical Half Metrics',
    'vjmo': 'Vowel Jamo Forms',
    'vkna': 'Vertical Kana Alternates',
    'vkrn': 'Vertical Kerning',
    'vpal': 'Proportional Alternate Vertical Metrics',
    'vrt2': 'Vertical Alternates and Rotation',
    'vrtr': 'Vertical Alternates for Rotation',
    'zero': 'Slashed Zero',
    // Character Variants (cv01-cv99) are generated dynamically - see getFeatureName()
};

/**
 * Get friendly name for an OpenType feature tag
 * Handles stylistic sets (ss01-ss20) and character variants (cv01-cv99) dynamically
 * @param {string} tag - The feature tag (e.g., 'liga', 'ss01', 'cv05')
 * @returns {string} - The friendly name for the feature
 */
function getFeatureName(tag) {
    if (!tag) return `OpenType feature: ${tag}`;
    
    // Check static FEATURE_NAMES first
    if (FEATURE_NAMES[tag]) {
        return FEATURE_NAMES[tag];
    }
    
    // Generate stylistic set names (ss01-ss20)
    const ssMatch = tag.match(/^ss(\d{2})$/);
    if (ssMatch) {
        const ssNum = parseInt(ssMatch[1], 10);
        if (ssNum >= 1 && ssNum <= 20) {
            return `Stylistic Set ${ssNum}`;
        }
    }
    
    // Generate character variant names (cv01-cv99)
    const cvMatch = tag.match(/^cv(\d{2})$/);
    if (cvMatch) {
        const cvNum = parseInt(cvMatch[1], 10);
        if (cvNum >= 1 && cvNum <= 99) {
            return `Character Variant ${cvNum}`;
        }
    }
    
    // Fallback
    return `OpenType feature: ${tag}`;
}

// DOM element references
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

// Preview text state
const defaultPreviewText = `The quick brown fox
ABCDEFGHIJKLM
abcdefghijklm
0123456789`;
let previewText = defaultPreviewText;
let previewState = null;

// Browser capability detection
const isFileSystemAccessAPISupported = 'showDirectoryPicker' in window;

if (!isFileSystemAccessAPISupported) {
    console.info('File System Access API not available. Directory selection will use traditional file picker.');
}

/* ============================================
   SECTION 6: EVENT HANDLERS
   Event coordination and handlers
   ============================================ */

// Drag and drop handlers - make entire sidebar a drop zone
sidebar.addEventListener('dragover', (e) => {
    // Only handle file drops, not SortableJS drags
    // Check if this is a file drag (not a sortable drag)
    const isFileDrag = e.dataTransfer.types.includes('Files') || 
                       e.dataTransfer.types.includes('application/x-moz-file') ||
                       Array.from(e.dataTransfer.types).some(type => type === 'Files' || type.startsWith('application/'));
    
    // Skip if this is a SortableJS drag (sortable drags have different types)
    const isSortableDrag = e.dataTransfer.types.includes('text/plain') && 
                          (e.target.closest('.font-item') || e.target.closest('.font-family-header'));
    
    if (isFileDrag && !isSortableDrag) {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.add('drag-over');
    }
});

sidebar.addEventListener('dragleave', (e) => {
    // Only remove drag-over if we're actually leaving the sidebar
    // relatedTarget might be null or point to a child element
    if (!sidebar.contains(e.relatedTarget)) {
        sidebar.classList.remove('drag-over');
    }
});

// Also clear drag-over when drag ends (safety net)
document.addEventListener('dragend', () => {
    sidebar.classList.remove('drag-over');
});

sidebar.addEventListener('drop', async (e) => {
    // Only handle file drops, not SortableJS drags
    const isFileDrag = e.dataTransfer.types.includes('Files') || 
                       e.dataTransfer.types.includes('application/x-moz-file') ||
                       Array.from(e.dataTransfer.types).some(type => type === 'Files' || type.startsWith('application/'));
    
    // Skip if this is a SortableJS drag
    const isSortableDrag = e.target.closest('.font-item') || e.target.closest('.font-family-header');
    
    if (!isFileDrag || isSortableDrag) {
        return;
    }
    
    // Prevent browser default action (opening/downloading files)
    e.preventDefault();
    e.stopPropagation();
    sidebar.classList.remove('drag-over');
    
    // Try to use File System Access API if available (for directory support)
    if (isFileSystemAccessAPISupported && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const files = [];
        
        for (const item of e.dataTransfer.items) {
            try {
                // Check if item supports getAsFileSystemHandle (directory support)
                if (item.getAsFileSystemHandle) {
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
                } else {
                    // Fallback: get as regular file
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                }
            } catch (error) {
                // If getAsFileSystemHandle fails, try regular file handling
                try {
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                } catch (fileError) {
                    console.warn('Error getting file from drag item:', fileError);
                }
            }
        }
        
        if (files.length > 0) {
            handleFiles(files);
            return;
        }
    }
    
    // Fallback to traditional file list (for files or browsers without API support)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
    }
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
                    showStatus(`Error selecting files: ${error.message}`, 'error');
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
        // Always show directory picker when user explicitly selects directory
        // This allows them to choose a different directory each time
        const directoryHandle = await window.showDirectoryPicker();
        
        // Save for potential future use (but don't auto-use it on next selection)
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
            showStatus(`Error accessing directory: ${error.message}`, 'error');
        }
    }
}

// Make browseFonts globally accessible
window.browseFonts = browseFonts;

// Reset preview text function
function resetPreviewText(columnIndex = null) {
    previewText = defaultPreviewText;
    // Update hidden textarea (single source of truth)
    if (previewState) {
        previewState.value = defaultPreviewText;
        syncPreviews();
    }
}

// Make resetPreviewText globally accessible
window.resetPreviewText = resetPreviewText;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + R: Reset preview text
    if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        resetPreviewText();
        showStatus('Preview text reset', 'success');
    }
    
    // Esc: Close any open modals/panels (if we add them in the future)
    if (e.key === 'Escape') {
        // Future: close modals, clear selections, etc.
    }
    
    // Tab navigation between font columns (when in comparison view)
    if (e.key === 'Tab' && !e.shiftKey && selectedIndices.size > 0) {
        // Allow default Tab behavior for now
        // Future: could implement custom column navigation
    }
}, false);


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
    // Re-sync header heights after content change
    syncHeaderHeights();
}

// Sync header heights between logo-header and main-header
function syncHeaderHeights() {
    const logoHeader = document.querySelector('.logo-header');
    const mainHeader = document.querySelector('.main-header');
    
    if (logoHeader && mainHeader) {
        // Reset heights to get natural heights
        logoHeader.style.minHeight = '';
        mainHeader.style.minHeight = '';
        
        // Get both heights
        const logoHeight = logoHeader.offsetHeight;
        const mainHeight = mainHeader.offsetHeight;
        
        // Use the taller height for both
        const maxHeight = Math.max(logoHeight, mainHeight);
        logoHeader.style.minHeight = `${maxHeight}px`;
        mainHeader.style.minHeight = `${maxHeight}px`;
    }
}

// Initialize view mode UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateViewModeUI();
        syncHeaderHeights();
    });
} else {
    updateViewModeUI();
    syncHeaderHeights();
}

// Re-sync header heights on window resize (in case content changes)
window.addEventListener('resize', () => {
    syncHeaderHeights();
});

// Make preview text functions globally accessible
window.setViewMode = setViewMode;

// Re-align rows on window resize
window.addEventListener('resize', () => {
    if (selectedIndices.size > 0) {
        debouncedAlignMetadataRows();
        debouncedAlignColumnHeaders();
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

/* ============================================
   SECTION 2: FONT LOADING
   Font file loading, parsing, and metadata extraction
   ============================================ */

async function handleFiles(fileList) {
    // Early check: Ensure opentype.js is loaded
    if (typeof opentype === 'undefined') {
        showStatus('Font analyzer libraries failed to load. Please refresh the page.', 'error');
        return;
    }
    
    const files = Array.from(fileList).filter(file => {
        const ext = file.name.toLowerCase();
        return ext.endsWith('.ttf') || ext.endsWith('.otf') ||
               ext.endsWith('.woff') || ext.endsWith('.woff2');
    });

    if (files.length === 0) {
        showStatus('No valid font files found', 'error');
        return;
    }

    // File size validation
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const WARN_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = [];
    const rejectedFiles = [];

    for (const file of files) {
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (file.size > MAX_FILE_SIZE) {
            rejectedFiles.push({ name: file.name, size: fileSizeMB });
            showStatus(`Skipped ${file.name}: File too large (${fileSizeMB.toFixed(1)} MB). Maximum size is 50 MB.`, 'error');
        } else {
            if (file.size > WARN_FILE_SIZE) {
                showStatus(`Font file ${file.name} is very large (${fileSizeMB.toFixed(1)} MB). This may take a while to load.`, 'warning');
            }
            validFiles.push(file);
        }
    }
    
    if (validFiles.length === 0) {
        showStatus('No valid font files to process (all files were too large)', 'error');
        return;
    }
    
    if (rejectedFiles.length > 0 && validFiles.length > 0) {
        showStatus(`Processing ${validFiles.length} font file(s)... (${rejectedFiles.length} file(s) skipped due to size)`, 'info');
    } else {
        showStatus(`Processing ${validFiles.length} font file(s)...`);
    }

    // Show progress indicator for 10+ fonts
    const showProgress = validFiles.length >= 10;
    let progressBar = null;
    let progressContainer = null;
    
    if (showProgress) {
        progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Loading font 0 of ${validFiles.length}...</div>
        `;
        status.parentNode.insertBefore(progressContainer, status.nextSibling);
        progressBar = document.getElementById('progressFill');
    }
    
    let processedCount = 0;
    const failedFonts = []; // Collect all failed fonts for summary
    
    const updateProgress = () => {
        if (!showProgress) return;
        processedCount++;
        const percent = (processedCount / validFiles.length) * 100;
        
        requestAnimationFrame(() => {
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }
            const progressText = document.getElementById('progressText');
            if (progressText) {
                progressText.textContent = `Loading font ${processedCount} of ${validFiles.length}...`;
            }
        });
    };

    // Process font file (extracted for batch processing)
    async function processFontFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Use fontkit for metrics and general font info
            let fontkitFont;
            try {
                fontkitFont = fontkit.create(arrayBuffer);
            } catch (fontkitError) {
                console.error(`Error creating fontkit font for ${file.name}:`, fontkitError);
                throw new Error(`Failed to parse font file: ${fontkitError.message}`);
            }
            
            // Use opentype.js for OpenType feature extraction (more reliable)
            let opentypeFont = null;
            let features = [];
            try {
                // Check if opentype is available
                if (typeof opentype === 'undefined') {
                    console.error('opentype.js is not loaded!');
                    throw new Error('opentype.js not available');
                }
                
                opentypeFont = opentype.parse(arrayBuffer);
                
                // Debug: Log opentype.js structure
                if (opentypeFont && opentypeFont.tables) {
                    console.log(`[${file.name}] opentype.js structure:`, {
                        hasGsub: !!opentypeFont.tables.gsub,
                        hasGpos: !!opentypeFont.tables.gpos,
                        hasName: !!opentypeFont.tables.name,
                        gsubFeatures: opentypeFont.tables.gsub?.features?.length || 0,
                        namesType: opentypeFont.names ? (Array.isArray(opentypeFont.names) ? 'array' : 'object') : 'missing',
                        namesLength: opentypeFont.names ? (Array.isArray(opentypeFont.names) ? opentypeFont.names.length : Object.keys(opentypeFont.names).length) : 0
                    });
                }
                
                features = extractFeaturesFromOpentype(opentypeFont, fontkitFont);
                
                // DEBUG: Log what we actually extracted
                if (DEBUG) {
                    console.group(`[${file.name}] Feature Extraction Results`);
                    console.log('Total features:', features.length);
                    const ssFeatures = features.filter(f => f.tag && f.tag.match(/^ss\d{2}$/));
                    console.log('Stylistic sets found:', ssFeatures.length);
                    ssFeatures.forEach(f => {
                        console.log(`  ${f.tag}:`, {
                            hasLabel: !!f.label,
                            label: f.label,
                            uinameid: f.uinameid
                        });
                    });
                    console.groupEnd();
                }
            } catch (opentypeError) {
                console.warn(`Could not parse ${file.name} with opentype.js, falling back to fontkit:`, opentypeError);
                // Fallback to fontkit extraction if opentype.js fails
                features = extractOpenTypeFeatures(fontkitFont);
            }

            // Extract comprehensive metadata using fontkit
            let metadata;
            try {
                metadata = extractMetadata(fontkitFont, file);
            } catch (metadataError) {
                console.error(`Error extracting metadata for ${file.name}:`, metadataError);
                throw new Error(`Failed to extract metadata: ${metadataError.message}`);
            }
            
            // Override features with opentype.js results
            metadata.features = features;
            metadata.hasOpenTypeFeatures = features && features.length > 0;

            // Create object URL once for performance (avoid re-reading file on every comparison render)
            const objectUrl = URL.createObjectURL(file);

            fonts.push({
                id: `font_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...metadata,
                // Don't store font objects or file blob - only keep extracted metadata and objectUrl
                objectUrl: objectUrl, // Cached object URL for font file
                assignedFamily: null // User-assigned family override
            });
            
            // Update progress
            updateProgress();
        } catch (error) {
            // Collect error for summary instead of showing immediately
            console.error(`Error processing font ${file.name}:`, error);
            console.error('Error stack:', error.stack);
            failedFonts.push({ name: file.name, error: error.message });
            // Still update progress even on error
            updateProgress();
        }
    }
    
    // Batch processing for better performance
    const BATCH_SIZE = 5;
    for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
        const batch = validFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(file => processFontFile(file)));
        // Progress is updated within processFontFile
    }
    
    // Remove progress indicator when done
    if (showProgress && progressContainer) {
        setTimeout(() => {
            if (progressContainer.parentNode) {
                progressContainer.remove();
            }
        }, 500);
    }

    // Show summary of failed fonts if any
    if (failedFonts.length > 0) {
        const errorList = failedFonts.map(f => `${f.name}: ${f.error}`).join('\n');
        const errorMessage = failedFonts.length === 1 
            ? `Failed to load 1 font:\n${errorList}`
            : `Failed to load ${failedFonts.length} fonts:\n${errorList}`;
        showStatus(errorMessage, 'error');
    }
    
    if (fonts.length > 0) {
        const successMessage = failedFonts.length > 0
            ? `Successfully loaded ${fonts.length} font(s) (${failedFonts.length} failed)`
            : `Successfully loaded ${fonts.length} font(s)`;
        showStatus(successMessage, 'success');
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

/* ============================================
   SECTION 2: FONT LOADING (continued)
   Metadata extraction and font parsing
   ============================================ */

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

    // Features will be extracted using opentype.js in handleFiles()
    // Set defaults here - will be overridden by opentype.js extraction
    const features = [];
    const hasOpenTypeFeatures = false;

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

        // Variable font info - wrap in try-catch to prevent errors from breaking font loading
        variableAxes: (() => {
            try {
                return extractVariableAxes(font);
            } catch (error) {
                console.warn('Error extracting variable axes in extractMetadata:', error);
                return [];
            }
        })(),
        isVariable: (() => {
            try {
                return isVariableFont(font);
            } catch (error) {
                console.warn('Error checking if font is variable:', error);
                return false;
            }
        })(),
        namedVariations: (() => {
            try {
                return extractNamedVariations(font);
            } catch (error) {
                console.warn('Error extracting named variations in extractMetadata:', error);
                return [];
            }
        })()
    };
}

// Helper function to check if font is variable
function isVariableFont(font) {
    if (!font) return false;
    try {
        // Check if variationAxes exists and has entries
        if (font.variationAxes && Object.keys(font.variationAxes).length > 0) {
            return true;
        }
        // Fallback: check for fvar table
        const tables = font._src?.tables || {};
        return tables.fvar !== undefined;
    } catch (error) {
        console.warn('Error checking if font is variable:', error);
        return false;
    }
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

// Debug function to understand fontkit's structure (optional, for troubleshooting)
function debugFontStructure(font) {
    console.group('Font Structure Debug');
    
    // Check if GSUB exists
    console.log('Has GSUB:', !!font['GSUB']);
    console.log('Has GPOS:', !!font['GPOS']);
    
    if (font['GSUB']) {
        const GSUB = font['GSUB'];
        console.log('GSUB keys:', Object.keys(GSUB));
        console.log('GSUB.featureList:', GSUB.featureList);
        
        if (GSUB.featureList) {
            console.log('featureList type:', typeof GSUB.featureList);
            console.log('featureList is Array:', Array.isArray(GSUB.featureList));
            console.log('featureList keys:', Object.keys(GSUB.featureList));
            console.log('featureList sample:', GSUB.featureList[0] || GSUB.featureList[Object.keys(GSUB.featureList)[0]]);
        }
    }
    
    if (font['GPOS']) {
        const GPOS = font['GPOS'];
        console.log('GPOS keys:', Object.keys(GPOS));
        console.log('GPOS.featureList:', GPOS.featureList);
        
        if (GPOS.featureList) {
            console.log('featureList type:', typeof GPOS.featureList);
            console.log('featureList is Array:', Array.isArray(GPOS.featureList));
            console.log('featureList keys:', Object.keys(GPOS.featureList));
        }
    }
    
    // Check _src.tables
    if (font._src && font._src.tables) {
        console.log('_src.tables keys:', Object.keys(font._src.tables));
        if (font._src.tables.GSUB) {
            console.log('_src.tables.GSUB keys:', Object.keys(font._src.tables.GSUB));
        }
        if (font._src.tables.GPOS) {
            console.log('_src.tables.GPOS keys:', Object.keys(font._src.tables.GPOS));
        }
    }
    
    console.groupEnd();
}

// Helper function to look up name from opentype.js name table
function lookupOpentypeName(opentypeFont, nameID) {
    if (!nameID || nameID < 256) return null;
    
    // opentype.js stores names at font.names[nameID]
    if (opentypeFont.names && opentypeFont.names[nameID]) {
        const record = opentypeFont.names[nameID];
        
        // Try different language codes
        return record.en || record['en-US'] || record['en-GB'] ||
               Object.values(record)[0]; // First available
    }
    
    return null;
}

// Extract OpenType features using opentype.js (more reliable than fontkit)
// Uses fontkit for UINameID extraction (it exposes FeatureParams properly)
// Uses opentype.js for name table lookup (better name table access)
function extractFeaturesFromOpentype(opentypeFont, fontkitFont = null) {
    const features = []; // Array of { tag, label, uinameid }
    const featureSet = new Set();
    
    try {
        // Debug: Log opentype.js structure for first feature (only once per font)
        let debugLogged = false;
        
        // Extract features from GSUB table (substitution features)
        if (opentypeFont.tables && opentypeFont.tables.gsub && opentypeFont.tables.gsub.features) {
            opentypeFont.tables.gsub.features.forEach(feature => {
                const tag = feature.tag;
                if (tag && !featureSet.has(tag)) {
                    featureSet.add(tag);
                    
                    // Debug: Log structure for first stylistic set
                    if (!debugLogged && tag.match(/^ss\d{2}$/)) {
                        console.log('Debug opentype.js feature structure:', {
                            tag: tag,
                            feature: feature,
                            featureKeys: Object.keys(feature),
                            hasFeatureObj: !!feature.feature,
                            featureObjKeys: feature.feature ? Object.keys(feature.feature) : null,
                            featureParams: feature.feature?.featureParams,
                            FeatureParams: feature.feature?.FeatureParams,
                            params: feature.feature?.params,
                            // Try to access featureParams directly from feature
                            directFeatureParams: feature.featureParams,
                            directParams: feature.params,
                            // Check all properties
                            allFeatureKeys: feature.feature ? Object.keys(feature.feature) : [],
                            featureObjValues: feature.feature ? Object.values(feature.feature).slice(0, 3) : null
                        });
                        debugLogged = true;
                    }
                    
                    // Get feature label from name table if available
                    let label = null;
                    let uinameid = null;
                    
                    // PRIORITY 1: Try to extract UINameID from fontkit (it exposes FeatureParams properly)
                    // This is more reliable than opentype.js which doesn't parse FeatureParamsStylisticSet correctly
                    if (fontkitFont && fontkitFont.GSUB && fontkitFont.GSUB.featureList) {
                        const featureList = fontkitFont.GSUB.featureList;
                        const featureRecord = featureList[tag];
                        
                        if (featureRecord) {
                            // Try to access FeatureParams - fontkit stores it in different ways
                            if (featureRecord.FeatureParams && featureRecord.FeatureParams.UINameID) {
                                uinameid = featureRecord.FeatureParams.UINameID;
                            } else if (featureRecord.featureParams && featureRecord.featureParams.uinameid) {
                                uinameid = featureRecord.featureParams.uinameid;
                            } else if (featureRecord.featureParams && featureRecord.featureParams.UINameID) {
                                uinameid = featureRecord.featureParams.UINameID;
                            } else if (featureRecord.Feature && featureRecord.Feature.FeatureParams) {
                                const params = featureRecord.Feature.FeatureParams;
                                if (params.UINameID) {
                                    uinameid = params.UINameID;
                                }
                            }
                        }
                    }
                    
                    // PRIORITY 2: For stylistic sets, try calculated name ID as fallback
                    // OpenType spec: Stylistic sets typically use name IDs starting at 256
                    // ss01 -> Name ID 256, ss02 -> Name ID 257, etc.
                    // BUT this is not always consistent, so we prefer fontkit's UINameID
                    if (!uinameid && tag.match(/^ss\d{2}$/)) {
                        const ssNum = parseInt(tag.slice(2));
                        // Calculate name ID: 256 + (ssNum - 1)
                        // ss01 -> 256, ss02 -> 257, ss03 -> 258, etc.
                        const calculatedNameID = 256 + (ssNum - 1);
                        uinameid = calculatedNameID;
                    }
                    
                    // PRIORITY 3: Try opentype.js featureParams (less reliable, often just a number)
                    if (!uinameid) {
                        let params = null;
                        if (feature.featureParams) {
                            params = feature.featureParams;
                        } else if (feature.feature && feature.feature.featureParams) {
                            params = feature.feature.featureParams;
                        }
                        
                        if (params) {
                            if (typeof params === 'number' && params >= 256) {
                                // Only use if it's a valid name ID (>= 256 for user-defined)
                                uinameid = params;
                            } else if (typeof params === 'object') {
                                // UINameID is stored directly as uiNameID, UINameID, or uinameid
                                uinameid = params.uiNameID || params.UINameID || params.uinameid;
                                // Must be a valid nameID (number >= 256, typically)
                                if (typeof uinameid === 'number' && uinameid >= 256) {
                                    // Valid - will use it
                                } else {
                                    uinameid = null;
                                }
                            }
                        }
                    }
                    
                    // Look up the name using opentype.js (better name table access)
                    if (uinameid && typeof uinameid === 'number' && uinameid >= 256) {
                        label = lookupOpentypeName(opentypeFont, uinameid);
                        if (!label) {
                            console.warn(`UINameID ${uinameid} found for ${tag} but name lookup failed`);
                        }
                    }
                    
                    // Fallback to getFeatureName() (handles static names, ss##, and cv##)
                    if (!label) {
                        label = getFeatureName(tag);
                    }
                    
                    // Fallback for stylistic sets (if no custom name found)
                    if (!label && tag.match(/^ss\d{2}$/)) {
                        const ssNum = parseInt(tag.slice(2));
                        label = `Stylistic Set ${ssNum}`;
                    }
                    
                    // Final fallback: use tag as label
                    if (!label) {
                        label = `OpenType feature: ${tag}`;
                    }
                    
                    features.push({ tag, label, uinameid });
                }
            });
        }
        
        // Extract features from GPOS table (positioning features)
        if (opentypeFont.tables && opentypeFont.tables.gpos && opentypeFont.tables.gpos.features) {
            opentypeFont.tables.gpos.features.forEach(feature => {
                const tag = feature.tag;
                if (tag && !featureSet.has(tag)) {
                featureSet.add(tag);
                    
                    // Get feature label from name table if available
                    let label = null;
                    let uinameid = null;
                    
                    // Check for UINameID in feature params
                    if (feature.feature) {
                        const featureObj = feature.feature;
                        
                        const params = featureObj.featureParams || 
                                      featureObj.FeatureParams ||
                                      featureObj.params ||
                                      (featureObj.feature && featureObj.feature.featureParams) ||
                                      (featureObj.feature && featureObj.feature.FeatureParams);
                        
                        if (params) {
                            uinameid = params.uiNameID || 
                                      params.UINameID || 
                                      params.uinameid ||
                                      params.uiNameId ||
                                      params.version;
                            
                            if (typeof uinameid === 'number' && uinameid > 0) {
                                label = lookupOpentypeName(opentypeFont, uinameid);
                            } else {
                                uinameid = null;
                            }
                        }
                    }
                    
                    // Fallback to getFeatureName() (handles static names, ss##, and cv##)
                    if (!label) {
                        label = getFeatureName(tag);
                    }
                    
                    // Final fallback
                    if (!label) {
                        label = `OpenType feature: ${tag}`;
                    }
                    
                    features.push({ tag, label, uinameid });
                }
            });
        }
        
        // Sort by tag
        features.sort((a, b) => a.tag.localeCompare(b.tag));
        
        return features;
    } catch (error) {
        console.error('Error extracting OpenType features from opentype.js:', error);
        return [];
    }
}

function extractOpenTypeFeatures(font) {
    const features = []; // Array of { tag, label, uinameid }
    const featureSet = new Set();
    
    try {
        // Try multiple access paths to find features - fontkit structure can vary
        
        // Method 1: Try font._src.tables.GSUB directly (without .table)
        if (font._src && font._src.tables) {
            const srcTables = font._src.tables;
            
            // Try GSUB directly
            if (srcTables.GSUB) {
                try {
                    // Try srcTables.GSUB.FeatureList directly
                    if (srcTables.GSUB.FeatureList && srcTables.GSUB.FeatureList.FeatureRecord) {
                        srcTables.GSUB.FeatureList.FeatureRecord.forEach(record => {
                            const tag = record.FeatureTag || record.tag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                    featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                            }
                        });
                    }
                    // Try srcTables.GSUB.table.FeatureList
                    if (srcTables.GSUB.table && srcTables.GSUB.table.FeatureList && srcTables.GSUB.table.FeatureList.FeatureRecord) {
                        srcTables.GSUB.table.FeatureList.FeatureRecord.forEach(record => {
                            const tag = record.FeatureTag || record.tag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                    featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                            }
                        });
                    }
                } catch (e) {
                    console.warn('Error extracting GSUB features from _src.tables:', e);
                }
            }
            
            // Try GPOS directly
            if (srcTables.GPOS) {
                try {
                    if (srcTables.GPOS.FeatureList && srcTables.GPOS.FeatureList.FeatureRecord) {
                        srcTables.GPOS.FeatureList.FeatureRecord.forEach(record => {
                            const tag = record.FeatureTag || record.tag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                                featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                    }
                });
            }
                    if (srcTables.GPOS.table && srcTables.GPOS.table.FeatureList && srcTables.GPOS.table.FeatureList.FeatureRecord) {
                        srcTables.GPOS.table.FeatureList.FeatureRecord.forEach(record => {
                            const tag = record.FeatureTag || record.tag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                                featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                            }
                        });
                    }
                } catch (e) {
                    console.warn('Error extracting GPOS features from _src.tables:', e);
                }
            }
        }
        
        // Method 2: Try font.GSUB.table (if fontkit exposes it directly)
        if (font.GSUB) {
            try {
                // Try font.GSUB.table.FeatureList
                if (font.GSUB.table && font.GSUB.table.FeatureList && font.GSUB.table.FeatureList.FeatureRecord) {
                    font.GSUB.table.FeatureList.FeatureRecord.forEach(record => {
                        const tag = record.FeatureTag || record.tag || record.featureTag;
                        if (tag && !featureSet.has(tag)) {
                            featureSet.add(tag);
                            const featureInfo = extractFeatureWithLabel(font, tag, record);
                            features.push(featureInfo);
                        }
                    });
                }
                // Try font.GSUB.featureList (common fontkit structure)
                if (font.GSUB.featureList) {
                    const featureList = font.GSUB.featureList;
                    
                    // Check if featureList has featureRecords array
                    if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                            featureList.featureRecords.forEach(record => {
                                const tag = record.tag || record.FeatureTag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                                    featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                                }
                            });
                        }
                    
                    // Also check if featureList is an object with feature tags as keys
                    Object.keys(featureList).forEach(key => {
                        if (key.length === 4 && /^[a-z0-9]{4}$/.test(key) && !featureSet.has(key)) {
                            featureSet.add(key);
                            const featureInfo = extractFeatureWithLabel(font, key, featureList[key]);
                            features.push(featureInfo);
                        }
                    });
                    }
                } catch (e) {
                console.warn('Error extracting GSUB features from font.GSUB:', e);
            }
        }
        
        // Method 3: Try font.GPOS.table and font.GPOS.featureList
        if (font.GPOS) {
            try {
                if (font.GPOS.table && font.GPOS.table.FeatureList && font.GPOS.table.FeatureList.FeatureRecord) {
                    font.GPOS.table.FeatureList.FeatureRecord.forEach(record => {
                        const tag = record.FeatureTag || record.tag || record.featureTag;
                        if (tag && !featureSet.has(tag)) {
                            featureSet.add(tag);
                            const featureInfo = extractFeatureWithLabel(font, tag, record);
                            features.push(featureInfo);
                        }
                    });
                }
                if (font.GPOS.featureList) {
                    const featureList = font.GPOS.featureList;
                    
                    if (featureList.featureRecords && Array.isArray(featureList.featureRecords)) {
                            featureList.featureRecords.forEach(record => {
                                const tag = record.tag || record.FeatureTag || record.featureTag;
                            if (tag && !featureSet.has(tag)) {
                                    featureSet.add(tag);
                                const featureInfo = extractFeatureWithLabel(font, tag, record);
                                features.push(featureInfo);
                                }
                            });
                        }
                    
                    Object.keys(featureList).forEach(key => {
                        if (key.length === 4 && /^[a-z0-9]{4}$/.test(key) && !featureSet.has(key)) {
                            featureSet.add(key);
                            const featureInfo = extractFeatureWithLabel(font, key, featureList[key]);
                            features.push(featureInfo);
                        }
                    });
                    }
                } catch (e) {
                console.warn('Error extracting GPOS features from font.GPOS:', e);
            }
        }
        
        // If we still have no features but have tags in the set, create feature info
        if (features.length === 0 && featureSet.size > 0) {
            Array.from(featureSet).sort().forEach(tag => {
                const featureInfo = extractFeatureWithLabel(font, tag, null);
                features.push(featureInfo);
            });
        }
        
        // Sort by tag
        features.sort((a, b) => a.tag.localeCompare(b.tag));
        
        return features;
    } catch (error) {
        console.error('Error extracting OpenType features:', error);
        // Show user-visible error feedback
        // Note: Can't find font by reference anymore since we don't store font objects
        // This is just a warning, so we can skip the lookup
        console.warn('Failed to extract OpenType features from font');
        return [];
    }
}

function extractVariableAxes(font) {
    try {
        if (font && font.variationAxes) {
            return Object.entries(font.variationAxes).map(([tag, axis]) => ({
                tag,
                name: axis.name || tag,
                min: axis.min,
                max: axis.max,
                default: axis.default
            }));
        }
    } catch (error) {
        console.warn('Error extracting variable axes:', error);
    }
    return [];
}

function extractNamedVariations(font) {
    try {
        if (font && font.namedVariations) {
            return Object.entries(font.namedVariations).map(([name, coordinates]) => ({
                name,
                coordinates
            }));
        }
    } catch (error) {
        console.warn('Error extracting named variations:', error);
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

/* ============================================
   SECTION 3: RENDERING
   UI rendering functions (comparison grid, font list, etc.)
   ============================================ */

function renderFontList() {
    fontList.innerHTML = '';

    // Empty state
    if (fonts.length === 0) {
        fontList.innerHTML = `
            <div class="font-list-browse"><button class="btn" onclick="browseFonts(event)">${icon('folder-open')} Browse Fonts</button></div>
            <div class="empty-state">
                <h4>NO FONTS LOADED</h4>
                <small>Drag and Drop Fonts Here</small>
                <small>to Add to File List</small>
            </div>
        `;
        return;
    }

    // Add browse button at top
    let html = `<div class="font-list-browse"><button class="btn" onclick="browseFonts(event)">${icon('folder-open')} Browse Fonts</button></div>`;
    
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
                     data-family-name="${escapeHtml(family)}"
                     onclick="toggleFamily('${escapeHtml(family)}')">
                    <span class="family-drag-handle" title="Drag to reorder or remove">${icon('grip-vertical')}</span>
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
    
    // Initialize SortableJS after rendering
    initializeSortableJS();
}

// Render individual font item
function renderFontItem(fontData, index) {
    const isSelected = selectedIndices.has(index);
    
    // Get column index if font is selected to check active states
    const columnIndex = isSelected ? getColumnIndexForFont(index) : null;
    const isInVariableMode = columnIndex !== null && variableMode.has(columnIndex);
    const isInOTMode = columnIndex !== null && otMode.has(columnIndex);
    
    // Generate badges with click handlers and active states
    let badgesHtml = '';
    if (fontData.isVariable) {
        const vfActiveClass = isInVariableMode ? ' badge-active' : '';
        badgesHtml += `<span class="badge badge-font-list badge-vf${vfActiveClass}" 
                             aria-label="Variable Font: ${fontData.family}" 
                             title="Variable Font - Click to toggle controls"
                             data-font-index="${index}"
                             tabindex="0"
                             role="button"
                             aria-label="Toggle variable font controls for ${fontData.filename}"
                             onclick="toggleVariableModeForFont(${index}, event)"
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleVariableModeForFont(${index}, event);}">VF</span>`;
    }
    if (fontData.hasOpenTypeFeatures) {
        const otActiveClass = isInOTMode ? ' badge-active' : '';
        badgesHtml += `<span class="badge badge-font-list badge-ot${otActiveClass}" 
                             title="OpenType Features - Click to toggle controls"
                             data-font-index="${index}"
                             tabindex="0"
                             role="button"
                             aria-label="Toggle OpenType features for ${fontData.filename}"
                             onclick="toggleOpenTypeModeForFont(${index}, event)"
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleOpenTypeModeForFont(${index}, event);}">O</span>`;
    }
    
    return `
        <div class="font-item ${isSelected ? 'selected' : ''}"
             data-font-index="${index}" 
             data-font-id="${fontData.id}"
             onclick="toggleSelection(${index}, event)">
            <span class="font-drag-handle" title="Drag to reorder or remove">${icon('grip-vertical')}</span>
            ${badgesHtml}
            <span class="font-name">${escapeHtml(fontData.filename)}</span>
            
        </div>
    `;
}

function removeFont(index) {
    // Revoke object URL to prevent memory leak
    const fontData = fonts[index];
    if (fontData && fontData.objectUrl) {
        URL.revokeObjectURL(fontData.objectUrl);
    }
    
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
    // Clean up style elements from map first
    fontFaceStyleMap.forEach(info => {
        if (info.styleElement && info.styleElement.parentNode) {
            info.styleElement.remove();
        }
    });
    fontFaceStyleMap.clear();
    
    // Clean up any remaining style elements
    fontFaceStyleElements.forEach(el => {
        if (el.parentNode) {
            el.remove();
        }
    });
    fontFaceStyleElements = [];
    
    // Re-render list and update comparison
    renderFontList();
    updateComparison();
}

function clearAllFonts() {
    // Revoke all object URLs to prevent memory leaks
    fonts.forEach(fontData => {
        if (fontData.objectUrl) {
            URL.revokeObjectURL(fontData.objectUrl);
        }
    });
    
    // Clear all arrays and sets
    fonts = [];
    selectedIndices.clear();
    collapsedSections.clear();
    variableMode.clear();
    expandedFamilies.clear();
    currentVariations = {};
    activeFeatures = {};
    
    // Clear font face styles
    // Clean up style elements from map first
    fontFaceStyleMap.forEach(info => {
        if (info.styleElement && info.styleElement.parentNode) {
            info.styleElement.remove();
        }
    });
    fontFaceStyleMap.clear();
    
    // Clean up any remaining style elements
    fontFaceStyleElements.forEach(el => {
        if (el.parentNode) {
            el.remove();
        }
    });
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

// SortableJS instances for drag-and-drop
let sortableInstances = [];

// Initialize SortableJS for drag-and-drop
function initializeSortableJS() {
    // Destroy existing instances
    sortableInstances.forEach(instance => {
        if (instance && instance.el) {
            instance.destroy();
        }
    });
    sortableInstances = [];
    
    // Create trash zone if it doesn't exist
    const trash = createTrashZone();
    
    // Track if item is being dragged over trash zone
    let isDraggingOverTrash = false;
    
    // Initialize SortableJS for each family's font items container
    document.querySelectorAll('.font-family-items').forEach(container => {
        const sortable = new Sortable(container, {
            group: 'shared', // Allow dragging between families
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65,
            handle: '.font-item', // Entire item is draggable
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onStart: function(evt) {
    // Show trash zone
    trash.classList.add('visible');
                isDraggingOverTrash = false;
            },
            onMove: function(evt, originalEvent) {
                // Check if dragging over trash zone during move
                const trashRect = trash.getBoundingClientRect();
                const pointer = originalEvent.touches ? originalEvent.touches[0] : originalEvent;
                const pointerX = pointer.clientX;
                const pointerY = pointer.clientY;
                
                const isOverTrash = (
                    pointerX >= trashRect.left &&
                    pointerX <= trashRect.right &&
                    pointerY >= trashRect.top &&
                    pointerY <= trashRect.bottom
                );
                
                if (isOverTrash) {
                    if (!isDraggingOverTrash) {
                        isDraggingOverTrash = true;
                        trash.classList.add('drag-over-trash');
                    }
                } else {
                    if (isDraggingOverTrash) {
                        isDraggingOverTrash = false;
                        trash.classList.remove('drag-over-trash');
                    }
                }
            },
            onEnd: function(evt) {
                // Hide trash zone
                trash.classList.remove('visible', 'drag-over-trash');
                
                const item = evt.item;
                
                // Check if dropped in trash zone (use the flag set during drag)
                if (isDraggingOverTrash) {
                    // Remove font
                    const fontIndex = parseInt(item.getAttribute('data-font-index'));
                    if (!isNaN(fontIndex)) {
                        removeFont(fontIndex);
                    }
                    isDraggingOverTrash = false;
        return;
    }
    
                // Also check coordinates as fallback
                const trashRect = trash.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                const isInTrash = (
                    itemRect.left < trashRect.right &&
                    itemRect.right > trashRect.left &&
                    itemRect.top < trashRect.bottom &&
                    itemRect.bottom > trashRect.top
                );
                
                if (isInTrash) {
                    const fontIndex = parseInt(item.getAttribute('data-font-index'));
                    if (!isNaN(fontIndex)) {
                        removeFont(fontIndex);
                    }
                    return;
                }
                
                // Store old selected indices by font ID before reordering
                const selectedFontIds = new Set();
                Array.from(selectedIndices).forEach(idx => {
                    if (fonts[idx] && fonts[idx].id) {
                        selectedFontIds.add(fonts[idx].id);
                    }
                });
                
                // Get target family from container
                const familyGroup = container.closest('.font-family-group');
                const familyHeader = familyGroup?.querySelector('.font-family-header');
                const targetFamilyName = familyHeader?.querySelector('.family-name')?.textContent;
                
                // Rebuild fonts array based on new DOM order
                // Get all font items in all containers in their current DOM order
                const allFontItems = Array.from(document.querySelectorAll('.font-item'));
                const fontIdOrder = allFontItems.map(item => {
                    const fontId = item.getAttribute('data-font-id');
                    if (!fontId) {
                        // Fallback: try to get from index
                        const idx = parseInt(item.getAttribute('data-font-index'));
                        return fonts[idx]?.id;
                    }
                    return fontId;
                }).filter(id => id);
                
                // Reorder fonts array to match DOM order
                const fontMap = new Map();
                fonts.forEach(font => {
                    if (font.id) {
                        fontMap.set(font.id, font);
                    }
                });
                
                const newFonts = [];
                fontIdOrder.forEach(id => {
                    const font = fontMap.get(id);
                    if (font) {
                        // Update assignedFamily if moved to different family
                        if (targetFamilyName) {
                            const currentFamily = extractFamilyName(font, font.filename);
                            if (currentFamily !== targetFamilyName) {
                                font.assignedFamily = targetFamilyName;
                            }
                        }
                        newFonts.push(font);
                    }
                });
                
                // Add any fonts that weren't in DOM (shouldn't happen, but safety check)
                fontMap.forEach((font, id) => {
                    if (!fontIdOrder.includes(id)) {
                        newFonts.push(font);
                    }
                });
                
                // Update fonts array
                fonts = newFonts;
                
                // Update selected indices based on font IDs
    selectedIndices.clear();
                fonts.forEach((font, idx) => {
                    if (selectedFontIds.has(font.id)) {
                        selectedIndices.add(idx);
                    }
                });
                
                // Re-render to update indices
    renderFontList();
    updateComparison();
}
        });
        
        sortableInstances.push(sortable);
    });
    
    // Track if family is being dragged over trash zone
    let isDraggingFamilyOverTrash = false;
    
    // Initialize SortableJS for family group reordering
    const familyGroupsContainer = document.querySelector('#fontList');
    if (familyGroupsContainer) {
        const familySortable = new Sortable(familyGroupsContainer, {
            group: 'family-groups', // Unique group name to prevent conflicts with font items
            animation: 150,
            handle: '.family-drag-handle', // Only drag by handle, not entire header
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '.font-list-browse, .empty-state, .font-item, .font-family-items', // Don't allow dragging these
            onStart: function(evt) {
                trash.classList.add('visible');
                isDraggingFamilyOverTrash = false;
            },
            onMove: function(evt, originalEvent) {
                // Check if dragging over trash zone during move
                const trashRect = trash.getBoundingClientRect();
                const pointer = originalEvent.touches ? originalEvent.touches[0] : originalEvent;
                const pointerX = pointer.clientX;
                const pointerY = pointer.clientY;
                
                const isOverTrash = (
                    pointerX >= trashRect.left &&
                    pointerX <= trashRect.right &&
                    pointerY >= trashRect.top &&
                    pointerY <= trashRect.bottom
                );
                
                if (isOverTrash) {
                    if (!isDraggingFamilyOverTrash) {
                        isDraggingFamilyOverTrash = true;
                        trash.classList.add('drag-over-trash');
                    }
    } else {
                    if (isDraggingFamilyOverTrash) {
                        isDraggingFamilyOverTrash = false;
                        trash.classList.remove('drag-over-trash');
                    }
                }
            },
            onEnd: function(evt) {
                trash.classList.remove('visible', 'drag-over-trash');
                
                const item = evt.item;
                
                // Check if dropped in trash zone (use the flag set during drag)
                if (isDraggingFamilyOverTrash) {
                    // Remove entire family
                    const familyName = item.getAttribute('data-family-name');
                    if (familyName) {
                        const grouped = groupFontsByFamily(fonts);
                        const familyFonts = grouped[familyName] || [];
                        const indicesToRemove = familyFonts.map(f => f.index).sort((a, b) => b - a);
                        
                        indicesToRemove.forEach(idx => {
                            fonts.splice(idx, 1);
                        });
                        
                        selectedIndices.clear();
                        renderFontList();
                        updateComparison();
                    }
                    isDraggingFamilyOverTrash = false;
        return;
    }
    
                // Also check coordinates as fallback
                const trashRect = trash.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                const isInTrash = (
                    itemRect.left < trashRect.right &&
                    itemRect.right > trashRect.left &&
                    itemRect.top < trashRect.bottom &&
                    itemRect.bottom > trashRect.top
                );
                
                if (isInTrash) {
                    const familyName = item.getAttribute('data-family-name');
    if (familyName) {
                        const grouped = groupFontsByFamily(fonts);
                        const familyFonts = grouped[familyName] || [];
                        const indicesToRemove = familyFonts.map(f => f.index).sort((a, b) => b - a);
                        
                        indicesToRemove.forEach(idx => {
                            fonts.splice(idx, 1);
                        });
                        
                        selectedIndices.clear();
                        renderFontList();
                        updateComparison();
                    }
        return;
    }
    
                // Reorder families only if not dropped in trash
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex !== newIndex && oldIndex !== null && newIndex !== null) {
                    const familyGroups = Array.from(familyGroupsContainer.querySelectorAll('.font-family-group'));
                    const newFamilyOrder = familyGroups.map(group => group.getAttribute('data-family-name')).filter(f => f);
                    familyOrder = newFamilyOrder;
                    renderFontList();
                }
            }
        });
        
        sortableInstances.push(familySortable);
    }
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
    
    return trashZone;
}

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
    comparisonGrid.setAttribute('data-view-mode', viewMode);

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

    // Clean up style elements from map first
    fontFaceStyleMap.forEach(info => {
        if (info.styleElement && info.styleElement.parentNode) {
            info.styleElement.remove();
        }
    });
    fontFaceStyleMap.clear();
    
    // Clean up any remaining style elements
    fontFaceStyleElements.forEach(el => {
        if (el.parentNode) {
            el.remove();
        }
    });
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

    selectedFonts.forEach((fontData, columnIndex) => {
        if (!fontData) {
            if (DEBUG) console.warn('Invalid font data at index:', columnIndex);
            fontUrls[columnIndex] = null;
            return;
        }
        
        // Use cached object URL (created once when font was loaded)
        if (fontData.objectUrl) {
            fontUrls[columnIndex] = fontData.objectUrl;
        } else {
            fontUrls[columnIndex] = null;
        }
    });

    // All URLs are ready immediately (no async file reading needed)
                renderComparison(selectedFonts, fontUrls);
}

function renderComparison(selectedFonts, fontUrls) {
    // Track which font-face names are used in this render
    const usedFontFaceNames = new Map();
    
    selectedFonts.forEach((fontData, columnIndex) => {
        const dataUrl = fontUrls[columnIndex];
        if (!dataUrl) return;
        
        // Check if we already have a font-face style for this dataUrl
        let fontFaceInfo = fontFaceStyleMap.get(dataUrl);
        
        if (!fontFaceInfo) {
            // Create new font-face style
            const fontFaceName = `comparison-font-${fontData.id || `font-${columnIndex}`}`;
        const fontFaceStyle = document.createElement('style');
        fontFaceStyle.textContent = `
            @font-face {
                font-family: '${fontFaceName}';
                    src: url('${dataUrl}');
            }
        `;
        document.head.appendChild(fontFaceStyle);
        fontFaceStyleElements.push(fontFaceStyle);
            
            fontFaceInfo = { styleElement: fontFaceStyle, fontFaceName: fontFaceName };
            fontFaceStyleMap.set(dataUrl, fontFaceInfo);
        }
        
        // Track which font-face name to use for this column
        usedFontFaceNames.set(columnIndex, fontFaceInfo.fontFaceName);
    });

    selectedFonts.forEach((fontData, columnIndex) => {
        const column = document.createElement('div');
        column.className = 'font-column';
        column.dataset.columnIndex = columnIndex;

        // Use the font-face name from the map (matches the @font-face rule we created)
        const fontFaceName = usedFontFaceNames.get(columnIndex) || `comparison-font-${columnIndex}`;
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
            ? `badge badge-vf ${isInVariableMode ? 'badge-active' : ''}`
            : '';
        const vfBadgeHtml = fontData.isVariable 
            ? `<span class="${vfBadgeClass}" data-column-index="${columnIndex}" title="Variable Font - Click to toggle controls" tabindex="0" role="button" aria-label="Variable Font: ${fontData.family}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleVariableMode(${columnIndex}, event);}">VF</span>`
            : '';
        
        // Create OT badge if font has OpenType features
        const isInOTMode = otMode.has(columnIndex);
        const otBadgeClass = fontData.hasOpenTypeFeatures 
            ? `badge badge-ot ${isInOTMode ? 'badge-active' : ''}`
            : '';
        const otBadgeHtml = fontData.hasOpenTypeFeatures 
            ? `<span class="${otBadgeClass}" data-column-index="${columnIndex}" title="OpenType Features - Click to toggle controls" tabindex="0" role="button" aria-label="OpenType Features: ${fontData.family}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleOpenTypeMode(${columnIndex}, event);}">O</span>`
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
                <div class="preview-text-wrapper">
                <div class="preview-text preview-text-${columnIndex}" 
                     contenteditable="true" 
                     style="font-family: '${fontFaceName}';"
                         data-column-index="${columnIndex}"
                         data-max-length="500"></div>
                    <div class="preview-text-counter" data-column-index="${columnIndex}">
                        <span class="char-count">0</span>/<span class="char-limit">500</span>
                    </div>
                    <button class="preview-reset-btn" 
                            data-column-index="${columnIndex}"
                            title="Reset preview text to default"
                            onclick="resetPreviewText()">Reset</button>
                </div>
            </div>

            ${contentHtml}
        `;

        comparisonGrid.appendChild(column);
        
        // Add data-position attributes for CSS specificity simplification
        const header = column.querySelector('.font-column-header');
        if (header) {
            header.setAttribute('data-position', 'top');
        }
        
        // Mark last metadata section for border radius
        const metadataSections = column.querySelectorAll('.metadata-section');
        if (metadataSections.length > 0) {
            const lastSection = metadataSections[metadataSections.length - 1];
            lastSection.setAttribute('data-position', 'bottom');
        }
        
        // Set preview text content (use textContent to avoid HTML issues)
        const previewElement = column.querySelector('.preview-text');
        if (previewElement) {
            // Enforce character limit
            const maxLength = parseInt(previewElement.dataset.maxLength) || 500;
            const limitedText = previewText.length > maxLength ? previewText.substring(0, maxLength) : previewText;
            previewElement.textContent = limitedText;
            
            // Update character counter
            const counter = column.querySelector('.preview-text-counter .char-count');
            if (counter) {
                counter.textContent = limitedText.length;
                const counterParent = counter.parentElement;
                if (limitedText.length >= maxLength) {
                    counterParent.classList.add('at-limit');
                } else {
                    counterParent.classList.remove('at-limit');
                }
            }
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
            debouncedAlignMetadataRows();
            // Headers shouldn't change from section toggles, but align anyway for safety
            debouncedAlignColumnHeaders();
        };
    });

    // Attach VF badge click handlers
    document.querySelectorAll('.badge-vf').forEach(badge => {
        badge.onclick = (e) => {
            e.stopPropagation();
            const columnIndex = parseInt(badge.dataset.columnIndex);
            toggleVariableMode(columnIndex);
        };
    });
    
    // Attach OT badge click handlers
    document.querySelectorAll('.badge-ot').forEach(badge => {
        badge.onclick = (e) => {
            e.stopPropagation();
            const columnIndex = parseInt(badge.dataset.columnIndex);
            toggleOpenTypeMode(columnIndex);
        };
    });

    // Attach variable control handlers
    attachVariableControlHandlers();

           // Align rows across columns
           debouncedAlignMetadataRows();
           
           // Align headers across columns
           debouncedAlignColumnHeaders();
           
           // Apply active features to preview
           selectedFonts.forEach((fontData, columnIndex) => {
               applyFeaturesToPreview(columnIndex);
           });
           
           // Attach editable preview handlers
           attachEditablePreviewHandlers();
           
           // Attach popover handlers for feature items
           attachFeaturePopoverHandlers();
       }

// Attach popover handlers for feature items (hover tooltips)
function attachFeaturePopoverHandlers() {
    document.querySelectorAll('.feature-item').forEach(item => {
        // Remove existing handlers to avoid duplicates
        item.onmouseenter = null;
        item.onmouseleave = null;
        
        item.onmouseenter = (e) => {
            const popover = item.querySelector('.feature-popover');
            if (popover) {
                popover.style.display = 'block';
            }
        };
        
        item.onmouseleave = (e) => {
            const popover = item.querySelector('.feature-popover');
            if (popover) {
                popover.style.display = 'none';
            }
        };
    });
}

// Sync preview text to all preview panes from single source of truth (hidden textarea)
function syncPreviews() {
    if (!previewState) return;
    
    const text = previewState.value;
    previewText = text;
    
    // Update all previews from single source (only if not focused)
    document.querySelectorAll('.preview-text[contenteditable="true"]').forEach(preview => {
        if (document.activeElement !== preview) {
            const maxLength = parseInt(preview.dataset.maxLength) || 500;
            const limitedText = text.length > maxLength ? text.substring(0, maxLength) : text;
            preview.textContent = limitedText;
            
            // Update character counter
            const previewColumnIndex = parseInt(preview.dataset.columnIndex);
            const counter = document.querySelector(`.preview-text-counter[data-column-index="${previewColumnIndex}"] .char-count`);
            if (counter) {
                counter.textContent = limitedText.length;
                const counterParent = counter.parentElement;
                if (limitedText.length >= maxLength) {
                    counterParent.classList.add('at-limit');
                } else {
                    counterParent.classList.remove('at-limit');
                }
            }
        }
    });
}

// Initialize hidden textarea for preview state
function initPreviewState() {
    if (previewState) return; // Already initialized
    
    previewState = document.createElement('textarea');
    previewState.style.display = 'none';
    previewState.value = defaultPreviewText;
    document.body.appendChild(previewState);
    
    // Listen to hidden textarea changes
    previewState.addEventListener('input', syncPreviews);
}

// Attach handlers for editable preview panes
function attachEditablePreviewHandlers() {
    // Initialize preview state if not already done
    initPreviewState();
    
    document.querySelectorAll('.preview-text[contenteditable="true"]').forEach(preview => {
        // Check if already has listener (data attribute)
        if (preview.dataset.hasListener === 'true') return;
        preview.dataset.hasListener = 'true';
        
        preview.addEventListener('input', (e) => {
            // Get text content using textContent for more reliable extraction
            // textContent preserves line breaks better than innerText
            let text = e.target.textContent || '';
            
            // Enforce character limit (500 chars)
            const maxLength = parseInt(e.target.dataset.maxLength) || 500;
            if (text.length > maxLength) {
                text = text.substring(0, maxLength);
                e.target.textContent = text;
                // Move cursor to end
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(e.target);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            
            // Update character counter
            const columnIndex = parseInt(e.target.dataset.columnIndex);
            const counter = document.querySelector(`.preview-text-counter[data-column-index="${columnIndex}"] .char-count`);
            if (counter) {
                counter.textContent = text.length;
                if (text.length >= maxLength) {
                    counter.parentElement.classList.add('at-limit');
                } else {
                    counter.parentElement.classList.remove('at-limit');
                }
            }
            
            // Update hidden textarea (single source of truth)
            if (previewState) {
                previewState.value = text;
                syncPreviews();
            }
        });
        
        preview.addEventListener('blur', (e) => {
            // Update previewText state when focus is lost (final sync)
            const text = e.target.textContent || '';
            previewText = text;
            
            // Update hidden textarea (single source of truth)
            if (previewState) {
                previewState.value = text;
                syncPreviews();
            }
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
            return `<div class="metadata-row">
                <div class="metadata-label">${label}</div>
                <div class="metadata-value">${value || 'N/A'}</div>
            </div>`;
        }).join('');
    
    return `
        <div class="metadata-panel">
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
    // Check if snapping is enabled
    if (!snapToTicks) {
        return currentValue;
    }
    
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
    
    // Calculate threshold (1-2% of range or fixed value, reduced from 3%)
    const range = axis.max - axis.min;
    const threshold = Math.max(range * 0.02, axis.tag === 'wght' ? 10 : 1);
    
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
                <div class="controls-header">
                    <h4>Preset Styles</h4>
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
        <div class="controls-panel" data-column-index="${columnIndex}">
            <div class="controls-header">
                <h4>Variable Font Controls</h4>
                <div class="controls-actions">
                    <label class="snap-toggle-label" title="Snap to tick marks when adjusting sliders">
                        <input type="checkbox" class="snap-toggle-checkbox" ${snapToTicks ? 'checked' : ''}>
                        <span>Snap to Ticks</span>
                    </label>
                <button class="btn-reset-variations" data-column-index="${columnIndex}">Reset to Defaults</button>
                </div>
            </div>
            <div class="variable-axes-section">
                ${axesHtml}
            </div>
            ${namedVariationsHtml}
            ${fontData.hasOpenTypeFeatures ? createOpenTypeFeaturesInVFPanel(fontData, columnIndex) : ''}
        </div>
    `;
}

/* ============================================
   SECTION 5: OPENTYPE FEATURES
   OpenType feature handling and UI
   ============================================ */

function createOpenTypeFeaturesPanel(fontData, columnIndex) {
    const features = fontData.features || [];
    const isActive = activeFeatures[columnIndex] || new Set();
    
    // Sort features: stylistic sets first, then alphabetical
    const sortedFeatures = sortFeatures(features);
    
    return `
        <div class="controls-panel">
            <div class="controls-header">
                <h4>OpenType Features (${features.length})</h4>
            </div>
            <div class="features-expanded">
                ${sortedFeatures.length > 0 ? sortedFeatures.map(f => {
                    const featureTag = typeof f === 'string' ? f : f.tag;
                    
                    // PRIORITY 1: Use custom label from opentype.js extraction (has UINameID lookup)
                    let featureName = null;
                    if (typeof f === 'object' && f.label) {
                        featureName = f.label;
                    }
                    
                    // PRIORITY 2: Fallback to getFeatureName() (handles static names, ss##, and cv##)
                    if (!featureName) {
                        featureName = getFeatureName(featureTag);
                    }
                    
                    const isFeatureActive = isActive.has(featureTag);
                    
                    // Escape for HTML attributes
                    const escapedName = featureName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    
                    return `
                        <div class="feature-row ${isFeatureActive ? 'active' : ''}" 
                             data-column-index="${columnIndex}" 
                             data-feature-tag="${featureTag}"
                             data-feature-name="${escapedName}"
                             tabindex="0"
                             role="button"
                             aria-label="Toggle ${featureName} feature"
                             aria-pressed="${isFeatureActive}"
                             onclick="toggleFeature(${columnIndex}, '${featureTag}')"
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleFeature(${columnIndex}, '${featureTag}');}">
                            <div class="feature-content">
                                <div class="feature-header">
                                    <span class="feature-tag">${featureTag}</span>
                                    <span class="feature-name">${featureName}</span>
                                </div>
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
        <div class="named-variations-section features-in-vf">
            <div class="controls-header">
                <h4>OpenType Features (${features.length})</h4>
            </div>
            <div class="features-embedded">
                ${sortedFeatures.map(f => {
                    const featureTag = typeof f === 'string' ? f : f.tag;
                    // PRIORITY 1: Use custom label from opentype.js extraction (has UINameID lookup)
                    let featureName = null;
                    if (typeof f === 'object' && f.label) {
                        featureName = f.label;
                    }
                    
                    // PRIORITY 2: Fallback to getFeatureName() (handles static names, ss##, and cv##)
                    if (!featureName) {
                        featureName = getFeatureName(featureTag);
                    }
                    
                    const isFeatureActive = isActive.has(featureTag);
                    
                    // Escape for HTML attributes
                    const escapedName = featureName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    
                    return `
                        <div class="feature-item ${isFeatureActive ? 'active' : ''}" 
                             data-column-index="${columnIndex}" 
                             data-feature-tag="${featureTag}"
                             data-feature-name="${escapedName}"
                             tabindex="0"
                             role="button"
                             aria-label="Toggle ${featureName} feature"
                             aria-pressed="${isFeatureActive}"
                             onclick="toggleFeature(${columnIndex}, '${featureTag}')"
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleFeature(${columnIndex}, '${featureTag}');}">
                            <span class="feature-tag">${featureTag}</span>
                            <span class="feature-name">${featureName}</span>
                            <div class="feature-popover">
                                <div class="feature-popover-name">${featureName}</div>
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
    // Update file list to reflect badge active states
    renderFontList();
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
    // Update file list to reflect badge active states
    renderFontList();
}

// Helper function to get column index for a font (when selected)
function getColumnIndexForFont(fontIndex) {
    if (!selectedIndices.has(fontIndex)) {
        return null; // Font is not selected, so it has no column
    }
    
    // Get sorted selected indices to find column position
    const sortedSelected = Array.from(selectedIndices).sort((a, b) => a - b);
    const columnIndex = sortedSelected.indexOf(fontIndex);
    
    return columnIndex >= 0 ? columnIndex : null;
}

// Toggle variable mode for a font from file list badge
function toggleVariableModeForFont(fontIndex, event) {
    if (DEBUG) console.log('toggleVariableModeForFont called:', fontIndex);
    
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    // First, ensure font is selected
    if (!selectedIndices.has(fontIndex)) {
        if (DEBUG) console.log('Font not selected, selecting first:', fontIndex);
        // Select the font first
        selectedIndices.add(fontIndex);
        renderFontList();
        updateComparison();
        // Wait for comparison to render, then toggle mode
        setTimeout(() => {
            const columnIndex = getColumnIndexForFont(fontIndex);
            if (DEBUG) console.log('Column index after selection:', columnIndex);
            if (columnIndex !== null) {
                toggleVariableMode(columnIndex);
            }
        }, 50);
    } else {
        // Font is already selected, just toggle mode
        const columnIndex = getColumnIndexForFont(fontIndex);
        if (DEBUG) console.log('Font already selected, column index:', columnIndex);
        if (columnIndex !== null) {
            toggleVariableMode(columnIndex);
        }
    }
}

// Toggle OpenType mode for a font from file list badge
function toggleOpenTypeModeForFont(fontIndex, event) {
    if (DEBUG) console.log('toggleOpenTypeModeForFont called:', fontIndex);
    
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    // First, ensure font is selected
    if (!selectedIndices.has(fontIndex)) {
        if (DEBUG) console.log('Font not selected, selecting first:', fontIndex);
        // Select the font first
        selectedIndices.add(fontIndex);
        renderFontList();
        updateComparison();
        // Wait for comparison to render, then toggle mode
        // Use requestAnimationFrame for better timing
        requestAnimationFrame(() => {
            setTimeout(() => {
                const columnIndex = getColumnIndexForFont(fontIndex);
                if (DEBUG) console.log('Column index after selection:', columnIndex, 'selectedIndices:', Array.from(selectedIndices));
                if (columnIndex !== null && columnIndex >= 0) {
                    toggleOpenTypeMode(columnIndex);
                } else {
                    console.warn('Could not find column index for font:', fontIndex);
                }
            }, 100);
        });
    } else {
        // Font is already selected, get column index and toggle mode immediately
        const columnIndex = getColumnIndexForFont(fontIndex);
        if (DEBUG) console.log('Font already selected, column index:', columnIndex, 'otMode:', Array.from(otMode), 'selectedIndices:', Array.from(selectedIndices));
        
        if (columnIndex !== null && columnIndex >= 0) {
            // Toggle the mode - this will update the comparison and re-render the font list
            toggleOpenTypeMode(columnIndex);
        } else {
            if (DEBUG) console.warn('Could not find column index for font:', fontIndex, 'selectedIndices:', Array.from(selectedIndices));
            // Fallback: try to find the column by checking all selected fonts
            const sortedSelected = Array.from(selectedIndices).sort((a, b) => a - b);
            const foundIndex = sortedSelected.indexOf(fontIndex);
            if (foundIndex >= 0) {
                if (DEBUG) console.log('Found column index via fallback:', foundIndex);
                toggleOpenTypeMode(foundIndex);
            }
        }
    }
}

// Make functions globally accessible
window.toggleVariableModeForFont = toggleVariableModeForFont;
window.toggleOpenTypeModeForFont = toggleOpenTypeModeForFont;

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
        
        // Add mouseup handler for snapping to ticks (only if snapping is enabled)
        // Add keyup handler for arrow keys to enable snap-to-ticks
        slider.addEventListener('keyup', (e) => {
            if (!snapToTicks) return;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            
            const columnIndex = parseInt(e.target.closest('.variable-axis-control').dataset.columnIndex);
            const axisTag = e.target.closest('.variable-axis-control').dataset.axisTag;
            const currentValue = parseFloat(e.target.value);
            
            // Snap to nearest tick
            const snappedValue = snapToNearestTick(columnIndex, axisTag, currentValue);
            
            if (snappedValue !== currentValue) {
                // Update slider value
                e.target.value = snappedValue;
                
                // Update input field
                const inputId = e.target.id.replace('-slider', '-input');
                const input = document.getElementById(inputId);
                if (input) {
                    const selectedFonts = Array.from(selectedIndices).map(i => fonts[i]);
                    const fontData = selectedFonts[columnIndex];
                    const axis = fontData.variableAxes.find(a => a.tag === axisTag);
                    if (axis) {
                        input.value = formatAxisValue(snappedValue, axis);
                    } else {
                        input.value = snappedValue;
                    }
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
        
        slider.addEventListener('mouseup', (e) => {
            if (!snapToTicks) return;
            
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
        
        // Add keydown handler for arrow keys to enable snap-to-ticks (only if snapping is enabled)
        input.addEventListener('keydown', (e) => {
            if (!snapToTicks) return;
            
            // Only handle arrow keys
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            
            // Let the default behavior update the value first, then snap
            setTimeout(() => {
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
            }, 0);
        });
        
        // Add blur handler to snap to tick when input loses focus (only if snapping is enabled)
        input.addEventListener('blur', (e) => {
            if (!snapToTicks) return;
            
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
    
    // Snap toggle checkbox
    document.querySelectorAll('.snap-toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            snapToTicks = e.target.checked;
            localStorage.setItem('fontAnalyzer_snapToTicks', snapToTicks.toString());
            
            // Update all snap toggles across all panels
            document.querySelectorAll('.snap-toggle-checkbox').forEach(cb => {
                cb.checked = snapToTicks;
            });
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

// Debounced version of alignMetadataRows for performance
let alignMetadataRowsTimeout = null;
function debouncedAlignMetadataRows() {
    if (alignMetadataRowsTimeout) {
        clearTimeout(alignMetadataRowsTimeout);
    }
    alignMetadataRowsTimeout = setTimeout(() => {
        alignMetadataRows();
        alignMetadataRowsTimeout = null;
    }, 100);
}

let alignColumnHeadersTimeout = null;
function debouncedAlignColumnHeaders() {
    if (alignColumnHeadersTimeout) {
        clearTimeout(alignColumnHeadersTimeout);
    }
    alignColumnHeadersTimeout = setTimeout(() => {
        alignColumnHeaders();
        alignColumnHeadersTimeout = null;
    }, 100);
}

function alignMetadataRows() {
    // Get all columns
    const columns = document.querySelectorAll('.font-column');
    if (columns.length === 0) return;

    // First, align entire metadata section cards by their row IDs
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

        // Reset heights
        let maxHeight = 0;
        matchingRows.forEach(row => {
            row.style.height = 'auto';
            const height = row.offsetHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        // Apply max height to all matching rows
        if (maxHeight > 0) {
            matchingRows.forEach(row => {
                row.style.height = `${maxHeight}px`;
            });
        }
    });
    
    // NEW: Align metadata section cards themselves
    // Group sections by their title for alignment
    const sectionTitles = new Set();
    columns.forEach(column => {
        column.querySelectorAll('.metadata-section .section-header').forEach(header => {
            const title = header.getAttribute('data-section');
            if (title) sectionTitles.add(title);
        });
    });
    
    sectionTitles.forEach(title => {
        const matchingSections = Array.from(document.querySelectorAll(`.metadata-section .section-header[data-section="${title}"]`))
            .map(header => header.closest('.metadata-section'))
            .filter(section => section !== null);
        
        if (matchingSections.length <= 1) return;
        
        // Find tallest section
        let maxSectionHeight = 0;
        matchingSections.forEach(section => {
            section.style.minHeight = 'auto';
            const height = section.offsetHeight;
            if (height > maxSectionHeight) {
                maxSectionHeight = height;
            }
        });
        
        // Apply to all matching sections (only if expanded)
        if (maxSectionHeight > 0) {
            matchingSections.forEach(section => {
                const content = section.querySelector('.section-content');
                if (content && !content.classList.contains('collapsed')) {
                    section.style.minHeight = `${maxSectionHeight}px`;
                }
            });
        }
    });
}

function alignColumnHeaders() {
    const headers = document.querySelectorAll('.font-column-header');
    if (headers.length === 0) return;
    
    // Reset heights
    let maxHeight = 0;
    headers.forEach(header => {
        header.style.height = 'auto';
        const height = header.offsetHeight;
        if (height > maxHeight) {
            maxHeight = height;
        }
    });
    
    // Apply max height to all headers
    if (maxHeight > 0) {
        headers.forEach(header => {
            header.style.height = `${maxHeight}px`;
        });
    }
}

function createSection(title, rows, columnIndex) {
    const sectionId = `${title.toLowerCase().replace(/\s+/g, '-')}-${columnIndex}`;
    const isCollapsed = collapsedSections.has(title);

    return `
        <div class="metadata-section">
            <div class="section-header" data-section="${title}" tabindex="0" role="button" aria-label="Toggle ${title} section" aria-expanded="${!isCollapsed}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleSection(this);}">
                <span>${title}</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}" aria-hidden="true">▼</span>
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
    
    // Update UI to reflect active state (handle both feature-item and feature-row)
    const featureItem = document.querySelector(
        `.feature-item[data-column-index="${columnIndex}"][data-feature-tag="${featureTag}"]`
    );
    const featureRow = document.querySelector(
        `.feature-row[data-column-index="${columnIndex}"][data-feature-tag="${featureTag}"]`
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
            <div class="section-header" data-section="OpenType Features" tabindex="0" role="button" aria-label="Toggle OpenType Features section" aria-expanded="${!isCollapsed}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleSection(this);}">
                <span>OpenType Features (${featureCount})</span>
                <span class="section-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
            </div>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">
                ${featureCount > 0 ? `
                    <div class="features-compact">
                        ${sortedFeatures.map(f => {
                            const featureTag = typeof f === 'string' ? f : f.tag;
                            
                            // PRIORITY 1: Use custom label from opentype.js extraction (has UINameID lookup)
                            let featureName = null;
                            if (typeof f === 'object' && f.label) {
                                featureName = f.label;
                            }
                            
                            // PRIORITY 2: Fallback to getFeatureName() (handles static names, ss##, and cv##)
                            if (!featureName) {
                                featureName = getFeatureName(featureTag);
                            }
                            
                            const isFeatureActive = isActive.has(featureTag);
                            
                            // Escape for HTML attributes
                            const escapedName = featureName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            
                            return `
                                <div class="feature-item ${isFeatureActive ? 'active' : ''}" 
                                     data-column-index="${columnIndex}" 
                                     data-feature-tag="${featureTag}"
                                     data-feature-name="${escapedName}"
                                     onclick="toggleFeature(${columnIndex}, '${featureTag}')">
                                    <span class="feature-tag">${featureTag}</span>
                                    <span class="feature-name">${featureName}</span>
                                    <div class="feature-popover">
                                        <div class="feature-popover-name">${featureName}</div>
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
            <div class="section-header" data-section="Variable Axes" tabindex="0" role="button" aria-label="Toggle Variable Axes section" aria-expanded="${!isCollapsed}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleSection(this);}">
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
            <div class="section-header" data-section="Font Tables" tabindex="0" role="button" aria-label="Toggle Font Tables section" aria-expanded="${!isCollapsed}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleSection(this);}">
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
            debouncedAlignMetadataRows();
            debouncedAlignColumnHeaders();
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

/* ============================================
   SECTION 7: INITIALIZATION
   App startup and setup
   ============================================ */

function initializeApp() {
    initSidebarResize();
    // Ensure fontList element exists before rendering
    if (fontList) {
        renderFontList(); // Initialize font list with browse button
    }
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Delete key: Remove selected fonts (when not typing in an input)
        if (e.key === 'Delete' && selectedIndices.size > 0) {
            const activeElement = document.activeElement;
            const isInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );
            
            // Only handle Delete if not typing in an input
            if (!isInput) {
                e.preventDefault();
                // Remove fonts in descending order to maintain correct indices
                Array.from(selectedIndices).sort((a, b) => b - a).forEach(index => {
                    removeFont(index);
                });
            }
        }
        
        // Escape key: Close modals/dropdowns
        if (e.key === 'Escape') {
            // Escape key handler (for future use)
        }
    });
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

