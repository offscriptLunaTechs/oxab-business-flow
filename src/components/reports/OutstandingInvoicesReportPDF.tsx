
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { OutstandingInvoice, useCustomerSummaries } from '@/hooks/useOutstandingInvoices';

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
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: 'bold',
  },
  companyInfo: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 9,
  },
  reportTitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: 'bold',
  },
  summarySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
  },
  summaryTable: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  summaryTableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  summaryTableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  summaryTableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryTableCell: {
    fontSize: 9,
    color: '#1f2937',
  },
  detailsTable: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 15,
  },
  detailsTableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  detailsTableColHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  detailsTableCol: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 5,
  },
  detailsTableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  detailsTableCell: {
    fontSize: 8,
    color: '#1f2937',
  },
  customerGroupHeader: {
    backgroundColor: '#f9fafb',
    padding: 8,
    marginTop: 10,
    marginBottom: 5,
  },
  customerGroupTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totals: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalItem: {
    marginLeft: 20,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 12,
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
  const customerSummaries = useCustomerSummaries(invoices);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
  const formatCurrency = (amount: number) => `KWD ${amount.toFixed(3)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.companyInfo}>
          <Text style={styles.header}>KECC Business System</Text>
          <Text>Kuwait Engineering Contracting Company</Text>
          <Text>Tel: +965 XXXX XXXX | Email: info@kecc.com.kw</Text>
        </View>

        <Text style={styles.reportTitle}>Outstanding Invoices Report</Text>

        {/* Report Info */}
        <View style={styles.reportInfo}>
          <Text>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
          {filters?.customerName && <Text>Customer: {filters.customerName}</Text>}
          {filters?.startDate && <Text>Period: {format(filters.startDate, 'dd/MM/yyyy')} - {format(filters.endDate || new Date(), 'dd/MM/yyyy')}</Text>}
          {filters?.minAmount && <Text>Minimum Amount: {formatCurrency(filters.minAmount)}</Text>}
        </View>

        {/* Customer Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Customer Summary</Text>
          <View style={styles.summaryTable}>
            {/* Summary Table Header */}
            <View style={styles.summaryTableRow}>
              <View style={styles.summaryTableColHeader}>
                <Text style={styles.summaryTableCellHeader}>Customer Code</Text>
              </View>
              <View style={styles.summaryTableColHeader}>
                <Text style={styles.summaryTableCellHeader}>Customer Name</Text>
              </View>
              <View style={styles.summaryTableColHeader}>
                <Text style={styles.summaryTableCellHeader}>Invoice Count</Text>
              </View>
              <View style={styles.summaryTableColHeader}>
                <Text style={styles.summaryTableCellHeader}>Total Outstanding</Text>
              </View>
            </View>

            {/* Summary Table Rows */}
            {customerSummaries.slice(0, 15).map((customer) => (
              <View key={customer.customer_id} style={styles.summaryTableRow}>
                <View style={styles.summaryTableCol}>
                  <Text style={styles.summaryTableCell}>{customer.customer_code}</Text>
                </View>
                <View style={styles.summaryTableCol}>
                  <Text style={styles.summaryTableCell}>{customer.customer_name}</Text>
                </View>
                <View style={styles.summaryTableCol}>
                  <Text style={styles.summaryTableCell}>{customer.invoice_count}</Text>
                </View>
                <View style={styles.summaryTableCol}>
                  <Text style={styles.summaryTableCell}>{formatCurrency(customer.total_outstanding)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Invoice Details Section */}
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        
        <View style={styles.detailsTable}>
          {/* Details Table Header */}
          <View style={styles.detailsTableRow}>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Invoice ID</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Customer</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Date</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Due Date</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Total</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Paid</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Outstanding</Text>
            </View>
            <View style={styles.detailsTableColHeader}>
              <Text style={styles.detailsTableCellHeader}>Days Overdue</Text>
            </View>
          </View>

          {/* Details Table Rows - grouped by customer */}
          {customerSummaries.slice(0, 8).map((customer) => (
            <React.Fragment key={customer.customer_id}>
              <View style={styles.customerGroupHeader}>
                <Text style={styles.customerGroupTitle}>
                  {customer.customer_name} ({customer.customer_code}) - {formatCurrency(customer.total_outstanding)}
                </Text>
              </View>
              {customer.invoices.slice(0, 5).map((invoice) => (
                <View key={invoice.invoice_id} style={styles.detailsTableRow}>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{invoice.invoice_id}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{invoice.customer_code}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{format(new Date(invoice.invoice_date), 'dd/MM')}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{format(new Date(invoice.due_date), 'dd/MM')}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{formatCurrency(invoice.total_amount)}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{formatCurrency(invoice.paid_amount)}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{formatCurrency(invoice.outstanding_amount)}</Text>
                  </View>
                  <View style={styles.detailsTableCol}>
                    <Text style={styles.detailsTableCell}>{invoice.days_overdue}</Text>
                  </View>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Outstanding:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalOutstanding)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Invoices:</Text>
            <Text style={styles.totalValue}>{invoices.length}</Text>
          </View>
        </View>

        {invoices.length > 40 && (
          <Text style={[styles.reportInfo, { marginTop: 10 }]}>
            Report shows first 40 invoices. Total outstanding: {formatCurrency(totalOutstanding)}
          </Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          KECC Business System - Outstanding Invoices Report - {format(new Date(), 'dd/MM/yyyy')}
        </Text>
      </Page>
    </Document>
  );
};
