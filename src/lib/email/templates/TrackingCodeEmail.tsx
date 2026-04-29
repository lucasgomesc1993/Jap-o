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

interface TrackingCodeEmailProps {
  customerName: string;
  shipmentId: string;
  trackingCode: string;
  trackingUrl: string;
}

export const TrackingCodeEmail = ({
  customerName,
  shipmentId,
  trackingCode,
  trackingUrl,
}: TrackingCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu pacote foi enviado! Código: {trackingCode}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Seu pacote está a caminho, {customerName}!</Heading>
        <Text style={text}>
          O seu envio **#{shipmentId.slice(0, 8)}** foi postado e já está em trânsito para o Brasil.
        </Text>
        <Section style={section}>
          <Text style={detailText}>
            <strong>Código de Rastreamento:</strong> {trackingCode}
          </Text>
        </Section>
        <Text style={text}>
          Você pode acompanhar o status da entrega clicando no botão abaixo ou utilizando o código diretamente no site da transportadora/Correios.
        </Text>
        <Link href={trackingUrl} style={button}>
          Rastrear Pacote
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
  backgroundColor: '#f8fafc',
  margin: '24px 0',
};

const detailText = {
  color: '#555',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  lineHeight: '24px',
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

export default TrackingCodeEmail;
