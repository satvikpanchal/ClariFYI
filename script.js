// DOM Elements
const inputText = document.getElementById('inputText');
const simplicitySlider = document.getElementById('simplicity');
const simplicityValue = document.getElementById('simplicityValue');
const sliderFill = document.getElementById('sliderFill');
const simplicityDescription = document.getElementById('simplicityDescription');
const tonePills = document.querySelectorAll('.tone-pill');
const toneInput = document.getElementById('toneInput');
const toneInputContainer = document.getElementById('toneInputContainer');
const toneInputClear = document.getElementById('toneInputClear');
const explainBtn = document.getElementById('explainBtn');
const outputArea = document.getElementById('outputArea');
const outputText = document.getElementById('outputText');
const loadingArea = document.getElementById('loadingArea');
const loadingText = document.querySelector('.loading-text');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileList = document.getElementById('fileList');

// State
let uploadedFiles = [];

// State
let isProcessing = false;
let currentSimplicity = 0;
let currentTone = 0;

// Tone labels
const toneLabels = {
    0: 'Friendly',
    1: 'Teacher',
    2: 'Funny',
    3: 'Calm',
    4: 'Professional',
    5: 'Enthusiastic'
};

// Simplicity labels
const simplicityLabels = {
    0: "Like I'm 5",
    1: "Like I'm 7",
    2: "Like I'm 10",
    3: "Like I'm 15",
    4: "High School",
    5: "College",
    6: "Grad",
    7: "Post Grad",
    8: "Expert"
};

// Loading messages for each simplicity level
const loadingMessages = {
    0: "🧒 Thinking like a 5-year-old…",
    1: "👶 Thinking like a 7-year-old…",
    2: "🎈 Thinking like a 10-year-old…",
    3: "🎮 Thinking like a 15-year-old…",
    4: "📚 Thinking like a high schooler…",
    5: "🎓 Thinking like a college student…",
    6: "💼 Thinking like a grad student…",
    7: "🔬 Thinking like a post-grad…",
    8: "🧠 Thinking like an expert…"
};

// Simplicity descriptions
const simplicityDescriptions = {
    0: '🧒 Super simple explanations with basic words and fun analogies. Perfect for children.',
    1: '👶 Simple explanations with easy words. Uses comparisons to everyday things.',
    2: '🎈 Clear explanations with familiar concepts. Avoids jargon and technical terms.',
    3: '🎮 Straightforward explanations with some detail. Accessible to teenagers.',
    4: '📚 Detailed explanations with context. Uses clear language suitable for high school students.',
    5: '🎓 Comprehensive explanations with examples. Assumes some general knowledge.',
    6: '💼 Professional explanations with structured information. Graduate-level understanding.',
    7: '🔬 Academic explanations with precise language. Post-graduate level.',
    8: '🧠 Expert-level explanations with technical depth. Assumes advanced knowledge.'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    simplicityValue.textContent = simplicityLabels[currentSimplicity];
    updateSliderFill();
    updateSimplicityDescription();
    updateTonePills();
    setupFileUpload();
    
    // Tone input handlers
    if (toneInput) {
        toneInput.addEventListener('input', () => {
            // When user types, automatically select custom mode
            if (toneInput.value.trim()) {
                const customPill = document.querySelector('.tone-pill[data-value="custom"]');
                if (customPill && !customPill.classList.contains('active')) {
                    currentTone = 'custom';
                    updateTonePills();
                }
            }
        });
        
        toneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (toneInput.value.trim()) {
                    handleExplain();
                }
            }
        });
    }
    
    // Clear button handler
    if (toneInputClear) {
        toneInputClear.addEventListener('click', () => {
            if (toneInput) {
                toneInput.value = '';
                // Reset to default tone (Friendly)
                currentTone = 0;
                updateTonePills();
            }
        });
    }
});

// File upload setup
function setupFileUpload() {
    if (!fileInput || !fileUploadArea) return;
    
    // Click to browse
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    const uploadLink = fileUploadArea.querySelector('.upload-link');
    if (uploadLink) {
        uploadLink.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(Array.from(e.target.files));
            fileInput.value = ''; // Reset input
        }
    });
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(Array.from(e.dataTransfer.files));
        }
    });
    
    // Also allow dropping on textarea
    inputText.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (uploadedFiles.length === 0) {
            fileUploadArea.classList.add('drag-over');
        }
    });
    
    inputText.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });
    
    inputText.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(Array.from(e.dataTransfer.files));
        }
    });
    
    updateFileList();
    updateFileUploadArea();
}

// Make removeFile accessible globally for onclick
window.removeFile = removeFile;

function updateSimplicityDescription() {
    if (simplicityDescription) {
        simplicityDescription.textContent = simplicityDescriptions[currentSimplicity];
    }
}

// Simplicity slider handler - only update on actual change (click/drag)
simplicitySlider.addEventListener('input', (e) => {
    // Only update if user is actually interacting (not just hovering)
    if (e.isTrusted) {
        currentSimplicity = parseInt(e.target.value);
        simplicityValue.textContent = simplicityLabels[currentSimplicity];
        updateSliderFill();
        updateSimplicityDescription();
    }
});

