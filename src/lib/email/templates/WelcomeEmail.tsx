import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userFirstname: string;
}

export const WelcomeEmail = ({ userFirstname }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo à NipponBox!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Konnichiwa, {userFirstname}!</Heading>
        <Text style={text}>
          Seu cadastro na NipponBox foi realizado com sucesso. Agora você tem acesso ao seu endereço no Japão para começar suas compras.
        </Text>
        <Section style={section}>
          <Text style={text}>
            Para começar, acesse seu dashboard e veja como enviar seus primeiros produtos para o nosso armazém.
          </Text>
        </Section>
        <Link href="https://nipponbox.com.br/dashboard" style={button}>
          Acessar Dashboard
        </Link>
        <Text style={footer}>
          © {new Date().getFullYear()} NipponBox. Todos os direitos reservados.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const h1 = {
  color: '#BC002D',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.1',
  margin: '0 0 15px',
  textAlign: 'center' as const,
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 20px',
};

const section = {
  padding: '24px',
  border: '1px solid #eee',
  borderRadius: '8px',
  margin: '0 0 20px',
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
  width: '200px',
  margin: '0 auto',
  padding: '12px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px',
  textAlign: 'center' as const,
};
