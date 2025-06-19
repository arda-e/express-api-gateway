export function verificationEmailTemplate(token: string) {
  const url = `https://example.com/verify?token=${token}`;
  return {
    subject: "Verify your email",
    text: `Please verify your email by visiting ${url}`,
    html: `<p>Verify your email by <a href="${url}">clicking here</a>.</p>`,
  };
}
