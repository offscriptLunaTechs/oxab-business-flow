
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, DollarSign } from 'lucide-react';
import { MobileCustomersList } from './MobileCustomersList';
import { PricingManagement } from '../PricingManagement';

const tabs = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
];

export const MobileCustomerTabs = () => {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-20">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 h-12 rounded-none border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'customers' && <MobileCustomersList />}
        {activeTab === 'pricing' && (
          <div className="p-4">
            <PricingManagement />
          </div>
        )}
      </div>
    </div>
  );
};
