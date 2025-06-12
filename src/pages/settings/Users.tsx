
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserPlus, Mail, UserCog, Shield, AlertCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserWithRole {
  id: string;
  created_at: string;
  role: string;
  full_name?: string;
  department?: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserDialog = ({ open, onOpenChange }: CreateUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const { createUser, isCreatingUser } = useAdminUserManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUser.mutateAsync({
        email,
        fullName,
        role: role as 'admin' | 'manager' | 'employee',
        department: department || undefined
      });
      
      // Reset form
      setEmail("");
      setRole("employee");
      setFullName("");
      setDepartment("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account that they can activate by signing up with their email
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter user's full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Sales, IT, Management"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingUser}>
              {isCreatingUser ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
  onUpdate: (userId: string, role: string) => Promise<void>;
}

const EditUserDialog = ({ open, onOpenChange, user, onUpdate }: EditUserDialogProps) => {
  const [role, setRole] = useState(user?.role || "employee");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role || "employee");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await onUpdate(user.id, role);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and permissions
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-sm text-gray-700 font-mono">{user.id}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-sm text-gray-700">{user.full_name || "No name provided"}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  const { user: currentUser, userRole } = useAuth();
  const { resetPassword, isResettingPassword } = useAdminUserManagement();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Current user:', currentUser?.id);
      console.log('Current user role:', userRole);
      
      // Check if current user is admin using the new security definer function
      const { data: currentUserRoleData, error: roleCheckError } = await supabase
        .rpc('get_user_role_safe', { user_id: currentUser?.id });
      
      console.log('RPC role check result:', currentUserRoleData, roleCheckError);
      
      if (roleCheckError) {
        console.error('Error checking user role:', roleCheckError);
        setError(`Failed to verify admin permissions: ${roleCheckError.message}`);
        return;
      }
      
      if (currentUserRoleData !== 'admin') {
        setError(`Access denied. Your role is: ${currentUserRoleData || 'unknown'}. Admin role required.`);
        return;
      }

      console.log('User confirmed as admin, fetching users...');
      
      // Fetch user roles with profile data
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id, 
          role, 
          created_at,
          user_profiles!inner(
            full_name,
            department
          )
        `);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setError(`Failed to load user roles: ${rolesError.message}`);
        return;
      }

      console.log('User roles data fetched:', userRolesData);

      // Transform the data
      const transformedUsers: UserWithRole[] = userRolesData.map(userRole => ({
        id: userRole.user_id,
        created_at: userRole.created_at,
        role: userRole.role,
        full_name: userRole.user_profiles?.full_name,
        department: userRole.user_profiles?.department
      }));

      console.log('Final transformed users data:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Unexpected error in fetchUsers:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    } else {
      setError('No authenticated user found.');
      setLoading(false);
    }
  }, [currentUser, userRole]);

  const handleEditUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (userId: string, role: string) => {
    try {
      console.log('Updating user role:', userId, role);
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: role, 
          updated_at: new Date().toISOString() 
        });

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role: ' + error.message);
        return;
      }

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error in handleUpdateUser:', error);
      toast.error('An unexpected error occurred while updating user role');
    }
  };

  const handleResetPassword = async (userId: string) => {
    // Find user email first (this is a simplified approach - in production you might want to store email in profiles)
    const userEmail = prompt('Enter the user\'s email address to reset their password:');
    if (!userEmail) return;
    
    try {
      await resetPassword.mutateAsync({ email: userEmail });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading user management...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Error:</strong> {error}</p>
                <div className="text-sm">
                  <p><strong>Debug info:</strong></p>
                  <p>Current User ID: {currentUser?.id || 'Not available'}</p>
                  <p>Current User Role: {userRole || 'Not available'}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You need admin privileges to access user management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Create and manage user accounts and permissions
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || "No name"}</p>
                          <p className="text-sm text-gray-500 font-mono">{user.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.department || "Not set"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={user.id === currentUser?.id}
                            title="Edit user role"
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                            disabled={isResettingPassword}
                            title="Reset password"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />
    </>
  );
};

export default Users;
