import { BaseAIService, AIServiceConfig } from './baseService';

export class ClaudeService extends BaseAIService {
    constructor() {
        super({
            name: 'Claude',
            loginUrl: 'https://claude.ai/login',
            serviceUrl: 'https://claude.ai'
        });
    }
    
    getLoginUrl(): string {
        return this.config.loginUrl;
    }
    
    getServiceUrl(): string {
        return this.config.serviceUrl;
    }
    
    async validateSession(cookies: string[]): Promise<boolean> {
        try {
            // Check for Claude session cookie
            return cookies.some(cookie => cookie.includes('sessionKey') || cookie.includes('claude'));
        } catch (error) {
            return false;
        }
    }
    
    getSessionExpiration(): number {
        // Claude sessions typically last 30 days
        return 30 * 24 * 60 * 60 * 1000;
    }
}