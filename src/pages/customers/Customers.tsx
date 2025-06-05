import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  UserPlus, 
  FileText, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { EditCustomerDialog } from '@/components/customers/EditCustomerDialog';
import { AccountSummary } from '@/components/customers/AccountSummary';
import { useQueryClient } from '@tanstack/react-query';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'wholesale' | 'retail'>('all');
  const [activeTab, setActiveTab] = useState('all-customers');
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: customers = [], isLoading, error } = useCustomers(searchTerm);

  // Filter customers based on type
  const filteredCustomers = customers.filter(customer => {
    if (filterType === 'all') return true;
    return customer.customer_type === filterType;
  });

  const getCustomerTypeColor = (type: string) => {
    return type === 'wholesale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const handleCustomerSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    if (activeTab === 'add-customer') {
      setActiveTab('all-customers');
    }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage wholesale and retail customers, pricing, and account statements</p>
        </div>
        <Button 
          className="md:w-auto"
          onClick={() => setActiveTab('add-customer')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="all-customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">All Customers</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="add-customer" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </TabsTrigger>
          <TabsTrigger value="account-summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Account Summary</span>
            <span className="sm:hidden">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="custom-pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Custom Pricing</span>
            <span className="sm:hidden">Pricing</span>
          </TabsTrigger>
        </TabsList>

        {/* All Customers Tab */}
        <TabsContent value="all-customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, code, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All ({customers.length})
                  </Button>
                  <Button
                    variant={filterType === 'wholesale' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('wholesale')}
                  >
                    Wholesale ({customers.filter(c => c.customer_type === 'wholesale').length})
                  </Button>
                  <Button
                    variant={filterType === 'retail' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('retail')}
                  >
                    Retail ({customers.filter(c => c.customer_type === 'retail').length})
                  </Button>
                </div>
              </div>

              {/* Customers Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading customers...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading customers</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('add-customer')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Customer
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500 md:hidden">
                                {customer.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {customer.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCustomerTypeColor(customer.customer_type)}>
                              {customer.customer_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {customer.phone}
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {customer.address && (
                              <div className="flex items-start text-sm text-gray-600">
                                <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{customer.address}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Customer Tab */}
        <TabsContent value="add-customer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerForm onSuccess={handleCustomerSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Summary Tab */}
        <TabsContent value="account-summary">
          <AccountSummary />
        </TabsContent>

        {/* Custom Pricing Tab */}
        <TabsContent value="custom-pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custom Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Customer-specific pricing management will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={editingCustomer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleCustomerSuccess}
      />
    </div>
  );
};

export default Customers;
