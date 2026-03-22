import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;
    
    static getChannel(): vscode.OutputChannel {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('AI Hub');
        }
        return this.outputChannel;
    }
    
    static info(message: string, ...args: any[]): void {
        const formattedMessage = `[INFO] ${new Date().toISOString()} - ${message}`;
        this.getChannel().appendLine(formattedMessage);
        if (args.length > 0) {
            this.getChannel().appendLine(JSON.stringify(args, null, 2));
        }
        console.log(formattedMessage, ...args);
    }
    
    static error(message: string, ...args: any[]): void {
        const formattedMessage = `[ERROR] ${new Date().toISOString()} - ${message}`;
        this.getChannel().appendLine(formattedMessage);
        if (args.length > 0) {
            this.getChannel().appendLine(JSON.stringify(args, null, 2));
        }
        console.error(formattedMessage, ...args);
    }
    
    static debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = `[DEBUG] ${new Date().toISOString()} - ${message}`;
            this.getChannel().appendLine(formattedMessage);
            if (args.length > 0) {
                this.getChannel().appendLine(JSON.stringify(args, null, 2));
            }
            console.debug(formattedMessage, ...args);
        }
    }
    
    static show(): void {
        this.getChannel().show();
    }
}