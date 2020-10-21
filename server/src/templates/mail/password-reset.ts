export default function passwordResetTemplate(passwordResetUrl: string) {
    return `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>

    <p>Please click on the following link, or paste this into your browser to complete the process: ${passwordResetUrl}</p>

    <p><a href="${passwordResetUrl}">Click here to reset your password</a></p>
    
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
};