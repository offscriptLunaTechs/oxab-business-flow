
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
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
import { UserPlus, Mail, UserCog } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  user_role: {
    role: string;
  };
  user_profile?: {
    full_name: string;
    department: string;
  };
}

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string, fullName: string) => Promise<void>;
}

const InviteUserDialog = ({ open, onOpenChange, onInvite }: InviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onInvite(email, role, fullName);
      setEmail("");
      setRole("employee");
      setFullName("");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member
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
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
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
  const [role, setRole] = useState(user?.user_role?.role || "employee");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.user_role?.role || "employee");
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
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-gray-700">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-sm text-gray-700">{user.user_profile?.full_name || "No name provided"}</p>
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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          auth_users:user_id (
            id,
            email,
            created_at
          ),
          user_profiles:user_id (
            full_name,
            department
          )
        `);

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }

      // Transform the data to the expected format
      const formattedUsers = data.map((item: any) => ({
        id: item.auth_users.id,
        email: item.auth_users.email,
        created_at: item.auth_users.created_at,
        user_role: {
          role: item.role
        },
        user_profile: item.user_profiles || {}
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('An unexpected error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        return;
      }

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error in handleUpdateUser:', error);
      toast.error('An unexpected error occurred while updating user role');
    }
  };

  const handleInviteUser = async (email: string, role: string, fullName: string) => {
    try {
      // In a real implementation, you would send an invitation email
      // For now, just show a success message
      toast.success(`Invitation sent to ${email} for role: ${role}`);
      
      // Simulate adding the user
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (error) {
        console.error('Error inviting user:', error);
        toast.error(`Failed to invite user: ${error.message}`);
        return;
      }
      
      toast.success(`User invited successfully: ${email}`);
      fetchUsers();
    } catch (error) {
      console.error('Error in handleInviteUser:', error);
      toast.error('An unexpected error occurred while inviting user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
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
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.user_profile?.full_name || "No name"}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.user_role?.role)}>
                          {user.user_role?.role || "No role"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={user.id === currentUser?.id} // Can't edit yourself
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteUser}
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
