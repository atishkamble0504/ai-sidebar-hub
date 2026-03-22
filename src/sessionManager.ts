import * as vscode from 'vscode';
import { Logger } from './utils/logger';

export interface SessionData {
    email: string;
    timestamp: number;
    expiresAt?: number;
}

export class SessionManager {
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
    
    async saveEmail(service: string, email: string): Promise<void> {
        const sessionData: SessionData = {
            email: email,
            timestamp: Date.now(),
            expiresAt: this.getExpirationDate(service)
        };
        
        await this.context.secrets.store(
            `${service}_session`,
            JSON.stringify(sessionData)
        );
        
        await this.context.secrets.store(`${service}_email`, email);
        Logger.info(`Session saved for ${service}`);
    }
    
    async getEmail(service: string): Promise<string | null> {
        const sessionData = await this.getSessionData(service);
        return sessionData?.email || null;
    }
    
    async isLoggedIn(service: string): Promise<boolean> {
        const sessionData = await this.getSessionData(service);
        
        if (!sessionData) {
            return false;
        }
        
        // Check if session is expired
        if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
            await this.clearSession(service);
            return false;
        }
        
        return true;
    }
    
    async clearSession(service: string): Promise<void> {
        await this.context.secrets.delete(`${service}_session`);
        await this.context.secrets.delete(`${service}_email`);
        Logger.info(`Session cleared for ${service}`);
    }
    
    async clearAllSessions(): Promise<void> {
        const services = ['chatgpt', 'claude', 'gemini', 'perplexity', 'copilot'];
        for (const service of services) {
            await this.clearSession(service);
        }
    }
    
    async restoreSessions(): Promise<void> {
        const services = ['chatgpt', 'claude', 'gemini', 'perplexity', 'copilot'];
        
        for (const service of services) {
            const email = await this.getEmail(service);
            if (email) {
                Logger.info(`Found existing session for ${service} (${email})`);
            }
        }
    }
    
    private async getSessionData(service: string): Promise<SessionData | null> {
        const data = await this.context.secrets.get(`${service}_session`);
        if (!data) return null;
        
        try {
            return JSON.parse(data) as SessionData;
        } catch (error) {
            Logger.error(`Failed to parse session data for ${service}:`, error);
            return null;
        }
    }
    
    private getExpirationDate(service: string): number | undefined {
        // Different expiration times for different services
        const expirationDays: Record<string, number> = {
            'chatgpt': 30,
            'claude': 30,
            'gemini': 14,
            'perplexity': 30,
            'copilot': 7
        };
        
        const days = expirationDays[service];
        if (days) {
            return Date.now() + (days * 24 * 60 * 60 * 1000);
        }
        
        return undefined;
    }
}