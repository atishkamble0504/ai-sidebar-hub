// media/main.js
// Professional AI Hub Launcher

// Initialize VS Code API - only if not already declared
let vscode;

if (typeof window !== 'undefined' && window.vscode) {
    vscode = window.vscode;
    console.log("✅ Using existing VS Code API from window");
} else {
    console.log("🔧 Initializing VS Code API...");
    try {
        vscode = acquireVsCodeApi();
        console.log("✅ VS Code API acquired successfully");
        window.vscode = vscode;
    } catch (error) {
        console.error("❌ Failed to acquire VS Code API:", error);
        vscode = {
            postMessage: (msg) => console.log("Mock postMessage:", msg)
        };
        window.vscode = vscode;
    }
}

console.log("🔍 vscode.postMessage type:", typeof vscode?.postMessage);

// Test if postMessage works
if (vscode && typeof vscode.postMessage === 'function') {
    console.log("✅ vscode.postMessage is available");
    // Send test message
    vscode.postMessage({ type: 'mainjs-loaded', timestamp: Date.now() });
} else {
    console.error("❌ vscode.postMessage is NOT a function! Type:", typeof vscode?.postMessage);
}

// Predefined Services - Compact 12-Service List
const predefinedServices = [
    // AI Assistants
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com' },
    { id: 'claude', name: 'Claude AI', icon: '🧠', url: 'https://claude.ai' },
    { id: 'gemini', name: 'Google Gemini', icon: '✨', url: 'https://gemini.google.com' },
    { id: 'perplexity', name: 'Perplexity AI', icon: '🔍', url: 'https://www.perplexity.ai' },
    { id: 'copilot', name: 'Copilot', icon: '👨‍💻', url: 'https://github.com/features/copilot' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🔷', url: 'https://chat.deepseek.com' },
    
    // Development & Code
    { id: 'github', name: 'GitHub', icon: '🐙', url: 'https://github.com' },
    { id: 'stackoverflow', name: 'Stack Overflow', icon: '📚', url: 'https://stackoverflow.com' },
    { id: 'mdn', name: 'MDN Web Docs', icon: '📖', url: 'https://developer.mozilla.org' },
    
    // AI Tools & Resources
    { id: 'huggingface', name: 'Hugging Face', icon: '🤗', url: 'https://huggingface.co' },
    { id: 'arxiv', name: 'arXiv', icon: '📄', url: 'https://arxiv.org' },
    { id: 'characterai', name: 'Character.AI', icon: '💬', url: 'https://character.ai' }
];

let customServices = [];
let recentServices = [];
let settings = { defaultBrowser: 'simpleBrowser' };

// DOM Elements
let urlInput;
let goBtn;
let quickLaunchGrid;
let customServicesGrid;
let customSection;
let recentSection;
let recentList;
let addCustomBtn;
let clearRecentBtn;
let defaultBrowserSelect;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing AI Hub Launcher...');
    initializeElements();
    attachEventListeners();
    renderQuickLaunch();
    
    // Request data from extension
    requestRecentServices();
    requestCustomServices();
    requestSettings();
    
    console.log('✅ AI Hub Launcher ready');
    console.log('🔍 vscode.postMessage available:', typeof vscode?.postMessage);
});

function initializeElements() {
    urlInput = document.getElementById('url-input');
    goBtn = document.getElementById('go-btn');
    quickLaunchGrid = document.getElementById('quick-launch');
    customServicesGrid = document.getElementById('custom-services');
    customSection = document.getElementById('custom-section');
    recentSection = document.getElementById('recent-section');
    recentList = document.getElementById('recent-list');
    addCustomBtn = document.getElementById('add-custom-btn');
    clearRecentBtn = document.getElementById('clear-recent-btn');
    defaultBrowserSelect = document.getElementById('default-browser');
    
    console.log('🔍 Elements found:', {
        urlInput: !!urlInput,
        goBtn: !!goBtn,
        quickLaunchGrid: !!quickLaunchGrid,
        customSection: !!customSection,
        recentSection: !!recentSection
    });
}

