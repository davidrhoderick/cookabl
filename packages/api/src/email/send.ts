import { renderInvitationEmail, renderWelcomeEmail } from "@cookabl/email";
import { Resend } from "resend";

const EMAIL_FROM = "Cookabl <no-reply@cookabl.app>";

const createClient = (apiKey?: string): Resend | null => {
  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
};

export const sendWelcomeEmail = async (
  apiKey: string | undefined,
  to: string,
  name: string,
): Promise<void> => {
  const client = createClient(apiKey);
  if (!client) {
    return;
  }

  await client.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Welcome to Cookabl",
    html: await renderWelcomeEmail({ name }),
  });
};

export const sendInvitationEmail = async (
  apiKey: string | undefined,
  to: string,
  inviterName: string,
  inviteLink: string,
): Promise<void> => {
  const client = createClient(apiKey);
  if (!client) {
    return;
  }

  await client.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "You were invited to Cookabl",
    html: await renderInvitationEmail({ inviterName, inviteLink }),
  });
};
