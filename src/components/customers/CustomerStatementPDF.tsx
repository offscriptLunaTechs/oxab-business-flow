
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

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
  statementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
  },
  customerInfo: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 5,
  },
  periodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
  },
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    color: '#374151',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
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
  col1: { width: '12%' }, // Date
  col2: { width: '15%' }, // Invoice #
  col3: { width: '12%', textAlign: 'right' }, // Total
  col4: { width: '12%', textAlign: 'right' }, // Paid
  col5: { width: '12%', textAlign: 'right' }, // Outstanding
  col6: { width: '15%', textAlign: 'center' }, // Status
  col7: { width: '12%', textAlign: 'center' }, // Due Date
  col8: { width: '10%', textAlign: 'right' }, // Days Overdue
  totalOutstanding: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'right',
    marginTop: 10,
  },
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
});

interface CustomerStatementPDFProps {
  customer: any;
  invoices: any[];
  startDate?: Date;
  endDate?: Date;
  totalOutstanding: number;
  openingBalance: number;
}

const CustomerStatementPDF: React.FC<CustomerStatementPDFProps> = ({
  customer,
  invoices,
  startDate,
  endDate,
  totalOutstanding,
  openingBalance
}) => {
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
    if (invoice.outstanding_amount > 0) {
      const daysOverdue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue <= 0) aging.current += invoice.outstanding_amount;
      else if (daysOverdue <= 30) aging.days30 += invoice.outstanding_amount;
      else if (daysOverdue <= 60) aging.days60 += invoice.outstanding_amount;
      else if (daysOverdue <= 90) aging.days90 += invoice.outstanding_amount;
      else aging.over90 += invoice.outstanding_amount;
    }
  });

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.allocated_amount || 0), 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.companyName}>KECC</Text>
            <Text>Kuwaiti European Canadian general trading Company</Text>
            <Text>Hawally, Tunis St., Kuwait</Text>
            <Text>Tel: +965 90927328</Text>
          </View>
        </View>

        <Text style={styles.statementTitle}>CUSTOMER STATEMENT</Text>

        {/* Customer Information */}
        <View style={styles.customerInfo}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
            Customer: {customer.name} ({customer.code})
          </Text>
          {customer.address && <Text>Address: {customer.address}</Text>}
          {customer.phone && <Text>Phone: {customer.phone}</Text>}
          {customer.email && <Text>Email: {customer.email}</Text>}
        </View>

        {/* Period Information */}
        <View style={styles.periodInfo}>
          <Text>
            Period: {startDate ? format(startDate, 'dd/MM/yyyy') : 'All time'} - {endDate ? format(endDate, 'dd/MM/yyyy') : 'Current'}
          </Text>
          <Text>Statement Date: {format(new Date(), 'dd/MM/yyyy')}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invoiced</Text>
              <Text style={styles.summaryValue}>KWD {totalInvoiced.toFixed(3)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryValue, { color: '#059669' }]}>KWD {totalPaid.toFixed(3)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Outstanding</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>KWD {totalOutstanding.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        {/* Transactions Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Date</Text>
            <Text style={styles.col2}>Invoice #</Text>
            <Text style={styles.col3}>Total</Text>
            <Text style={styles.col4}>Paid</Text>
            <Text style={styles.col5}>Outstanding</Text>
            <Text style={styles.col6}>Status</Text>
            <Text style={styles.col7}>Due Date</Text>
            <Text style={styles.col8}>Days Due</Text>
          </View>

          {invoices.map((invoice, index) => {
            const daysOverdue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.col1}>
                  {format(new Date(invoice.date), 'dd/MM/yyyy')}
                </Text>
                <Text style={styles.col2}>{invoice.id}</Text>
                <Text style={styles.col3}>KWD {Number(invoice.total).toFixed(3)}</Text>
                <Text style={styles.col4}>KWD {Number(invoice.allocated_amount || 0).toFixed(3)}</Text>
                <Text style={[styles.col5, {
                  color: invoice.outstanding_amount > 0 ? '#dc2626' : '#059669'
                }]}>
                  KWD {Number(invoice.outstanding_amount || 0).toFixed(3)}
                </Text>
                <Text style={[styles.col6, {
                  color: invoice.payment_status === 'paid' ? '#059669' : 
                         invoice.payment_status === 'partially_paid' ? '#2563eb' : '#dc2626'
                }]}>
                  {invoice.payment_status === 'paid' ? 'PAID' : 
                   invoice.payment_status === 'partially_paid' ? 'PARTIAL' : 
                   invoice.payment_status === 'overdue' ? 'OVERDUE' : 'PENDING'}
                </Text>
                <Text style={styles.col7}>
                  {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                </Text>
                <Text style={[styles.col8, {
                  color: daysOverdue > 0 ? '#dc2626' : '#059669'
                }]}>
                  {daysOverdue > 0 ? `+${daysOverdue}` : daysOverdue === 0 ? 'Due' : `${Math.abs(daysOverdue)}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Aging Analysis */}
        <View style={styles.agingSection}>
          <Text style={styles.agingTitle}>Aging Analysis</Text>
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
        <Text style={{
          position: 'absolute',
          bottom: 30,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontSize: 8,
          color: '#666'
        }}>
          Statement generated on {format(new Date(), 'dd/MM/yyyy HH:mm')} | kecc-trading.com
        </Text>
      </Page>
    </Document>
  );
};

export default CustomerStatementPDF;
