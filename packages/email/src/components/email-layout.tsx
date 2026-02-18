import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import { PropsWithChildren } from "react";

interface EmailLayoutProps extends PropsWithChildren {
  preview: string;
  title: string;
}

const styles = {
  body: {
    margin: "0 auto",
    backgroundColor: "#f4f4f4",
    fontFamily: "Helvetica, Arial, sans-serif",
  },
  container: {
    margin: "24px auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "560px",
  },
  title: {
    color: "#1a1a1a",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 16px",
  },
  footer: {
    color: "#5c5c5c",
    fontSize: "12px",
    marginTop: "24px",
  },
} as const;

export const EmailLayout = ({ children, preview, title }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Section>
          <Text style={styles.title}>{title}</Text>
          {children}
          <Text style={styles.footer}>
            Sent by Cookabl. If this was unexpected, you can ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
