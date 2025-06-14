
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { SkuMonthlyMovement, SkuStockLevel } from '@/hooks/useSkuAnalytics';
import { TopMovingProduct } from '@/hooks/useInventoryAnalytics';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 8,
  },
  table: {
    display: 'flex',
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
    backgroundColor: '#f8f9fa',
    padding: 5,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 5,
    backgroundColor: '#f8f9fa',
  },
  movementText: {
    fontSize: 9,
  },
  netPositive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  netNegative: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});

interface InventoryReportPDFProps {
  skuMovements: SkuMonthlyMovement[];
  skuStockLevels: SkuStockLevel[];
  topMovers: TopMovingProduct[];
  reportDate: string;
}

const InventoryReportPDF = ({ 
  skuMovements, 
  skuStockLevels, 
  topMovers, 
  reportDate 
}: InventoryReportPDFProps) => {
  // Group movements by SKU for better display
  const movementsBySku = skuMovements.reduce((acc, movement) => {
    const key = `${movement.sku}-${movement.size}`;
    if (!acc[key]) {
      acc[key] = {
        sku: movement.sku,
        product_name: movement.product_name,
        size: movement.size,
        movements: []
      };
    }
    acc[key].movements.push(movement);
    return acc;
  }, {} as Record<string, any>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inventory Report</Text>
          <Text style={styles.subtitle}>Generated on {reportDate}</Text>
        </View>

        {/* Top Moving Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Moving Products (Last 30 Days)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Rank</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Product</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>SKU</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Size</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Units Moved</Text>
              </View>
            </View>
            {topMovers.slice(0, 10).map((item, index) => (
              <View style={styles.tableRow} key={`${item.sku}-${item.size}`}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>#{index + 1}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.product_name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.sku}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.size}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.total_moved.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SKU Monthly Movements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Movement Analysis by SKU</Text>
          {Object.values(movementsBySku).slice(0, 15).map((skuData: any) => (
            <View key={`${skuData.sku}-${skuData.size}`} style={styles.movementItem}>
              <View>
                <Text style={styles.movementText}>
                  {skuData.product_name} ({skuData.sku} - {skuData.size})
                </Text>
              </View>
              <View>
                {skuData.movements.map((movement: SkuMonthlyMovement, idx: number) => (
                  <Text 
                    key={idx} 
                    style={[
                      styles.movementText,
                      movement.net_movement >= 0 ? styles.netPositive : styles.netNegative
                    ]}
                  >
                    {movement.month}: {movement.net_movement >= 0 ? '+' : ''}{movement.net_movement}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Current Stock Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stock Levels by SKU</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Product</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>SKU</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Size</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Stock</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Value (KD)</Text>
              </View>
            </View>
            {skuStockLevels.slice(0, 20).map((item) => (
              <View style={styles.tableRow} key={`${item.sku}-${item.size}`}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.product_name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.sku}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.size}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.current_stock.toLocaleString()}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.stock_value.toFixed(3)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InventoryReportPDF;
