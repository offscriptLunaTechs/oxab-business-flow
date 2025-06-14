import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceWithDetails } from '@/types/invoice';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica', // This name should match the family registered in pdfUtils
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.3,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'right',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontSize: 10,
  },
  billToSection: {
    flex: 1,
    marginRight: 20,
  },
  invoiceInfoSection: {
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  customerInfo: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  invoiceInfo: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeaderRow: {
    backgroundColor: '#F5F5F5',
  },
  tableCol: { // Base style for data cells - NO default right border
    padding: 5,
    fontSize: 9,
  },
  tableColHeader: { // Base style for header cells - NO default right border
    padding: 5,
  },
  colDescription: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    borderRightStyle: 'solid',
  },
  colQuantity: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    borderRightStyle: 'solid',
  },
  colPrice: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    borderRightStyle: 'solid',
  },
  colTotal: { // Last column - no right border defined here
    width: '25%',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'left',
  },
  textAlignCenter: { textAlign: 'center' },
  textAlignRight: { textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsTable: {
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#E0E0E0',
    padding: 8,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  notesTitle: { // Added for consistency if used in footer
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  notes: { // Added for consistency if used in footer
    fontSize: 8,
  }
});

interface InvoicePDFProps {
  invoice: InvoiceWithDetails;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatCurrency = (amount: number | null | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Consider making this dynamic if needed
    }).format(amount);
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          {/* ... keep existing code (header content) ... */}
          <View style={styles.logoContainer}>
            <Text style={styles.companyName}>KECC</Text>
            <Text style={styles.companyDetails}>Kuwaiti European Canadian general trading Company</Text>
            <Text style={styles.companyDetails}>Hawally, Tunis St., Kuwait</Text>
            <Text style={styles.companyDetails}>Tel: +965 90927328</Text>
            <Text style={styles.companyDetails}>Email: mjbara@kecc-trading.com</Text>
          </View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          {/* ... keep existing code (billToSection and invoiceInfoSection content) ... */}
          <View style={styles.billToSection}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.customerInfo}>
              {invoice.customer?.name || 'N/A'}
              {invoice.customer?.email ? `\n${invoice.customer.email}` : ''}
              {invoice.customer?.phone ? `\nPhone: ${invoice.customer.phone}` : ''}
              {invoice.customer?.address ? `\n${invoice.customer.address}` : ''}
            </Text>
          </View>
          <View style={styles.invoiceInfoSection}>
            <Text style={styles.sectionTitle}>Invoice Details:</Text>
            <Text style={styles.invoiceInfo}>
              Invoice #: {invoice.id || 'N/A'}
              {'\n'}Date: {formatDate(invoice.date)}
              {'\n'}Due Date: {formatDate(invoice.due_date)}
              {invoice.status && <Text>{"\n"}Status: {invoice.status.toUpperCase()}</Text>}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableColHeader, styles.colDescription]}>
              <Text style={styles.tableCellHeader}>Product</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colQuantity]}>
              <Text style={[styles.tableCellHeader, styles.textAlignRight]}>Quantity</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colPrice]}>
              <Text style={[styles.tableCellHeader, styles.textAlignRight]}>Price</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colTotal]}> 
              <Text style={[styles.tableCellHeader, styles.textAlignRight]}>Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoice.items?.map((item, index) => (
            <View style={styles.tableRow} key={item.id || index}>
              <View style={[styles.tableCol, styles.colDescription]}>
                <Text style={styles.tableCell}>
                  {item.product?.name || 'N/A'}
                  {item.product?.sku && <Text style={{ fontSize: 8, color: '#666666' }}>{`\nSKU: ${item.product.sku}`}</Text>}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colQuantity]}>
                <Text style={[styles.tableCell, styles.textAlignRight]}>
                  {item.quantity}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colPrice]}>
                <Text style={[styles.tableCell, styles.textAlignRight]}>
                  {formatCurrency(item.price)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colTotal]}>
                <Text style={[styles.tableCell, styles.textAlignRight]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          {/* ... keep existing code (totalsTable content) ... */}
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={[styles.totalValue]}>{formatCurrency(invoice.subtotal)}</Text>
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
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        {invoice.notes && (
          <View style={styles.footer} fixed>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
