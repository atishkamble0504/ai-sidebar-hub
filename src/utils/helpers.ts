import * as vscode from 'vscode';

export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

export function truncateString(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

export function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function getExtensionVersion(): string {
    const extension = vscode.extensions.getExtension('your-publisher-name.ai-sidebar-hub');
    return extension?.packageJSON?.version || '0.0.1';
}

export function openExternalLink(url: string) {
    vscode.env.openExternal(vscode.Uri.parse(url));
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}