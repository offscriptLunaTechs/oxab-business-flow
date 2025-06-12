
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  onClick?: () => void;
}

const StatsCard = ({ title, value, change, changeType, icon: Icon, color, onClick }: StatsCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  const changeTypeClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <Card className={onClick ? 'transition-all hover:shadow-md hover:scale-105 cursor-pointer' : ''}>
      <CardWrapper 
        onClick={onClick}
        className={onClick ? 'w-full text-left' : ''}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
              <div className="flex items-center text-sm">
                {changeType === 'positive' && <TrendingUp className="h-4 w-4 mr-1 text-green-600" />}
                {changeType === 'negative' && <TrendingDown className="h-4 w-4 mr-1 text-red-600" />}
                <span className={changeTypeClasses[changeType]}>{change}</span>
              </div>
            </div>
            <div className={`ml-4 ${colorClasses[color]}`}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </CardWrapper>
    </Card>
  );
};

export default StatsCard;
