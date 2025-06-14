import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import { InvoiceWithDetails } from "@/types/invoice";

// Register fonts for better PDF rendering
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 12,
    paddingTop: 30,
    paddingLeft: 60,
    paddingRight: 60,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  text: {
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
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
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 4,
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoice: {
    id: string;
    date: string;
    due_date: string;
    status: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
    customer: {
      id: string;
      name: string;
      code: string;
      email?: string;
      phone?: string;
      address?: string;
      customer_type: 'wholesale' | 'retail';
      loyalty_points: number;
      created_at: string;
      updated_at?: string;
    };
    items: Array<{
      id: string;
      invoice_id: string;
      product_id: string;
      quantity: number;
      price: number;
      total: number;
      product?: {
        id: string;
        name: string;
        sku: string;
        size: string;
        base_price: number;
        pack_size?: number;
        trademark?: string;
        description?: string;
        status: 'active' | 'discontinued' | 'inactive';
        created_at: string;
        updated_at: string;
      };
    }>;
  };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Invoice</Text>
        <Text style={styles.subtitle}>Invoice ID: {invoice.id}</Text>
        <Text style={styles.text}>
          Date: {format(new Date(invoice.date), 'yyyy-MM-dd')}
        </Text>
        <Text style={styles.text}>
          Due Date: {format(new Date(invoice.due_date), 'yyyy-MM-dd')}
        </Text>
        <Text style={styles.text}>Status: {invoice.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Customer Information</Text>
        <Text style={styles.text}>Name: {invoice.customer.name}</Text>
        <Text style={styles.text}>Code: {invoice.customer.code}</Text>
        {invoice.customer.email && (
          <Text style={styles.text}>Email: {invoice.customer.email}</Text>
        )}
        {invoice.customer.phone && (
          <Text style={styles.text}>Phone: {invoice.customer.phone}</Text>
        )}
        {invoice.customer.address && (
          <Text style={styles.text}>Address: {invoice.customer.address}</Text>
        )}
        <Text style={styles.text}>
          Customer Type: {invoice.customer.customer_type}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Invoice Items</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
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
          {invoice.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.product?.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.text}>Subtotal: {invoice.subtotal.toFixed(2)}</Text>
        <Text style={styles.text}>Tax: {invoice.tax.toFixed(2)}</Text>
        <Text style={styles.text}>Discount: {invoice.discount.toFixed(2)}</Text>
        <Text style={styles.subtitle}>Total: {invoice.total.toFixed(2)}</Text>
      </View>

      {invoice.notes && (
        <View style={styles.section}>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.text}>{invoice.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);
