
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceWithDetails } from '@/types/invoice';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#0066CC',
    paddingBottom: 10,
  },
  logo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 10,
    color: '#666666',
    fontStyle: 'italic',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billToSection: {
    flex: 1,
    marginRight: 20,
  },
  invoiceInfoSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  customerInfo: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#555555',
  },
  invoiceInfo: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#555555',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 35,
  },
  tableHeaderRow: {
    backgroundColor: '#F5F5F5',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 10,
    color: '#555555',
  },
  totalsSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: '#555555',
  },
  totalValue: {
    fontSize: 11,
    color: '#333333',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    padding: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#E0E0E0',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  notes: {
    fontSize: 10,
    color: '#555555',
    lineHeight: 1.4,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithDetails;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.companyName}>KECC</Text>
            <Text style={styles.companyTagline}>Korea Electronics Company California</Text>
          </View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.billToSection}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.customerInfo}>
              {invoice.customer.name}
              {invoice.customer.email && `\n${invoice.customer.email}`}
              {invoice.customer.phone && `\nPhone: ${invoice.customer.phone}`}
              {invoice.customer.address && `\n${invoice.customer.address}`}
            </Text>
          </View>
          
          <View style={styles.invoiceInfoSection}>
            <Text style={styles.sectionTitle}>Invoice Details:</Text>
            <Text style={styles.invoiceInfo}>
              Invoice #: {invoice.id}
              {'\n'}Date: {formatDate(invoice.date)}
              {'\n'}Due Date: {formatDate(invoice.due_date)}
              {'\n'}Status: {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Product</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Price</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoice.items?.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {item.product?.name || 'Unknown Product'}
                  {item.product?.sku && `\nSKU: ${item.product.sku}`}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                  {item.quantity}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {formatCurrency(item.price)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(invoice.discount)}</Text>
            </View>
          )}
          
          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
            </View>
          )}
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Footer with Notes */}
        {invoice.notes && (
          <View style={styles.footer}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
