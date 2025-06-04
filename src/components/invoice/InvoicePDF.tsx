
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { InvoiceWithDetails } from '@/types/invoice';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  company: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
    lineHeight: 1.3,
  },
  invoiceInfo: {
    width: 200,
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  customerSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  billTo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  customerDetails: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#ddd',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#ddd',
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#ddd',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 20,
    width: '40%',
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    width: '100%',
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    color: '#666',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },
  notesText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
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
            Kuwait Equipment & Chemical Co.{'\n'}
            OXAB Water Products{'\n'}
            P.O. Box: [Box Number]{'\n'}
            Kuwait{'\n'}
            Tel: [Phone Number]{'\n'}
            Email: [Email Address]
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>Invoice #: {invoice.id}</Text>
          <Text style={styles.invoiceNumber}>Date: {new Date(invoice.date).toLocaleDateString()}</Text>
          <Text style={styles.invoiceNumber}>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.customerSection}>
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.customerDetails}>
            {invoice.customer.name}{'\n'}
            {invoice.customer.code && `Code: ${invoice.customer.code}`}{'\n'}
            {invoice.customer.address && `${invoice.customer.address}`}{'\n'}
            {invoice.customer.phone && `Phone: ${invoice.customer.phone}`}{'\n'}
            {invoice.customer.email && `Email: ${invoice.customer.email}`}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { width: '40%' }]}>
            <Text style={styles.tableCellHeader}>Description</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Qty</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Unit Price</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
        </View>

        {/* Table Rows */}
        {invoice.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>
                {item.product.name}{'\n'}
                <Text style={{ fontSize: 8, color: '#666' }}>
                  SKU: {item.product.sku}
                  {item.product.size && ` | Size: ${item.product.size}`}
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>KD {item.price.toFixed(3)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>KD {item.total.toFixed(3)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>KD {invoice.subtotal.toFixed(3)}</Text>
        </View>
        {invoice.discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>-KD {invoice.discount.toFixed(3)}</Text>
          </View>
        )}
        {invoice.tax > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>KD {invoice.tax.toFixed(3)}</Text>
          </View>
        )}
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>KD {invoice.total.toFixed(3)}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for your business! | KECC - Kuwait Equipment & Chemical Co.
      </Text>
    </Page>
  </Document>
);

export default InvoicePDF;
