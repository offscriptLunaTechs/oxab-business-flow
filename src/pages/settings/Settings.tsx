
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, Settings as SettingsIcon, UserCircle } from "lucide-react";
import Users from "./Users";
import Profile from "@/pages/profile/Profile";

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Check if we're on the users subpage
  const isUsersPage = location.pathname === "/settings/users";
  
  // If we're on the users subpage, just show the Users component
  if (isUsersPage) {
    return <Users />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your profile, system settings, and users</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger 
            value="profile"
            onClick={() => setActiveTab("profile")}
            className="flex items-center"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger 
            value="users"
            onClick={() => setActiveTab("users")}
            className="flex items-center"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger 
            value="general"
            onClick={() => setActiveTab("general")}
            className="flex items-center"
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Profile />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Users />
        </TabsContent>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system settings for KECC Business System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <p className="text-sm text-gray-600">KECC Business System</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">System Version</label>
                      <p className="text-sm text-gray-600">v1.0.0</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Application Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive system notifications via email</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming soon</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatic Backups</p>
                        <p className="text-sm text-gray-600">Daily automated data backups</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming soon</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Retention</p>
                        <p className="text-sm text-gray-600">How long to keep audit logs and reports</p>
                      </div>
                      <div className="text-sm text-gray-500">Coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
