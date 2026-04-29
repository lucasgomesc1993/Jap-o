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

interface OrderCreatedEmailProps {
  customerName: string;
  orderId: string;
  productName: string;
  orderUrl: string;
}

export const OrderCreatedEmail = ({
  customerName,
  orderId,
  productName,
  orderUrl,
}: OrderCreatedEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu pedido #{orderId.slice(0, 8)} foi recebido!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Konnichiwa, {customerName}!</Heading>
        <Text style={text}>
          Recebemos o seu pedido de compra para o item **{productName}**.
        </Text>
        <Section style={section}>
          <Text style={detailText}>
            <strong>ID do Pedido:</strong> #{orderId}
          </Text>
          <Text style={detailText}>
            <strong>Produto:</strong> {productName}
          </Text>
        </Section>
        <Text style={text}>
          Nossa equipe irá processar a compra em breve. Você será notificado assim que o item for adquirido.
        </Text>
        <Link href={orderUrl} style={button}>
          Ver Detalhes do Pedido
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
  backgroundColor: '#f9f9f9',
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

export default OrderCreatedEmail;
