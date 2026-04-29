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

interface StorageWarningEmailProps {
  customerName: string;
  productName: string;
  daysRemaining: number;
}

export const StorageWarningEmail = ({
  customerName,
  productName,
  daysRemaining,
}: StorageWarningEmailProps) => (
  <Html>
    <Head />
    <Preview>Alerta: Seu prazo de armazenamento grátis está acabando!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Konnichiwa, {customerName}!</Heading>
        <Text style={text}>
          Gostaríamos de lembrar que o prazo de armazenamento gratuito do seu item **{productName}** está próximo do fim.
        </Text>
        <Section style={section}>
          <Text style={detailText}>
            <strong>Produto:</strong> {productName}
          </Text>
          <Text style={detailText}>
            <strong>Prazo restante:</strong> {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
          </Text>
        </Section>
        <Text style={text}>
          Após o término deste prazo, uma taxa diária de armazenamento será aplicada. Recomendamos que você solicite o envio para o Brasil o quanto antes para evitar cobranças extras.
        </Text>
        <Link href="https://nipponbox.com.br/dashboard/armazem" style={button}>
          Solicitar Envio Agora
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          NipponBox — Seu link direto com o Japão.
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
  backgroundColor: '#fffbeb',
  margin: '24px 0',
};

const detailText = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
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

export default StorageWarningEmail;
