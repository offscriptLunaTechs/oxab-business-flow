
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, FileText } from 'lucide-react';

export const MobileCustomerAccountSummary = () => {
  // Mock data - replace with actual data from hooks
  const summaryData = [
    {
      title: 'Total Revenue',
      value: 'KSh 125,000',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Customers',
      value: '42',
      change: '+5',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Outstanding',
      value: 'KSh 15,500',
      change: '-8.2%',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Growth Rate',
      value: '18.5%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-purple-600',
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
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                  <p className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
