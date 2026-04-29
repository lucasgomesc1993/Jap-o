import * as React from 'react';

interface StorageFeeEmailProps {
  userName: string;
  itemName: string;
  feeAmount: string;
  daysExceeded: number;
}

export const StorageFeeEmail: React.FC<StorageFeeEmailProps> = ({
  userName,
  itemName,
  feeAmount,
  daysExceeded,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
    <h1>Cobrança de Armazenamento - NipponBox</h1>
    <p>Olá, {userName},</p>
    <p>Informamos que o item <strong>{itemName}</strong> excedeu o prazo de armazenamento gratuito.</p>
    <p>
      O prazo foi excedido em {daysExceeded} {daysExceeded === 1 ? 'dia' : 'dias'}.
      Uma taxa de <strong>{feeAmount}</strong> foi debitada (ou registrada como pendente) em sua carteira.
    </p>
    <p>Para evitar novas cobranças diárias, por favor, solicite o envio do seu item o quanto antes.</p>
    <hr />
    <p style={{ fontSize: '12px', color: '#666' }}>
      Este é um e-mail automático. Em caso de dúvidas, entre em contato com o suporte.
    </p>
  </div>
);

export default StorageFeeEmail;
