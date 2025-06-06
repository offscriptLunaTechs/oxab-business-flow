
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, Settings as SettingsIcon } from "lucide-react";
import Users from "./Users";

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("users");
  
  // Only show Users component directly if we're on the main settings page
  const isMainSettingsPage = location.pathname === "/settings";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system settings and users</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger 
            value="users"
            onClick={() => setActiveTab("users")}
            className="flex items-center"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            Users Management
          </TabsTrigger>
          <TabsTrigger 
            value="general"
            onClick={() => setActiveTab("general")}
            className="flex items-center"
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            General Settings
          </TabsTrigger>
        </TabsList>

        {isMainSettingsPage ? (
          <>
            <TabsContent value="users" className="space-y-4">
              <Users />
            </TabsContent>
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure global system settings for KECC Business System
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-gray-500">
                    General settings configuration coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <Outlet />
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
