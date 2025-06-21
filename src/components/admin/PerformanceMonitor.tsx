
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, Clock, Zap } from 'lucide-react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  connectionLatency: number;
  errorRate: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  lastUpdated: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    connectionLatency: 0,
    errorRate: 0,
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    activeUsers: 1,
    lastUpdated: new Date().toISOString(),
  });

  const [logs, setLogs] = useState(logger.getLogs().slice(-50));

  useEffect(() => {
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          renderTime: paint.length > 0 ? paint[0].startTime : 0,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          connectionLatency: navigation.responseStart - navigation.requestStart,
          errorRate: calculateErrorRate(),
        });
      }
    };

    const calculateErrorRate = (): number => {
      const recentLogs = logger.getLogs().slice(-100);
      const errorLogs = recentLogs.filter(log => log.level === 'error');
      return recentLogs.length > 0 ? (errorLogs.length / recentLogs.length) * 100 : 0;
    };

    measurePerformance();
    
    const interval = setInterval(() => {
      measurePerformance();
      setLogs(logger.getLogs().slice(-50));
      setSystemHealth(prev => ({
        ...prev,
        uptime: prev.uptime + 30,
        lastUpdated: new Date().toISOString(),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <Badge className={getStatusColor(systemHealth.status)}>
          System {systemHealth.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loadTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.loadTime < 2000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB
            </div>
            <p className="text-xs text-muted-foreground">
              JavaScript heap size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connectionLatency.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Response latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 100 operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Application Logs</h3>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No logs available</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {log.level}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Uptime</label>
                  <p className="text-lg">{Math.floor(systemHealth.uptime / 60)} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Active Users</label>
                  <p className="text-lg">{systemHealth.activeUsers}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(systemHealth.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Environment</label>
                  <p className="text-lg">{import.meta.env.DEV ? 'Development' : 'Production'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
