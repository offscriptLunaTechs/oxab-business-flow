
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TrendingUp, Users, ShoppingCart, DollarSign, Search, Calendar } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useProductSalesAnalytics } from "@/hooks/useProductSalesAnalytics";
import { format } from "date-fns";

const ProductSalesAnalysis = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [analysisEnabled, setAnalysisEnabled] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: analytics, isLoading: analyticsLoading, error } = useProductSalesAnalytics(
    selectedProductId,
    startDate,
    endDate,
    analysisEnabled
  );

  const handleGenerateReport = () => {
    if (selectedProductId && startDate && endDate) {
      setAnalysisEnabled(true);
    }
  };

  const formatCurrency = (amount: number) => `KWD ${amount.toFixed(3)}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Product Sales Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Product
              </label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {productsLoading ? (
                    <SelectItem value="" disabled>Loading products...</SelectItem>
                  ) : (
                    products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date
              </label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Start date"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date
              </label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="End date"
              />
            </div>
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedProductId || !startDate || !endDate || analyticsLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyticsLoading && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              Error loading sales data: {error.message}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics && !analyticsLoading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sold</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.total_quantity_sold}
                    </p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(analytics.total_revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg: {formatCurrency(analytics.average_price)}/unit
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invoices</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.total_invoices}
                    </p>
                    <p className="text-xs text-gray-500">transactions</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.unique_customers}
                    </p>
                    <p className="text-xs text-gray-500">unique buyers</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-semibold">{analytics.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-semibold">{analytics.product_sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Analysis Period</p>
                  <p className="font-semibold">
                    {format(new Date(analytics.period_start), 'MMM dd, yyyy')} - {' '}
                    {format(new Date(analytics.period_end), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.customers.map((customer) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.customer_name}</div>
                            <div className="text-sm text-gray-500">{customer.customer_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                            {customer.customer_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {customer.total_quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.invoice_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {format(new Date(customer.last_purchase_date), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No customer data found for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recent_transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recent_transactions.map((transaction, index) => (
                      <TableRow key={`${transaction.invoice_id}-${index}`}>
                        <TableCell className="font-mono text-sm">
                          {transaction.invoice_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.customer_name}</div>
                            <div className="text-sm text-gray-500">{transaction.customer_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductSalesAnalysis;
