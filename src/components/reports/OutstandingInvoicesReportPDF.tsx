
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { OutstandingInvoice } from '@/hooks/useOutstandingInvoices';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  logoSection: {
    marginRight: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  company: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3e87',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#dc2626',
  },
  filterSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  filterText: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  col1: { width: '15%' }, // Invoice ID
  col2: { width: '25%' }, // Customer
  col3: { width: '12%', textAlign: 'center' }, // Due Date
  col4: { width: '12%', textAlign: 'right' }, // Total
  col5: { width: '12%', textAlign: 'right' }, // Outstanding
  col6: { width: '12%', textAlign: 'center' }, // Days Overdue
  col7: { width: '12%', textAlign: 'center' }, // Status
  agingSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  agingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
  },
  agingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  agingItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    margin: 2,
    borderRadius: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
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
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.outstanding_amount, 0);
  const totalInvoices = invoices.length;
  const averageAmount = totalInvoices > 0 ? totalOutstanding / totalInvoices : 0;

  // Calculate aging buckets
  const today = new Date();
  const aging = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    over90: 0
  };

  invoices.forEach(invoice => {
    const daysOverdue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) aging.current += invoice.outstanding_amount;
    else if (daysOverdue <= 30) aging.days30 += invoice.outstanding_amount;
    else if (daysOverdue <= 60) aging.days60 += invoice.outstanding_amount;
    else if (daysOverdue <= 90) aging.days90 += invoice.outstanding_amount;
    else aging.over90 += invoice.outstanding_amount;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image 
              style={styles.logo}
              src="/lovable-uploads/860ea59a-d583-4c99-8338-31717d62cc4c.png"
            />
          </View>
          <View style={styles.company}>
            <Text style={styles.companyName}>KECC</Text>
            <Text style={styles.companyDetails}>
              Kuwaiti European Canadian general trading Company{'\n'}
              Hawally, Tunis St., Kuwait{'\n'}
              Tel: +965 90927328{'\n'}
              Email: mjbara@kecc-trading.com
            </Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>OUTSTANDING INVOICES REPORT</Text>

        {/* Filters Applied */}
        {filters && (
          <View style={styles.filterSection}>
            <Text style={styles.filterText}>Report Generated: {new Date().toLocaleDateString()}</Text>
            {filters.customerName && (
              <Text style={styles.filterText}>Customer Filter: {filters.customerName}</Text>
            )}
            {filters.startDate && (
              <Text style={styles.filterText}>From Date: {filters.startDate.toLocaleDateString()}</Text>
            )}
            {filters.endDate && (
              <Text style={styles.filterText}>To Date: {filters.endDate.toLocaleDateString()}</Text>
            )}
            {filters.minAmount && (
              <Text style={styles.filterText}>Minimum Amount: KWD {filters.minAmount.toFixed(3)}</Text>
            )}
          </View>
        )}

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Outstanding</Text>
              <Text style={styles.summaryValue}>KWD {totalOutstanding.toFixed(3)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invoices</Text>
              <Text style={styles.summaryValue}>{totalInvoices}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average Amount</Text>
              <Text style={styles.summaryValue}>KWD {averageAmount.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        {/* Outstanding Invoices Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Invoice ID</Text>
            <Text style={styles.col2}>Customer</Text>
            <Text style={styles.col3}>Due Date</Text>
            <Text style={styles.col4}>Total</Text>
            <Text style={styles.col5}>Outstanding</Text>
            <Text style={styles.col6}>Days Due</Text>
            <Text style={styles.col7}>Status</Text>
          </View>

          {invoices.map((invoice, index) => {
            const daysOverdue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.col1}>{invoice.invoice_id}</Text>
                <Text style={styles.col2}>{invoice.customer_name}</Text>
                <Text style={styles.col3}>
                  {new Date(invoice.due_date).toLocaleDateString('en-GB')}
                </Text>
                <Text style={styles.col4}>KWD {Number(invoice.total_amount).toFixed(3)}</Text>
                <Text style={[styles.col5, { color: '#dc2626' }]}>
                  KWD {Number(invoice.outstanding_amount).toFixed(3)}
                </Text>
                <Text style={[styles.col6, {
                  color: daysOverdue > 0 ? '#dc2626' : '#059669'
                }]}>
                  {daysOverdue > 0 ? `+${daysOverdue}` : daysOverdue === 0 ? 'Due' : `${Math.abs(daysOverdue)}`}
                </Text>
                <Text style={[styles.col7, {
                  color: invoice.payment_status === 'paid' ? '#059669' : 
                         invoice.payment_status === 'partially_paid' ? '#2563eb' : '#dc2626'
                }]}>
                  {invoice.payment_status === 'paid' ? 'PAID' : 
                   invoice.payment_status === 'partially_paid' ? 'PARTIAL' : 
                   invoice.payment_status === 'overdue' ? 'OVERDUE' : 'PENDING'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Aging Analysis */}
        <View style={styles.agingSection}>
          <Text style={styles.agingTitle}>Outstanding Amount by Age</Text>
          <View style={styles.agingGrid}>
            <View style={styles.agingItem}>
              <Text style={styles.summaryLabel}>Current</Text>
              <Text style={styles.summaryValue}>KWD {aging.current.toFixed(3)}</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={styles.summaryLabel}>1-30 Days</Text>
              <Text style={styles.summaryValue}>KWD {aging.days30.toFixed(3)}</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={styles.summaryLabel}>31-60 Days</Text>
              <Text style={styles.summaryValue}>KWD {aging.days60.toFixed(3)}</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={styles.summaryLabel}>61-90 Days</Text>
              <Text style={styles.summaryValue}>KWD {aging.days90.toFixed(3)}</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={styles.summaryLabel}>90+ Days</Text>
              <Text style={styles.summaryValue}>KWD {aging.over90.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | kecc-trading.com
        </Text>
      </Page>
    </Document>
  );
};
