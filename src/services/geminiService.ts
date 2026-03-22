import { BaseAIService, AIServiceConfig } from './baseService';

export class GeminiService extends BaseAIService {
    constructor() {
        super({
            name: 'Gemini',
            loginUrl: 'https://accounts.google.com/signin',
            serviceUrl: 'https://gemini.google.com',
            logoutUrl: 'https://accounts.google.com/logout'
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
            // Check for Google session cookies
            return cookies.some(cookie => 
                cookie.includes('SAPISID') || 
                cookie.includes('APISID') || 
                cookie.includes('HSID')
            );
        } catch (error) {
            return false;
        }
    }
    
    getSessionExpiration(): number {
        // Google sessions typically last 14 days
        return 14 * 24 * 60 * 60 * 1000;
    }
}