simplicitySlider.addEventListener('change', (e) => {
    currentSimplicity = parseInt(e.target.value);
    simplicityValue.textContent = simplicityLabels[currentSimplicity];
    updateSliderFill();
    updateSimplicityDescription();
});

// Handle click on slider track to set value
simplicitySlider.addEventListener('click', (e) => {
    // Click event will trigger input/change, so we just ensure it's set
    currentSimplicity = parseInt(e.target.value);
    simplicityValue.textContent = simplicityLabels[currentSimplicity];
    updateSliderFill();
    updateSimplicityDescription();
});

// Hover preview for slider (show description without changing value)
const sliderWrapper = simplicitySlider.closest('.slider-wrapper');
if (sliderWrapper && simplicityDescription) {
    let isDragging = false;
    
    // Track when user starts dragging
    simplicitySlider.addEventListener('mousedown', () => {
        isDragging = true;
    });
    
    simplicitySlider.addEventListener('mouseup', () => {
        isDragging = false;
        // Reset to actual selected value after drag
        updateSimplicityDescription();
    });
    
    // Also handle mouseup outside the slider
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            updateSimplicityDescription();
        }
    });
    
    // Show preview on hover when not dragging (label and description)
    sliderWrapper.addEventListener('mousemove', (e) => {
        if (isDragging) return; // Don't show preview while dragging
        
        const rect = simplicitySlider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        // Calculate which value (0-8) is being hovered
        const hoveredValue = Math.round(percentage * 8);
        const clampedValue = Math.max(0, Math.min(8, hoveredValue));
        
        // Show hovered label and description without changing actual value
        if (simplicityLabels[clampedValue] && simplicityDescriptions[clampedValue]) {
            // Update label to show hovered option
            simplicityValue.textContent = simplicityLabels[clampedValue];
            // Update description to show hovered option
            simplicityDescription.textContent = simplicityDescriptions[clampedValue];
        }
    });
    
    sliderWrapper.addEventListener('mouseleave', () => {
        // Reset to actual selected value when mouse leaves
        if (!isDragging) {
            simplicityValue.textContent = simplicityLabels[currentSimplicity];
            updateSimplicityDescription();
        }
    });
}

function updateSliderFill() {
    const percentage = (currentSimplicity / 8) * 100;
    sliderFill.style.width = `${percentage}%`;
}

// Tone pill buttons
tonePills.forEach((pill) => {
    pill.addEventListener('click', () => {
        const value = pill.dataset.value;
        if (value === 'custom') {
            // Toggle custom input visibility
            currentTone = 'custom';
            updateTonePills();
        } else {
            // Regular tone pill selected
            currentTone = parseInt(value);
            updateTonePills();
        }
    });
    
    // Keyboard support
    pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pill.click();
        }
    });
});

function updateTonePills() {
    tonePills.forEach((pill) => {
        const value = pill.dataset.value;
        const isCustom = value === 'custom';
        const isActive = (isCustom && currentTone === 'custom') || 
                        (!isCustom && parseInt(value) === currentTone);
        
        if (isActive) {
            pill.setAttribute('aria-pressed', 'true');
            pill.classList.add('active');
        } else {
            pill.setAttribute('aria-pressed', 'false');
            pill.classList.remove('active');
        }
    });
    
    // Show/hide custom input based on selection
    if (toneInputContainer) {
        if (currentTone === 'custom') {
            toneInputContainer.classList.remove('hidden');
            if (toneInput) {
                // If input is empty, focus it
                if (!toneInput.value.trim()) {
                    toneInput.focus();
                }
            }
        } else {
            // Hide custom input when regular tone is selected
            toneInputContainer.classList.add('hidden');
        }
    }
}

// Explain button handler
explainBtn.addEventListener('click', handleExplain);
inputText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleExplain();
    }
});

// File handling functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function isImageFile(filename) {
    const ext = getFileExtension(filename);
    return ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].includes(ext);
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:type;base64, prefix
            const dataUrl = reader.result;
            
            // Extract MIME type from data URL or use file type
            let mimeType = file.type;
            if (!mimeType && dataUrl.includes('data:')) {
                mimeType = dataUrl.split(';')[0].split(':')[1];
            }
            
            // Fallback MIME types based on extension
            if (!mimeType) {
                const ext = getFileExtension(file.name).toLowerCase();
                const mimeTypes = {
                    'pdf': 'application/pdf',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'ppt': 'application/vnd.ms-powerpoint',
                    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'txt': 'text/plain',
                    'rtf': 'application/rtf',
                    'png': 'image/png',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'webp': 'image/webp',
                    'heic': 'image/heic',
                    'heif': 'image/heif'
                };
                mimeType = mimeTypes[ext] || 'application/octet-stream';
            }
            
            resolve({
                mimeType: mimeType,
                data: base64
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleFileUpload(files) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const maxFiles = 10;
    
    if (uploadedFiles.length + files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed. Please remove some files first.`);
        return;
    }
    
    for (const file of files) {
        if (file.size > maxSize) {
            alert(`File "${file.name}" is too large. Maximum size is 100MB.`);
            continue;
        }
        
        uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        });
    }
    
    updateFileList();
    updateFileUploadArea();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    updateFileUploadArea();
}

function updateFileList() {
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        fileList.style.display = 'none';
        return;
    }
    
    fileList.style.display = 'block';
    
    uploadedFiles.forEach((fileData, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-item-info">
                <span class="file-item-name">${fileData.name}</span>
                <span class="file-item-size">${formatFileSize(fileData.size)}</span>
            </div>
            <button class="file-item-remove" onclick="removeFile(${index})" aria-label="Remove file">×</button>
        `;
        fileList.appendChild(fileItem);
    });
}

