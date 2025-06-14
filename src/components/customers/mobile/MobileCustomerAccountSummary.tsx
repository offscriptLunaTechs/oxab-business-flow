
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCustomers } from '@/hooks/useCustomers';

export const MobileCustomerAccountSummary = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: customers, isLoading: customersLoading, error: customersError } = useCustomers();

  const isLoading = statsLoading || customersLoading;
  const hasError = statsError || customersError;

  if (hasError) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading account overview</p>
        </div>
      </div>
    );
  }

  // Format currency consistently with the rest of the app
  const formatCurrency = (amount: number) => `KD ${amount.toLocaleString()}`;

  // Calculate growth rate change type and format
  const getGrowthRateData = () => {
    if (!stats?.monthlyRevenueChangeType || !stats?.monthlyRevenueChange) {
      return { value: 'N/A', change: 'No data', color: 'text-gray-600' };
    }

    const changeType = stats.monthlyRevenueChangeType;
    const changeText = stats.monthlyRevenueChange;
    
    // Extract percentage from change text if it contains one
    const percentMatch = changeText.match(/([+-]?\d+\.?\d*)%/);
    const displayValue = percentMatch ? `${percentMatch[1]}%` : 'N/A';
    
    return {
      value: displayValue,
      change: changeText,
      color: changeType === 'positive' ? 'text-green-600' : 
             changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
    };
  };

  const growthData = getGrowthRateData();

  const summaryData = [
    {
      title: 'Monthly Revenue',
      value: stats ? formatCurrency(stats.monthlyRevenue || 0) : 'KD 0',
      change: stats?.monthlyRevenueChange || 'No data',
      icon: DollarSign,
      color: stats?.monthlyRevenueChangeType === 'positive' ? 'text-green-600' : 
             stats?.monthlyRevenueChangeType === 'negative' ? 'text-red-600' : 'text-gray-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Customers',
      value: customers ? customers.length.toString() : '0',
      change: `${customers?.length || 0} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Outstanding',
      value: stats ? formatCurrency(stats.totalOutstanding || 0) : 'KD 0',
      change: (stats?.totalOutstanding || 0) > 0 ? 'Needs collection' : 'All collected',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Growth Rate',
      value: growthData.value,
      change: growthData.change,
      icon: TrendingUp,
      color: growthData.color,
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {summaryData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mb-1" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <p className={`text-xs ${item.color}`}>
                      {item.change}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