function attachEventListeners() {
    // Go button for custom URL
    if (goBtn && urlInput) {
        goBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                openUrl(url);
                urlInput.value = '';
            }
        });
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = urlInput.value.trim();
                if (url) {
                    openUrl(url);
                    urlInput.value = '';
                }
            }
        });
    }
    
    // Add custom service button
    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', showAddCustomDialog);
    }
    
    // Clear recent button
    if (clearRecentBtn) {
        clearRecentBtn.addEventListener('click', () => {
            if (confirm('Clear all recent services?')) {
                vscode.postMessage({ type: 'clearRecent' });
            }
        });
    }
    
    // Settings change
    if (defaultBrowserSelect) {
        defaultBrowserSelect.addEventListener('change', (e) => {
            settings.defaultBrowser = e.target.value;
            vscode.postMessage({ 
                type: 'updateSettings', 
                settings: { defaultBrowser: settings.defaultBrowser }
            });
        });
    }
}

function renderQuickLaunch() {
    if (!quickLaunchGrid) return;
    
    quickLaunchGrid.innerHTML = '';
    
    predefinedServices.forEach(service => {
        const card = createServiceCard(service);
        quickLaunchGrid.appendChild(card);
    });
}

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('data-service-id', service.id);
    card.setAttribute('data-url', service.url);
    card.setAttribute('data-name', service.name);
    
    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.textContent = service.icon;
    
    const name = document.createElement('div');
    name.className = 'service-name';
    name.textContent = service.name;
    
    card.appendChild(icon);
    card.appendChild(name);
    
    card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`🔵 Service clicked: ${service.name} (${service.id})`);
        openService(service.id, service.name, service.url);
    });
    
    return card;
}

function renderCustomServices() {
    if (!customServicesGrid) return;
    
    if (customServices.length === 0) {
        customSection.style.display = 'none';
        return;
    }
    
    customSection.style.display = 'block';
    customServicesGrid.innerHTML = '';
    
    customServices.forEach(service => {
        const card = createCustomServiceCard(service);
        customServicesGrid.appendChild(card);
    });
}

function createCustomServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card custom-card';
    card.setAttribute('data-service-id', service.id);
    card.setAttribute('data-url', service.url);
    card.setAttribute('data-name', service.name);
    
    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.textContent = service.icon || '🔗';
    
    const name = document.createElement('div');
    name.className = 'service-name';
    name.textContent = service.name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove custom service';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomService(service.id);
    });
    
    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(removeBtn);
    
    card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`🔵 Custom service clicked: ${service.name}`);
        openCustomService(service.url, service.name);
    });
    
    return card;
}

function renderRecentServices() {
    if (!recentList) return;
    
    if (recentServices.length === 0) {
        recentSection.style.display = 'none';
        return;
    }
    
    recentSection.style.display = 'block';
    recentList.innerHTML = '';
    
    recentServices.forEach(service => {
        const item = createRecentItem(service);
        recentList.appendChild(item);
    });
}

function createRecentItem(service) {
    const item = document.createElement('div');
    item.className = 'recent-item';
    
    const timeAgo = getTimeAgo(service.timestamp);
    
    item.innerHTML = `
        <span class="recent-icon">${service.icon || '📌'}</span>
        <span class="recent-name">${service.name}</span>
        <span class="recent-time">${timeAgo}</span>
    `;
    
    item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`🔵 Recent service clicked: ${service.name}`);
        openRecentService(service.url, service.name);
    });
    
    return item;
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function openService(serviceId, serviceName, url) {
    console.log(`🚀 Opening ${serviceName}...`);
    console.log(`📤 Sending openService message to extension`);
    
    // Only send message to extension - let extension handle the opening
    if (vscode && typeof vscode.postMessage === 'function') {
        vscode.postMessage({ 
            type: 'openService', 
            service: serviceId,
            displayName: serviceName,
            url: url
        });
        console.log("✅ Message sent successfully - extension will open the URL");
    } else {
        console.error("❌ vscode.postMessage is not available!");
        // Fallback: open directly
        openUrl(url);
    }
}

