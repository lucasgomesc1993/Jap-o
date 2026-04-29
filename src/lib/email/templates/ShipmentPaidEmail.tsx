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

interface ShipmentPaidEmailProps {
  customerName: string;
  shipmentId: string;
  trackingMethod: string;
  itemsCount: number;
}

export const ShipmentPaidEmail = ({
  customerName,
  shipmentId,
  trackingMethod,
  itemsCount,
}: ShipmentPaidEmailProps) => (
  <Html>
    <Head />
    <Preview>Pagamento confirmado! Seu envio #{shipmentId.slice(0, 8)} está sendo preparado.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Konnichiwa, {customerName}!</Heading>
        <Text style={text}>
          Confirmamos o pagamento do seu envio. Nossa equipe já está preparando a embalagem para despacho.
        </Text>
        <Section style={section}>
          <Text style={detailText}>
            <strong>ID do Envio:</strong> #{shipmentId}
          </Text>
          <Text style={detailText}>
            <strong>Método de Envio:</strong> {trackingMethod}
          </Text>
          <Text style={detailText}>
            <strong>Quantidade de Itens:</strong> {itemsCount}
          </Text>
        </Section>
        <Text style={text}>
          Assim que o pacote for postado, você receberá um e-mail com o código de rastreamento para acompanhar a entrega até o Brasil.
        </Text>
        <Link href={`https://nipponbox.com.br/dashboard/envios/${shipmentId}`} style={button}>
          Ver Detalhes do Envio
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
  backgroundColor: '#f0f9ff',
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

export default ShipmentPaidEmail;
