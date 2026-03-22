export interface AIServiceConfig {
    name: string;
    loginUrl: string;
    serviceUrl: string;
    logoutUrl?: string;
}

export abstract class BaseAIService {
    protected config: AIServiceConfig;
    
    constructor(config: AIServiceConfig) {
        this.config = config;
    }
    
    abstract getLoginUrl(): string;
    abstract getServiceUrl(): string;
    abstract validateSession(cookies: string[]): Promise<boolean>;
    abstract getSessionExpiration(): number;
    
    getName(): string {
        return this.config.name;
    }
    
    getConfig(): AIServiceConfig {
        return this.config;
    }
}