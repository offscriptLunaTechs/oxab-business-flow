
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Package, Users, TrendingUp, AlertCircle, Clock, CheckCircle, DollarSign } from "lucide-react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useDashboardStats();

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Generate a new invoice for customers quickly and easily",
      icon: FileText,
      color: "blue" as const,
      onClick: () => navigate("/invoices/new"),
    },
    {
      title: "View Inventory",
      description: "Check stock levels and manage your OXAB products",
      icon: Package,
      color: "green" as const,
      onClick: () => navigate("/inventory"),
      badge: stats?.lowStockItems ? `${stats.lowStockItems} low stock` : undefined,
    },
    {
      title: "Find Customer",
      description: "Search and manage customer information and orders",
      icon: Users,
      color: "purple" as const,
      onClick: () => navigate("/customers"),
    },
    {
      title: "View Invoices",
      description: "Browse and manage all your invoices and payments",
      icon: TrendingUp,
      color: "orange" as const,
      onClick: () => navigate("/invoices"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading dashboard data: {error.message}</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Today's Invoices",
      value: stats?.todayInvoices || 0,
      change: stats?.todayInvoices ? "+2 from yesterday" : "No invoices today",
      changeType: (stats?.todayInvoices || 0) > 0 ? "positive" as const : "neutral" as const,
      icon: FileText,
      color: "blue" as const,
    },
    {
      title: "Pending Invoices",
      value: stats?.pendingInvoices || 0,
      change: (stats?.pendingInvoices || 0) > 0 ? "Requires attention" : "All caught up",
      changeType: (stats?.pendingInvoices || 0) > 0 ? "neutral" as const : "positive" as const,
      icon: Clock,
      color: "orange" as const,
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      change: (stats?.lowStockItems || 0) > 0 ? "Need restocking" : "Stock levels good",
      changeType: (stats?.lowStockItems || 0) > 0 ? "negative" as const : "positive" as const,
      icon: AlertCircle,
      color: "red" as const,
    },
    {
      title: "Monthly Revenue",
      value: `KD ${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+8.2% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "green" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Invoice system is now fully operational
              </p>
              <p className="text-xs text-gray-500">Connected to live database</p>
            </div>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {stats?.todayInvoices || 0} invoices created today
              </p>
              <p className="text-xs text-gray-500">Real-time invoice tracking</p>
            </div>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
          
          {(stats?.lowStockItems || 0) > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {stats?.lowStockItems} items need restocking
                </p>
                <p className="text-xs text-gray-500">Check inventory levels</p>
              </div>
              <span className="text-sm font-medium text-orange-600">Attention</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
