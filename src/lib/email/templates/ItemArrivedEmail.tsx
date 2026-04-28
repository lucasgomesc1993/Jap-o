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
} from '@react-email/components';
import * as React from 'react';

interface ItemArrivedEmailProps {
  customerName: string;
  productName: string;
  weightGrams: number;
  deadline: string;
}

export const ItemArrivedEmail = ({
  customerName,
  productName,
  weightGrams,
  deadline,
}: ItemArrivedEmailProps) => (
  <Html>
    <Head />
    <Preview>Seu item chegou no armazém da NipponBox!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Konnichiwa, {customerName}!</Heading>
        <Text style={text}>
          Temos boas notícias! Seu produto **{productName}** acabou de ser recebido em nosso armazém no Japão.
        </Text>
        <Section style={section}>
          <Text style={detailText}>
            <strong>Peso registrado:</strong> {weightGrams}g
          </Text>
          <Text style={detailText}>
            <strong>Prazo de armazenamento grátis:</strong> {deadline}
          </Text>
        </Section>
        <Text style={text}>
          Você já pode visualizar as fotos do produto e solicitar serviços extras ou o envio para o Brasil através do seu painel.
        </Text>
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

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};

export default ItemArrivedEmail;
