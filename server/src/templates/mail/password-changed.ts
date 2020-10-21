export default function passwordChangedTemplate(email: string) {
    return `<p>We are just letting you know that the password for your account ${email} has been changed.</p>
    <p>If you did not change your password, please contact us immediately</p>
    `;
};