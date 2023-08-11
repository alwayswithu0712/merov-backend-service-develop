import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { SmsService } from "../shared/services/sms.service";
import { Cache } from 'cache-manager';

@Injectable()
export class PhoneOtpService {

    constructor(@Inject(CACHE_MANAGER) private cache: Cache, 
    private readonly smsService: SmsService) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async send(phone: string): Promise<void> {
        const password = this.generateOtp();
        await this.cache.del(phone);
        await this.cache.set(phone, password, { ttl: 60 * 5 /* 5 minutes */});
        await this.smsService.send(phone, `Your Merov ID Code is: ${password} Please don't share this code with anyone.`);
    }

    async verify(phone: string, password: string): Promise<boolean> {
        const cachedPassword = await this.cache.get(phone);
        return cachedPassword === password;
    }
}