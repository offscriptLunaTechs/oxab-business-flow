
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceWithDetails } from '@/types/invoice';

// Create styles matching KECC format
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.4,
    flexDirection: 'column',
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
    letterSpacing: 1,
  },
  companyDetails: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    width: 180,
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 11,
    marginBottom: 4,
    color: '#374151',
  },
  customerSection: {
    marginBottom: 25,
  },
  billToTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  customerDetails: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
  },
  table: {
    width: 'auto',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 8,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  itemCol: {
    width: '40%',
    paddingRight: 10,
  },
  descCol: {
    width: '25%',
    paddingRight: 10,
  },
  qtyCol: {
    width: '10%',
    textAlign: 'center',
    paddingRight: 10,
  },
  priceCol: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 10,
  },
  amountCol: {
    width: '15%',
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellText: {
    fontSize: 9,
    color: '#374151',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 20,
    width: '50%',
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    width: '100%',
  },
  totalLabel: {
    fontSize: 10,
    color: '#374151',
  },
  totalValue: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'right',
    minWidth: 80,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#374151',
    marginTop: 8,
    width: '100%',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right',
    minWidth: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  thankYouMessage: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    fontSize: 11,
    color: '#2d3e87',
    fontWeight: 'bold',
  },
  websiteText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 10,
    color: '#2d3e87',
    textDecoration: 'underline',
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithDetails;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.company}>
          <Text style={styles.companyName}>KECC</Text>
          <Text style={styles.companyDetails}>
            Kuwaiti European Canadian general trading Company{'\n'}
            Hawally, Tunis St., Kuwait{'\n'}
            Tel: +965 90927328{'\n'}
            Email: mjbara@kecc-trading.com
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>Invoice # No. {invoice.id}</Text>
          <Text style={styles.invoiceNumber}>Date: {new Date(invoice.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</Text>
          <Text style={styles.invoiceNumber}>Due Date: {new Date(invoice.due_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.customerSection}>
        <Text style={styles.billToTitle}>Bill To:</Text>
        <Text style={styles.customerDetails}>
          {invoice.customer.name} ({invoice.customer.code}){'\n'}
          {invoice.customer.address && `${invoice.customer.address}\n`}
          {invoice.customer.phone && `Phone: ${invoice.customer.phone}\n`}
          {invoice.customer.email && `Email: ${invoice.customer.email}`}
        </Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.itemCol}>
            <Text style={styles.tableHeaderText}>Item</Text>
          </View>
          <View style={styles.descCol}>
            <Text style={styles.tableHeaderText}>Description</Text>
          </View>
          <View style={styles.qtyCol}>
            <Text style={styles.tableHeaderText}>Qty</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.tableHeaderText}>Unit Price</Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </View>
        </View>

        {/* Table Rows */}
        {invoice.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.itemCol}>
              <Text style={styles.tableCellText}>{item.product.name}</Text>
            </View>
            <View style={styles.descCol}>
              <Text style={styles.tableCellText}>
                {item.product.size} - {item.product.sku}
              </Text>
            </View>
            <View style={styles.qtyCol}>
              <Text style={styles.tableCellText}>{item.quantity}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.tableCellText}>KWD {Number(item.price).toFixed(3)}</Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={styles.tableCellText}>KWD {Number(item.total).toFixed(3)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>KWD {Number(invoice.subtotal).toFixed(2)}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>KWD {Number(invoice.total).toFixed(2)}</Text>
        </View>
      </View>

      {/* Thank You Message */}
      <Text style={styles.thankYouMessage}>
        Thank you for your business with KECC!
      </Text>
      <Text style={styles.websiteText}>
        kecc-trading.com
      </Text>

      {/* Footer */}
      <Text style={styles.footer}>
        This invoice was generated electronically and is valid without signature.
      </Text>
    </Page>
  </Document>
);

export default InvoicePDF;
