import { Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";

interface ConfirmationEmailProps {
  action: string;
}

export const ConfirmationEmail = ({ action }: ConfirmationEmailProps) => (
  <EmailLayout preview="Cookabl confirmation" title="Cookabl confirmation">
    <Text style={{ color: "#2c2c2c", fontSize: "16px", lineHeight: "24px" }}>
      This is a confirmation that the following action was completed in your account: {action}.
    </Text>
  </EmailLayout>
);
