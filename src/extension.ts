import * as vscode from 'vscode';
import { AIHubViewProvider } from './AIHubViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('🎯 AI Hub Launcher is now active!');
    
    // Register the WebView Provider
    const provider = new AIHubViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            AIHubViewProvider.viewType,
            provider
        )
    );
    console.log('✅ WebView Provider registered');
    
    // Register command to open AI Hub
    context.subscriptions.push(
        vscode.commands.registerCommand('aiHub.open', () => {
            console.log('📂 Opening AI Hub Launcher');
            vscode.commands.executeCommand('workbench.view.extension.aiHub');
        })
    );
    console.log('✅ Open command registered');
    
    // Register refresh command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiHub.refresh', () => {
            console.log('⟳ Refreshing AI Hub Launcher');
            provider.refresh();
        })
    );
    console.log('✅ Refresh command registered');
    
    // Show welcome message for first-time users
    const isFirstTime = context.globalState.get('aiHub.firstTime', true);
    if (isFirstTime) {
        vscode.window.showInformationMessage(
            '🤖 Welcome to AI Hub Launcher! Click any AI service to open it in VS Code.',
            'Open Launcher'
        ).then(selection => {
            if (selection === 'Open Launcher') {
                vscode.commands.executeCommand('workbench.view.extension.aiHub');
            }
        });
        context.globalState.update('aiHub.firstTime', false);
        console.log('🎉 Welcome message shown');
    }
    
    console.log('✅ AI Hub Launcher activation complete!');
}

export function deactivate() {
    console.log('👋 AI Hub Launcher is deactivating');
}