import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Package, Users, TrendingUp, AlertCircle, Clock, CheckCircle, DollarSign } from "lucide-react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePaymentDataSync } from "@/hooks/usePaymentDataSync";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { useAuth } from "@/context/AuthContext";
import { useInvitations } from "@/hooks/useInvitations";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading,
    error
  } = useDashboardStats();

  // Ensure payment data is synchronized
  usePaymentDataSync();
  
  // Get invitations data for admin users
  const { user, userRole } = useAuth();
  const { data: invitations = [] } = useInvitations();
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;

  const quickActions = [{
    title: "Create Invoice",
    description: "Generate a new invoice for customers quickly and easily",
    icon: FileText,
    color: "blue" as const,
    onClick: () => navigate("/invoices/new")
  }, {
    title: "View Inventory",
    description: "Check stock levels and manage your OXAB products",
    icon: Package,
    color: "green" as const,
    onClick: () => navigate("/inventory"),
    badge: stats?.lowStockCount ? `${stats.lowStockCount} low stock` : undefined
  }, {
    title: "Find Customer",
    description: "Search and manage customer information and orders",
    icon: Users,
    color: "purple" as const,
    onClick: () => navigate("/customers")
  }, {
    title: "Outstanding Report",
    description: "View detailed outstanding invoices report with aging analysis",
    icon: TrendingUp,
    color: "orange" as const,
    onClick: () => navigate("/reports/outstanding-invoices")
  }];

  // Add invitation management for admins
  if (userRole === 'admin') {
    quickActions.push({
      title: "User Management",
      description: "Invite new users and manage existing accounts",
      icon: Users,
      color: "purple" as const,
      onClick: () => navigate("/settings/users"),
      badge: pendingInvitations > 0 ? `${pendingInvitations} pending` : undefined
    });
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  if (error) {
    return <div className="text-center py-8">
        <p className="text-red-600">Error loading dashboard data: {error.message}</p>
      </div>;
  }
  const statsCards = [{
    title: "Today's Invoices",
    value: stats?.todayInvoices || 0,
    change: stats?.todayInvoicesChange || "No data available",
    changeType: (stats?.todayInvoices || 0) > 0 ? "positive" as const : "neutral" as const,
    icon: FileText,
    color: "blue" as const,
    onClick: () => navigate("/invoices")
  }, {
    title: "Pending Invoices",
    value: stats?.pendingInvoices || 0,
    change: (stats?.pendingInvoices || 0) > 0 ? "Requires attention" : "All caught up",
    changeType: (stats?.pendingInvoices || 0) > 0 ? "neutral" as const : "positive" as const,
    icon: Clock,
    color: "orange" as const,
    onClick: () => navigate("/invoices?status=pending")
  }, {
    title: "Total Outstanding",
    value: `KD ${(stats?.totalOutstanding || 0).toLocaleString()}`,
    change: (stats?.totalOutstanding || 0) > 0 ? "Needs collection" : "All collected",
    changeType: (stats?.totalOutstanding || 0) > 0 ? "negative" as const : "positive" as const,
    icon: DollarSign,
    color: "red" as const,
    onClick: () => navigate("/reports/outstanding-invoices")
  }, {
    title: "Monthly Revenue",
    value: `KD ${(stats?.monthlyRevenue || 0).toLocaleString()}`,
    change: stats?.monthlyRevenueChange || "No data available",
    changeType: stats?.monthlyRevenueChangeType || "neutral" as const,
    icon: DollarSign,
    color: "green" as const
  }];
  return <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back! </h1>
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
        {statsCards.map((stat, index) => <StatsCard key={index} {...stat} />)}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => <QuickActionCard key={index} {...action} />)}
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
                Real-time dashboard statistics now active
              </p>
              <p className="text-xs text-gray-500">All trends calculated from actual business data</p>
            </div>
            <span className="text-sm font-medium text-green-600">Live</span>
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
          
          {(stats?.lowStockCount || 0) > 0 && <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {stats?.lowStockCount} items need restocking
                </p>
                <p className="text-xs text-gray-500">Check inventory levels</p>
              </div>
              <span className="text-sm font-medium text-orange-600">Attention</span>
            </div>}

          {stats?.recentActivity && stats.recentActivity.length > 0 && <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Latest Transactions</h4>
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 3).map((activity, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{activity.description}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      KD {Number(activity.amount).toLocaleString()}
                    </span>
                  </div>)}
              </div>
            </div>}

          {(!stats?.recentActivity || stats.recentActivity.length === 0) && <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent activity to display</p>
            </div>}
        </div>
      </div>
    </div>;
};
export default Dashboard;
