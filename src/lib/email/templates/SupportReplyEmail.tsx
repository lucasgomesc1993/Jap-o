import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface SupportReplyEmailProps {
  customerName: string;
  ticketId: string;
  ticketSubject: string;
  messagePreview: string;
  ticketUrl: string;
}

export const SupportReplyEmail = ({
  customerName,
  ticketId,
  ticketSubject,
  messagePreview,
  ticketUrl,
}: SupportReplyEmailProps) => (
  <Html>
    <Head />
    <Preview>Nova resposta no seu chamado: {ticketSubject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Olá, {customerName}!</Heading>
        <Text style={text}>
          Você recebeu uma nova resposta da nossa equipe de suporte no chamado **#{ticketId.slice(0, 8)} - {ticketSubject}**.
        </Text>
        <Section style={section}>
          <Text style={previewLabel}>Prévia da mensagem:</Text>
          <Text style={previewText}>"{messagePreview}..."</Text>
        </Section>
        <Text style={text}>
          Para visualizar a resposta completa e continuar a conversa, acesse o painel de suporte.
        </Text>
        <Link href={ticketUrl} style={button}>
          Ver Chamado de Suporte
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          NipponBox — Sempre aqui para ajudar.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const h1 = {
  color: '#BC002D',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const section = {
  padding: '24px',
  border: '1px solid #eee',
  borderRadius: '8px',
  backgroundColor: '#f9fafb',
  margin: '24px 0',
};

const previewLabel = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const previewText = {
  color: '#4b5563',
  fontSize: '15px',
  fontStyle: 'italic',
  lineHeight: '22px',
  margin: '0',
};

const button = {
  backgroundColor: '#BC002D',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '220px',
  margin: '24px auto',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};

export default SupportReplyEmail;
