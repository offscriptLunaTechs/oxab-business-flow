
import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Package, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for stock movements - in real app this would come from useStockMovements hook
const mockMovements = [
  {
    id: "1",
    product_name: "OXAB Mineral Water 500ml",
    movement_type: "out",
    quantity: 50,
    previous_stock: 120,
    new_stock: 70,
    reason: "Invoice #INV-2024-003",
    timestamp: "2024-06-06T10:30:00Z",
    performed_by: "Ahmed Al-Mansouri"
  },
  {
    id: "2",
    product_name: "OXAB Mineral Water 330ml",
    movement_type: "in",
    quantity: 200,
    previous_stock: 150,
    new_stock: 350,
    reason: "Purchase Order #PO-2024-001 received",
    timestamp: "2024-06-06T09:15:00Z",
    performed_by: "System"
  },
  {
    id: "3",
    product_name: "OXAB Mineral Water 1L",
    movement_type: "adjustment",
    quantity: -5,
    previous_stock: 85,
    new_stock: 80,
    reason: "Damaged goods adjustment",
    timestamp: "2024-06-05T16:45:00Z",
    performed_by: "Sara Al-Kindi"
  },
  {
    id: "4",
    product_name: "OXAB Mineral Water 200ml",
    movement_type: "out",
    quantity: 100,
    previous_stock: 300,
    new_stock: 200,
    reason: "Invoice #INV-2024-002",
    timestamp: "2024-06-05T14:20:00Z",
    performed_by: "Ahmed Al-Mansouri"
  }
];

const MovementHistory = () => {
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-green-100 text-green-800">Stock In</Badge>;
      case 'out':
        return <Badge className="bg-red-100 text-red-800">Stock Out</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Adjustment</Badge>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredMovements = mockMovements.filter(movement => {
    if (typeFilter !== "all" && movement.movement_type !== typeFilter) return false;
    if (dateFilter) {
      const movementDate = new Date(movement.timestamp).toDateString();
      const filterDate = dateFilter.toDateString();
      if (movementDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date
              </label>
              <DatePicker
                date={dateFilter}
                onDateChange={setDateFilter}
                placeholder="Filter by date"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Movement Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateFilter(undefined);
                  setTypeFilter("all");
                  setProductFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Movement History ({filteredMovements.length} movements)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => {
                  const dateTime = formatDateTime(movement.timestamp);
                  const quantityDisplay = movement.movement_type === 'out' 
                    ? `-${movement.quantity}` 
                    : movement.movement_type === 'adjustment' && movement.quantity < 0
                    ? movement.quantity.toString()
                    : `+${movement.quantity}`;

                  return (
                    <TableRow key={movement.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.movement_type)}
                          {getMovementBadge(movement.movement_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{movement.product_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold ${
                          movement.movement_type === 'out' || (movement.movement_type === 'adjustment' && movement.quantity < 0)
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {quantityDisplay}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{movement.previous_stock} → {movement.new_stock}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{movement.reason}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{dateTime.date}</div>
                          <div className="text-gray-500">{dateTime.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{movement.performed_by}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No movements found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovementHistory;
