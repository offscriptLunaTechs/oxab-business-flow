
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Plus, Eye, Edit, Download, MoreVertical, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { getStatusColor } from '@/utils/invoiceUtils';
import { useUpdateInvoice } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoicePDF } from '@/utils/pdfUtils';

interface Invoice {
  id: string;
  customer?: { name: string };
  date: string;
  due_date: string;
  status: string;
  total: number;
}

interface MobileInvoicesListProps {
  invoices: Invoice[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh?: () => void;
}

const MobileInvoicesList = ({
  invoices,
  isLoading,
  searchTerm,
  onSearchChange,
  onRefresh,
}: MobileInvoicesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const updateInvoiceMutation = useUpdateInvoice();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceId,
        invoiceData: { status: newStatus as 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue' }
      });
      toast({
        title: "Success",
        description: `Invoice status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    setDownloadingInvoiceId(invoiceId);
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      await downloadInvoicePDF(invoice);
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Invoices</h2>
          <Badge variant="secondary">{filteredInvoices.length}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      <Button
        onClick={() => navigate('/invoices/new')}
        className="w-full h-12 text-base"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Create New Invoice
      </Button>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No invoices found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Invoice {invoice.id}
                        </p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-base text-gray-600 truncate">
                        {invoice.customer?.name}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        KWD {Number(invoice.total).toFixed(3)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}/edit`);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(invoice.id);
                          }}
                          disabled={downloadingInvoiceId === invoice.id}
                        >
                          {downloadingInvoiceId === invoice.id ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(invoice.id, 'paid');
                          }}
                          disabled={updateInvoiceMutation.isPending}
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(invoice.id, 'pending');
                          }}
                          disabled={updateInvoiceMutation.isPending}
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(invoice.id, 'overdue');
                          }}
                          disabled={updateInvoiceMutation.isPending}
                        >
                          Mark as Overdue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Date: {format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                    <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileInvoicesList;
