'use client';

import { jsPDF } from 'jspdf';
import styles from './ExportButtons.module.css';
import { Download } from 'lucide-react';

interface ExportProps {
  data: any;
  filter: any;
}

export function ExportButtons({ data, filter }: ExportProps) {
  const exportCSV = () => {
    const rows = [
      ['Categoria', 'Valor (BRL)'],
      ['Receita: Taxas de Serviço', data.revenue.serviceFees],
      ['Receita: Margem de Frete', data.revenue.freightMargin],
      ['Receita: Serviços Extras', data.revenue.extraServices],
      ['Receita: Armazenamento', data.revenue.storageFees],
      ['Total Receita', data.revenue.total],
      [''],
      ['Custo: Compras Reais', data.costs.realPurchases],
      ['Custo: Fretes Reais', data.costs.realFreight],
      ['Custo: Operacional', data.costs.operational],
      ['Total Custos', data.costs.total],
      [''],
      ['Lucro Líquido', data.netProfit],
    ];

    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = 'Relatorio Financeiro - NipponBox';
    const dateRange = `Periodo: ${filter.dateFrom ? filter.dateFrom.toLocaleDateString() : 'Inicio'} ate ${filter.dateTo ? filter.dateTo.toLocaleDateString() : 'Hoje'}`;

    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(12);
    doc.text(dateRange, 20, 30);

    doc.setFontSize(16);
    doc.text('Resumo de Receitas', 20, 50);
    doc.setFontSize(12);
    doc.text(`Taxas de Servico: R$ ${data.revenue.serviceFees.toFixed(2)}`, 20, 60);
    doc.text(`Margem de Frete: R$ ${data.revenue.freightMargin.toFixed(2)}`, 20, 70);
    doc.text(`Servicos Extras: R$ ${data.revenue.extraServices.toFixed(2)}`, 20, 80);
    doc.text(`Armazenamento: R$ ${data.revenue.storageFees.toFixed(2)}`, 20, 90);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Receita: R$ ${data.revenue.total.toFixed(2)}`, 20, 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('Resumo de Custos', 20, 120);
    doc.setFontSize(12);
    doc.text(`Compras Reais: R$ ${data.costs.realPurchases.toFixed(2)}`, 20, 130);
    doc.text(`Fretes Reais: R$ ${data.costs.realFreight.toFixed(2)}`, 20, 140);
    doc.text(`Operacional: R$ ${data.costs.operational.toFixed(2)}`, 20, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Custos: R$ ${data.costs.total.toFixed(2)}`, 20, 160);

    doc.setFontSize(18);
    const profitColor = data.netProfit >= 0 ? [0, 128, 0] : [255, 0, 0];
    doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
    doc.text(`Lucro Liquido: R$ ${data.netProfit.toFixed(2)}`, 20, 180);

    doc.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className={styles.container}>
      <button onClick={exportCSV} className={styles.button}>
        <Download size={16} /> CSV
      </button>
      <button onClick={exportPDF} className={styles.button}>
        <Download size={16} /> PDF
      </button>
    </div>
  );
}