function openCustomService(url, name) {
    console.log(`🚀 Opening custom service: ${name}...`);
    openUrl(url);
}

function openRecentService(url, name) {
    console.log(`🚀 Reopening ${name}...`);
    openUrl(url);
}

function openUrl(url) {
    // Add https if no protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    console.log(`🌐 Opening URL: ${url} using ${settings.defaultBrowser}`);
    
    if (settings.defaultBrowser === 'simpleBrowser') {
        // Open in VS Code Simple Browser
        if (vscode && typeof vscode.postMessage === 'function') {
            vscode.postMessage({ type: 'openUrl', url: url });
        } else {
            console.error("❌ Cannot send openUrl message - vscode.postMessage not available");
            window.open(url, '_blank');
        }
    } else {
        // Open in external browser
        window.open(url, '_blank');
    }
}

function showAddCustomDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal">
            <h3>➕ Add Custom Service</h3>
            <div class="modal-field">
                <label>Service Name:</label>
                <input type="text" id="custom-name" placeholder="e.g., My AI Tool">
            </div>
            <div class="modal-field">
                <label>URL:</label>
                <input type="text" id="custom-url" placeholder="https://example.com">
            </div>
            <div class="modal-field">
                <label>Icon (emoji):</label>
                <input type="text" id="custom-icon" placeholder="🔧" maxlength="2">
            </div>
            <div class="modal-buttons">
                <button id="modal-cancel">Cancel</button>
                <button id="modal-add">Add Service</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const nameInput = document.getElementById('custom-name');
    const urlInput = document.getElementById('custom-url');
    const iconInput = document.getElementById('custom-icon');
    const cancelBtn = document.getElementById('modal-cancel');
    const addBtn = document.getElementById('modal-add');
    
    cancelBtn.addEventListener('click', () => dialog.remove());
    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        const icon = iconInput.value.trim() || '🔗';
        
        if (name && url) {
            if (vscode && typeof vscode.postMessage === 'function') {
                vscode.postMessage({ 
                    type: 'addCustomService', 
                    name: name,
                    url: url,
                    icon: icon
                });
            }
            dialog.remove();
        } else {
            alert('Please enter both name and URL');
        }
    });
}

function removeCustomService(id) {
    if (confirm('Remove this custom service?')) {
        if (vscode && typeof vscode.postMessage === 'function') {
            vscode.postMessage({ type: 'removeCustomService', id: id });
        }
    }
}

// Request data from extension
function requestRecentServices() {
    if (vscode && typeof vscode.postMessage === 'function') {
        vscode.postMessage({ type: 'getRecent' });
    }
}

function requestCustomServices() {
    if (vscode && typeof vscode.postMessage === 'function') {
        vscode.postMessage({ type: 'getCustomServices' });
    }
}

function requestSettings() {
    if (vscode && typeof vscode.postMessage === 'function') {
        vscode.postMessage({ type: 'getSettings' });
    }
}

// Handle messages from extension
window.addEventListener('message', (event) => {
    const message = event.data;
    
    if (!message || !message.type) return;
    
    console.log("📨 Received message from extension:", message.type);
    
    switch (message.type) {
        case 'recentData':
            recentServices = message.services || [];
            renderRecentServices();
            break;
            
        case 'customServicesData':
            customServices = message.services || [];
            renderCustomServices();
            break;
            
        case 'settingsData':
            settings = message.settings || settings;
            if (defaultBrowserSelect) {
                defaultBrowserSelect.value = settings.defaultBrowser || 'simpleBrowser';
            }
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (urlInput) urlInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        if (urlInput) urlInput.value = '';
    }
});

console.log('✅ AI Hub Launcher frontend initialized');
console.log("🔍 vscode.postMessage final check:", vscode ? typeof vscode.postMessage : 'undefined');