export default function passwordChangedTemplate(emailConfirmUrl: string) {
    return `<p>You have successfully registered.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process: ${emailConfirmUrl}</p>
    `;
};