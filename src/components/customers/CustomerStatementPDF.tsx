
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
  col1: { width: '15%' }, // Date
  col2: { width: '20%' }, // Invoice #
  col3: { width: '15%', textAlign: 'right' }, // Amount
  col4: { width: '15%', textAlign: 'center' }, // Status
  col5: { width: '20%', textAlign: 'right' }, // Balance
  col6: { width: '15%', textAlign: 'center' }, // Due Date
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  totalOutstanding: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'right',
    marginTop: 10,
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
}) => (
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
        <Text>Opening Balance: KWD {openingBalance.toFixed(3)}</Text>
      </View>

      {/* Transactions Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Date</Text>
          <Text style={styles.col2}>Invoice #</Text>
          <Text style={styles.col3}>Amount</Text>
          <Text style={styles.col4}>Status</Text>
          <Text style={styles.col5}>Running Balance</Text>
          <Text style={styles.col6}>Due Date</Text>
        </View>

        {invoices.map((invoice, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.col1}>
              {format(new Date(invoice.date), 'dd/MM/yyyy')}
            </Text>
            <Text style={styles.col2}>{invoice.id}</Text>
            <Text style={styles.col3}>KWD {Number(invoice.total).toFixed(3)}</Text>
            <Text style={[styles.col4, { 
              color: invoice.status === 'paid' ? '#059669' : '#dc2626' 
            }]}>
              {invoice.status.toUpperCase()}
            </Text>
            <Text style={[styles.col5, {
              color: invoice.runningBalance > 0 ? '#dc2626' : '#059669'
            }]}>
              KWD {Number(invoice.runningBalance).toFixed(3)}
            </Text>
            <Text style={styles.col6}>
              {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.totalOutstanding}>
          Total Outstanding: KWD {totalOutstanding.toFixed(3)}
        </Text>
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

export default CustomerStatementPDF;
