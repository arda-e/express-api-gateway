export function resetPasswordEmailTemplate(token: string) {
  const url = `https://example.com/reset-password?token=${token}`;
  return {
    subject: "Reset your password",
    text: `Reset your password by visiting ${url}`,
    html: `<p>Reset your password by <a href="${url}">clicking here</a>.</p>`,
  };
}
