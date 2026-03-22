import * as vscode from 'vscode';

export class AIHubViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiHubView';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        console.log("🚀 AI Hub Launcher Loaded");

        this._view = webviewView;
        const webview = webviewView.webview;

        webview.options = {
            enableScripts: true,
            enableForms: true,
            enableCommandUris: true,
            localResourceRoots: [this._extensionUri]
        };

        webview.html = this._getHtmlForWebview(webview);

        // Message handler for launcher actions
        webview.onDidReceiveMessage(async (message: any) => {
            console.log("📩 Message received:", message.type);
            
            switch (message.type) {
                case 'openUrl':
                    console.log("🌐 Opening URL:", message.url);
                    await this.openInSimpleBrowser(message.url);
                    break;
                    
                case 'openService':
                    console.log("🚀 Opening service:", message.service);
                    const serviceUrl = this.getServiceUrl(message.service);
                    if (serviceUrl) {
                        await this.openInSimpleBrowser(serviceUrl);
                        await this.trackRecentService(message.service, message.displayName, serviceUrl);
                    }
                    break;
                    
                case 'addCustomService':
                    console.log("➕ Adding custom service:", message.name);
                    await this.addCustomService(message.name, message.url, message.icon);
                    break;
                    
                case 'removeCustomService':
                    console.log("❌ Removing custom service:", message.id);
                    await this.removeCustomService(message.id);
                    break;
                    
                case 'clearRecent':
                    console.log("🗑️ Clearing recent history");
                    await this.clearRecentHistory();
                    break;
                    
                case 'getRecent':
                    console.log("📋 Getting recent services");
                    await this.sendRecentServices();
                    break;
                    
                case 'getCustomServices':
                    console.log("📋 Getting custom services");
                    await this.sendCustomServices();
                    break;
                    
                case 'getSettings':
                    console.log("⚙️ Getting settings");
                    await this.sendSettings();
                    break;
                    
                case 'updateSettings':
                    console.log("⚙️ Updating settings");
                    await this.updateSettings(message.settings);
                    break;
                    
                default:
                    console.log("⚠️ Unknown message type:", message.type);
            }
        });
        
        // Send initial data to webview
        this.sendRecentServices();
        this.sendCustomServices();
        this.sendSettings();
        
        console.log("✅ AI Hub Launcher ready");
    }
    
    private async openInSimpleBrowser(url: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('simpleBrowser.api.open', url);
        } catch (error) {
            console.error("Failed to open URL:", error);
            vscode.window.showErrorMessage(`Failed to open: ${url}`);
        }
    }
    
    private getServiceUrl(service: string): string {
    const serviceUrls: Record<string, string> = {
        'chatgpt': 'https://chat.openai.com',
        'claude': 'https://claude.ai',
        'gemini': 'https://gemini.google.com',
        'perplexity': 'https://www.perplexity.ai',
        'copilot': 'https://copilot.microsoft.com/',
        'deepseek': 'https://chat.deepseek.com',
        'github': 'https://github.com',
        'stackoverflow': 'https://stackoverflow.com',
        'mdn': 'https://developer.mozilla.org',
        'huggingface': 'https://huggingface.co',
        'arxiv': 'https://arxiv.org',
        'characterai': 'https://character.ai'
    };
    return serviceUrls[service] || '';
}
    
    private getServiceDisplayName(service: string): string {
        const displayNames: Record<string, string> = {
            'chatgpt': 'ChatGPT',
            'claude': 'Claude AI',
            'gemini': 'Google Gemini',
            'perplexity': 'Perplexity AI',
            'copilot': 'GitHub Copilot',
            'github': 'GitHub',
            'youtube': 'YouTube',
            'midjourney': 'Midjourney',
            'huggingface': 'Hugging Face',
            'characterai': 'Character.AI',
            'pi': 'Pi AI',
            'poe': 'Poe'
        };
        return displayNames[service] || 'AI Service';
    }
    
    private async trackRecentService(serviceId: string, displayName: string, url: string): Promise<void> {
        const recentKey = 'aiHub.recentServices';
        const config = vscode.workspace.getConfiguration();
        const recent: any[] = config.get(recentKey) || [];
        
        const newEntry = {
            id: serviceId,
            name: displayName,
            url: url,
            timestamp: Date.now()
        };
        
        const filtered = recent.filter(r => r.id !== serviceId);
        filtered.unshift(newEntry);
        const trimmed = filtered.slice(0, 10);
        
        await config.update(recentKey, trimmed, vscode.ConfigurationTarget.Global);
        await this.sendRecentServices();
    }
    
    private async sendRecentServices(): Promise<void> {
        const recentKey = 'aiHub.recentServices';
        const recent = vscode.workspace.getConfiguration().get<any[]>(recentKey) || [];
        
        this._view?.webview.postMessage({
            type: 'recentData',
            services: recent
        });
    }
    
    private async clearRecentHistory(): Promise<void> {
        const recentKey = 'aiHub.recentServices';
        await vscode.workspace.getConfiguration().update(
            recentKey,
            [],
            vscode.ConfigurationTarget.Global
        );
        await this.sendRecentServices();
        vscode.window.showInformationMessage('Recent history cleared');
    }
    
    private async addCustomService(name: string, url: string, icon: string): Promise<void> {
        const customKey = 'aiHub.customServices';
        const config = vscode.workspace.getConfiguration();
        const custom: any[] = config.get(customKey) || [];
        
        const newService = {
            id: `custom_${Date.now()}`,
            name: name,
            url: url,
            icon: icon || '🔗',
            isCustom: true
        };
        
        custom.push(newService);
        
        await config.update(customKey, custom, vscode.ConfigurationTarget.Global);
        await this.sendCustomServices();
        vscode.window.showInformationMessage(`Added ${name} to launcher`);
    }
    
    private async removeCustomService(id: string): Promise<void> {
        const customKey = 'aiHub.customServices';
        const config = vscode.workspace.getConfiguration();
        const custom: any[] = config.get(customKey) || [];
        
        const filtered = custom.filter(s => s.id !== id);
        
        await config.update(customKey, filtered, vscode.ConfigurationTarget.Global);
        await this.sendCustomServices();
        vscode.window.showInformationMessage('Custom service removed');
    }
    
    private async sendCustomServices(): Promise<void> {
        const customKey = 'aiHub.customServices';
        const custom = vscode.workspace.getConfiguration().get<any[]>(customKey) || [];
        
        this._view?.webview.postMessage({
            type: 'customServicesData',
            services: custom
        });
    }
    
    private async sendSettings(): Promise<void> {
        const defaultBrowser = vscode.workspace.getConfiguration().get<string>('aiHub.defaultBrowser') || 'simpleBrowser';
        
        this._view?.webview.postMessage({
            type: 'settingsData',
            settings: {
                defaultBrowser: defaultBrowser
            }
        });
    }
    
    private async updateSettings(settings: any): Promise<void> {
        if (settings.defaultBrowser) {
            await vscode.workspace.getConfiguration().update(
                'aiHub.defaultBrowser',
                settings.defaultBrowser,
                vscode.ConfigurationTarget.Global
            );
        }
        
        vscode.window.showInformationMessage('Settings updated');
        await this.sendSettings();
    }
    
    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css')
        );
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>AI Hub Launcher</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 class="title">🤖 AI HUB</h2>
            <p class="subtitle">Launcher</p>
        </div>
        
        <div class="search-section">
            <input 
                type="text" 
                id="url-input" 
                placeholder="🔍 Search or enter URL (e.g., https://chat.openai.com)"
                class="url-input">
            <button id="go-btn" class="btn-go">Go</button>
        </div>
        
        <div class="section">
            <div class="section-header">
                <span class="section-title">⭐ QUICK LAUNCH</span>
            </div>
            <div class="service-grid" id="quick-launch">
                <div class="service-card" data-service="chatgpt">
                    <div class="service-icon">🤖</div>
                    <div class="service-name">ChatGPT</div>
                </div>
                <div class="service-card" data-service="claude">
                    <div class="service-icon">🧠</div>
                    <div class="service-name">Claude AI</div>
                </div>
                <div class="service-card" data-service="gemini">
                    <div class="service-icon">✨</div>
                    <div class="service-name">Google Gemini</div>
                </div>
                <div class="service-card" data-service="perplexity">
                    <div class="service-icon">🔍</div>
                    <div class="service-name">Perplexity AI</div>
                </div>
                <div class="service-card" data-service="copilot">
                    <div class="service-icon">👨‍💻</div>
                    <div class="service-name">Copilot</div>
                </div>
                <div class="service-card" data-service="github">
                    <div class="service-icon">🐙</div>
                    <div class="service-name">GitHub</div>
                </div>
                <div class="service-card" data-service="youtube">
                    <div class="service-icon">📺</div>
                    <div class="service-name">YouTube</div>
                </div>
                <div class="service-card" data-service="midjourney">
                    <div class="service-icon">🎨</div>
                    <div class="service-name">Midjourney</div>
                </div>
                <div class="service-card" data-service="huggingface">
                    <div class="service-icon">🤗</div>
                    <div class="service-name">Hugging Face</div>
                </div>
            </div>
        </div>
        
        <div class="section" id="custom-section" style="display:none;">
            <div class="section-header">
                <span class="section-title">🔧 CUSTOM SERVICES</span>
                <button id="add-custom-btn" class="btn-icon-small">➕ Add</button>
            </div>
            <div class="service-grid" id="custom-services"></div>
        </div>
        
        <div class="section" id="recent-section" style="display:none;">
            <div class="section-header">
                <span class="section-title">📌 RECENT</span>
                <button id="clear-recent-btn" class="btn-icon-small">🗑️ Clear</button>
            </div>
            <div class="recent-list" id="recent-list"></div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <span class="section-title">⚙️ SETTINGS</span>
            </div>
            <div class="settings-panel">
                <label class="setting-item">
                    <span>Default Browser:</span>
                    <select id="default-browser">
                        <option value="simpleBrowser">VS Code Simple Browser</option>
                        <option value="external">External Browser</option>
                    </select>
                </label>
            </div>
        </div>
        
        <div class="footer">
            <span class="footer-text">✨ Click any service to open in VS Code</span>
        </div>
    </div>
    
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
    
    public refresh(): void {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }
}