import "reflect-metadata";
import nodemailer from "nodemailer";
import { MailService } from "@utils/MailService";

const sendMailMock = jest.fn();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(() => {
    sendMailMock.mockClear();
    mailService = new MailService();
  });

  it("sends welcome email", async () => {
    sendMailMock.mockResolvedValue({ messageId: "abc123" });

    await mailService.sendWelcomeEmail("test@example.com");

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringMatching(/welcome/i),
      }),
    );
  });

  it("logs error on failure (does not throw)", async () => {
    sendMailMock.mockRejectedValue(new Error("SMTP FAIL"));

    await expect(mailService.sendWelcomeEmail("fail@example.com")).resolves.toBeUndefined();
    expect(sendMailMock).toHaveBeenCalled();
  });
});
