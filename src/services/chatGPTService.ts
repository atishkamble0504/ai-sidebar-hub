import { BaseAIService, AIServiceConfig } from './baseService';

export class ChatGPTService extends BaseAIService {
    constructor() {
        super({
            name: 'ChatGPT',
            loginUrl: 'https://chat.openai.com/auth/login',
            serviceUrl: 'https://chat.openai.com'
        });
    }
    
    getLoginUrl(): string {
        return this.config.loginUrl;
    }
    
    getServiceUrl(): string {
        return this.config.serviceUrl;
    }
    
    async validateSession(cookies: string[]): Promise<boolean> {
        // Check if session is valid by making a test request
        try {
            // This is a simplified check
            return cookies.some(cookie => cookie.includes('__Secure-next-auth.session-token'));
        } catch (error) {
            return false;
        }
    }
    
    getSessionExpiration(): number {
        // ChatGPT sessions typically last 30 days
        return 30 * 24 * 60 * 60 * 1000;
    }
}