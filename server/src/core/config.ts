export const config = {
    ENABLE_MAIL: false,
    NO_REPLY_EMAIL: 'SaaS Starter <me@samples.mailgun.org>',
    FORGOT_PASSWORD_EMAIL_SUBJECT: 'Password reset for somedomain.com',
    PASSWORD_RESET_EMAIL_SUBJECT: 'Your password has been changed',
    EMAIL_CONFIRMED_EMAIL_SUBJECT: 'Your email address has been confirmed',
    PASSWORD_RESET_URL: 'http://localhost:9000/api/auth/reset/',
    ROLES: [
        'admin',
        'user'
    ],
    DEFAULT_ROLE: 'user',
    TEST_MODE: process.env.NODE_ENV === 'development'
};

export type RoleType = 'admin' | 'user';
