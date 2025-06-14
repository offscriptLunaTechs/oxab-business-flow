
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

interface InvoiceItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    name: string;
    sku: string;
    description?: string;
  };
}

interface InvoiceItemsCardProps {
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

const InvoiceItemsCard = ({ items, subtotal, discount, tax, total }: InvoiceItemsCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {items?.map((item) => (
              <Card key={item.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">{item.product?.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">SKU:</span>
                        <span className="ml-1">{item.product?.sku}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Qty:</span>
                        <span className="ml-1">{item.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <span className="ml-1">KD {Number(item.price).toFixed(3)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-1 font-medium">KD {Number(item.total).toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">{item.product?.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.product?.sku}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">KD {Number(item.price).toFixed(3)}</TableCell>
                  <TableCell className="text-right font-medium">KD {Number(item.total).toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>KD {Number(subtotal).toFixed(3)}</span>
          </div>
          {Number(discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-KD {Number(discount).toFixed(3)}</span>
            </div>
          )}
          {Number(tax) > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>KD {Number(tax).toFixed(3)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>KD {Number(total).toFixed(3)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceItemsCard;
