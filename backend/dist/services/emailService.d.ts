interface GuestEmail {
    name: string;
    email?: string | null;
    phone?: string | null;
    backup_code: string;
    qr_token: string;
}
interface EventEmail {
    name: string;
    date: Date;
    location: string;
}
export declare function sendInviteEmail(guest: GuestEmail, event: EventEmail, baseUrl: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export declare function verifyEmailConfig(): Promise<boolean>;
export {};
//# sourceMappingURL=emailService.d.ts.map