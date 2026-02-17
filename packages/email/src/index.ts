import { render } from "@react-email/render";
import { createElement } from "react";
import { ConfirmationEmail } from "./templates/confirmation-email";
import { InvitationEmail } from "./templates/invitation-email";
import { WelcomeEmail } from "./templates/welcome-email";

export const renderWelcomeEmail = async (props: { name: string }): Promise<string> => {
  return await render(createElement(WelcomeEmail, props));
};

export const renderInvitationEmail = (props: {
  inviterName: string;
  inviteLink: string;
}): Promise<string> => {
  return render(createElement(InvitationEmail, props));
};

export const renderConfirmationEmail = (props: { action: string }): Promise<string> => {
  return render(createElement(ConfirmationEmail, props));
};
