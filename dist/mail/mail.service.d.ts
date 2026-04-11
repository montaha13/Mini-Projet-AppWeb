import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    private readonly logger;
    private readonly mailFrom;
    constructor(configService: ConfigService);
    sendUserCredentials(email: string, generatedPassword: string): Promise<void>;
}
