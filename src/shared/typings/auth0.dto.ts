export interface MerovAppMetadata {
    userId: string;
    accountId: string;
}

export interface UpdateAuth0User {
    blocked?: boolean;
    app_metadata?: MerovAppMetadata;
}

export enum EmailTemplate {
    VerifyEmail = 'verify_email',
    VerifyEmailByCode = 'verify_email_by_code',
    ResetEmail = 'reset_email',
    WelcomeEmail = 'welcome_email',
    BlockedAccount = 'blocked_account',
    StolenCredentials = 'stolen_credentials',
    EnrollmentEmail = 'enrollment_email',
    MfaOobCode = 'mfa_oob_code',
    UserInvitation = 'user_invitation',
}