function updateFileUploadArea() {
    if (!fileUploadArea) return;
    
    if (uploadedFiles.length > 0) {
        fileUploadArea.classList.add('has-files');
        fileUploadArea.style.display = 'none';
    } else {
        fileUploadArea.classList.remove('has-files');
        fileUploadArea.style.display = 'block';
    }
}

function handleExplain() {
    const text = inputText.value.trim();
    
    // Check if we have either text or files
    if (!text && uploadedFiles.length === 0) {
        inputText.focus();
        inputText.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        setTimeout(() => {
            inputText.style.borderColor = '';
        }, 2000);
        return;
    }
    
    if (isProcessing) return;
    
    // Get custom tone text if custom mode is selected, otherwise use selected pill
    const customTone = (currentTone === 'custom' && toneInput) ? toneInput.value.trim() : '';
    const toneStyle = customTone || (typeof currentTone === 'number' ? toneLabels[currentTone] : 'Custom');
    
    // Log the request details
    console.log('📝 Explanation Request:');
    console.log(`   Simplicity Level: ${currentSimplicity}`);
    console.log(`   Tone Style: ${toneStyle}${customTone ? ' (custom)' : ''}`);
    console.log(`   Text length: ${text.length} characters`);
    
    isProcessing = true;
    explainBtn.disabled = true;
    
    // Hide output, show loading
    outputArea.classList.add('hidden');
    loadingArea.classList.remove('hidden');
    
    // Update loading message based on simplicity level
    if (loadingText) {
        loadingText.textContent = loadingMessages[currentSimplicity] || loadingMessages[0];
    }
    
    // Call API
    // Use custom tone text if provided, otherwise use tone index
    const toneToSend = customTone ? customTone : currentTone;
    callExplainAPI(text, currentSimplicity, toneToSend, uploadedFiles)
        .then(result => {
            displayResult(result);
        })
        .catch(error => {
            displayError(error);
        })
        .finally(() => {
            isProcessing = false;
            explainBtn.disabled = false;
            loadingArea.classList.add('hidden');
        });
}

// API call to backend
async function callExplainAPI(text, simplicity, tone, files = []) {
    try {
        // Prepare file data
        const fileData = [];
        for (const fileInfo of files) {
            const base64Data = await fileToBase64(fileInfo.file);
            fileData.push({
                name: fileInfo.name,
                mimeType: base64Data.mimeType,
                data: base64Data.data,
                isImage: isImageFile(fileInfo.name)
            });
        }
        
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text.trim(),
                simplicity: parseInt(simplicity),
                tone: typeof tone === 'string' ? tone : parseInt(tone),
                files: fileData
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.explanation;
    } catch (error) {
        console.error('API Error:', error);
        
        // Check if server is running
        if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
            throw new Error('API server is not running. Please start it with: npm start');
        }
        
        throw error;
    }
}

// Display result
function displayResult(text) {
    outputText.textContent = text;
    outputArea.classList.remove('hidden');
    
    // Smooth scroll to output
    setTimeout(() => {
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Display error
function displayError(error) {
    outputText.textContent = `Error: ${error.message}`;
    outputArea.classList.remove('hidden');
}

// Copy button handler
copyBtn.addEventListener('click', async () => {
    const text = outputText.textContent;
    
    if (!text) return;
    
    try {
        await navigator.clipboard.writeText(text);
        showToast();
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast();
    }
});

// Show toast notification
function showToast() {
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 2000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to clear output
    if (e.key === 'Escape' && !outputArea.classList.contains('hidden')) {
        outputArea.classList.add('hidden');
        outputText.textContent = '';
    }
});

// Slider keyboard navigation
simplicitySlider.addEventListener('keydown', (e) => {
    let value = parseInt(simplicitySlider.value);
    const min = parseInt(simplicitySlider.min);
    const max = parseInt(simplicitySlider.max);
    const step = parseInt(simplicitySlider.step) || 1;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        value = Math.max(min, value - step);
        simplicitySlider.value = value;
        simplicitySlider.dispatchEvent(new Event('input'));
        simplicitySlider.dispatchEvent(new Event('change'));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        value = Math.min(max, value + step);
        simplicitySlider.value = value;
        simplicitySlider.dispatchEvent(new Event('input'));
        simplicitySlider.dispatchEvent(new Event('change'));
    }
});
