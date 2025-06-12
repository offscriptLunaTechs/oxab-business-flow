
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { OutstandingInvoice } from '@/hooks/useOutstandingInvoices';

// Register fonts for better typography
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Open Sans',
    fontSize: 10,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 65,
    lineHeight: 1.5,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: 'bold',
  },
  companyInfo: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#6b7280',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 5,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  tableCol: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 8,
    color: '#1f2937',
  },
  aging: {
    marginTop: 20,
  },
  agingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  agingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: '#f9fafb',
    marginBottom: 2,
  },
  agingLabel: {
    fontSize: 9,
    color: '#374151',
  },
  agingAmount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#6b7280',
  },
  reportInfo: {
    marginBottom: 15,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
});

interface OutstandingInvoicesReportPDFProps {
  invoices: OutstandingInvoice[];
  filters?: {
    customerName?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
  };
}

export const OutstandingInvoicesReportPDF: React.FC<OutstandingInvoicesReportPDFProps> = ({
  invoices,
  filters
}) => {
  // Calculate summary statistics
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
  const totalInvoices = invoices.length;
  const overdueInvoices = invoices.filter(inv => inv.days_overdue > 0).length;
  
  // Calculate aging buckets
  const agingBuckets = {
    'Current': invoices.filter(inv => inv.aging_bucket === 'Current').reduce((sum, inv) => sum + inv.outstanding_amount, 0),
    '1-30 Days': invoices.filter(inv => inv.aging_bucket === '1-30 Days').reduce((sum, inv) => sum + inv.outstanding_amount, 0),
    '31-60 Days': invoices.filter(inv => inv.aging_bucket === '31-60 Days').reduce((sum, inv) => sum + inv.outstanding_amount, 0),
    '61-90 Days': invoices.filter(inv => inv.aging_bucket === '61-90 Days').reduce((sum, inv) => sum + inv.outstanding_amount, 0),
    '90+ Days': invoices.filter(inv => inv.aging_bucket === '90+ Days').reduce((sum, inv) => sum + inv.outstanding_amount, 0),
  };

  const formatCurrency = (amount: number) => `KWD ${amount.toFixed(3)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.companyInfo}>
          <Text style={styles.header}>KECC Business System</Text>
          <Text>Outstanding Invoices Report</Text>
        </View>

        {/* Report Info */}
        <View style={styles.reportInfo}>
          <Text>Generated on: {format(new Date(), 'MMM dd, yyyy HH:mm')}</Text>
          {filters?.customerName && <Text>Customer: {filters.customerName}</Text>}
          {filters?.startDate && <Text>Period: {format(filters.startDate, 'MMM dd, yyyy')} - {format(filters.endDate || new Date(), 'MMM dd, yyyy')}</Text>}
          {filters?.minAmount && <Text>Minimum Amount: {formatCurrency(filters.minAmount)}</Text>}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Outstanding</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalOutstanding)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Invoices</Text>
            <Text style={styles.summaryValue}>{totalInvoices}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overdue Invoices</Text>
            <Text style={styles.summaryValue}>{overdueInvoices}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalInvoices > 0 ? totalOutstanding / totalInvoices : 0)}</Text>
          </View>
        </View>

        {/* Aging Analysis */}
        <View style={styles.aging}>
          <Text style={styles.agingTitle}>Aging Analysis</Text>
          {Object.entries(agingBuckets).map(([bucket, amount]) => (
            <View key={bucket} style={styles.agingRow}>
              <Text style={styles.agingLabel}>{bucket}</Text>
              <Text style={styles.agingAmount}>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>

        {/* Invoice Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Invoice ID</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Customer</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Due Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Paid</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Outstanding</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Days Overdue</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoices.slice(0, 25).map((invoice) => (
            <View key={invoice.invoice_id} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{invoice.invoice_id}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{invoice.customer_name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{format(new Date(invoice.invoice_date), 'MMM dd')}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{format(new Date(invoice.due_date), 'MMM dd')}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(invoice.total_amount)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(invoice.paid_amount)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{formatCurrency(invoice.outstanding_amount)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{invoice.days_overdue}</Text>
              </View>
            </View>
          ))}
        </View>

        {invoices.length > 25 && (
          <Text style={[styles.reportInfo, { marginTop: 10 }]}>
            Showing first 25 of {invoices.length} invoices. For complete data, use filters to narrow results.
          </Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          KECC Business System - Outstanding Invoices Report - Page 1
        </Text>
      </Page>
    </Document>
  );
};
