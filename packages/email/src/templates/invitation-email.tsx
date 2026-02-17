import { Button, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";

interface InvitationEmailProps {
  inviterName: string;
  inviteLink: string;
}

export const InvitationEmail = ({ inviterName, inviteLink }: InvitationEmailProps) => (
  <EmailLayout preview="You're invited to Cookabl" title="You're invited to Cookabl">
    <Text style={{ color: "#2c2c2c", fontSize: "16px", lineHeight: "24px" }}>
      {inviterName} invited you to join a recipe group in Cookabl.
    </Text>
    <Button
      href={inviteLink}
      style={{
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "12px 16px",
        textDecoration: "none",
      }}
    >
      Accept invitation
    </Button>
    <Text style={{ color: "#2c2c2c", fontSize: "14px", lineHeight: "22px" }}>
      If the button does not work, open this link: {inviteLink}
    </Text>
  </EmailLayout>
);
