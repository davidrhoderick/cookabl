import { Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <EmailLayout preview="Welcome to Cookabl" title="Welcome to Cookabl">
    <Text style={{ color: "#2c2c2c", fontSize: "16px", lineHeight: "24px" }}>Hi {name},</Text>
    <Text style={{ color: "#2c2c2c", fontSize: "16px", lineHeight: "24px" }}>
      Your account is ready. Start creating family recipes, add them to your household groups, and
      share links with exactly the access you choose.
    </Text>
  </EmailLayout>
);
