
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInvitations, useDeleteInvitation, useResendInvitation } from '@/hooks/useInvitations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Mail, Clock, CheckCircle, XCircle, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const InvitationsList = () => {
  const { data: invitations = [], isLoading, error } = useInvitations();
  const deleteInvitation = useDeleteInvitation();
  const resendInvitation = useResendInvitation();

  // Filter out cancelled invitations since we're deleting them now
  const activeInvitations = invitations.filter(inv => inv.status !== 'cancelled');

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmailStatusBadge = (emailStatus?: string) => {
    switch (emailStatus) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Email Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Email Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Email Pending</Badge>;
      default:
        return <Badge variant="outline">No Email</Badge>;
    }
  };

  const getStatusIcon = (status: string, expiresAt: string, emailStatus?: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (emailStatus === 'failed') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    if (status === 'pending' && isExpired) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDelete = (invitationId: string) => {
    deleteInvitation.mutate(invitationId);
  };

  const handleResend = (invitationId: string) => {
    resendInvitation.mutate(invitationId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load invitations: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          User Invitations ({activeInvitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeInvitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invitations sent</h3>
            <p className="text-gray-600">Start by inviting users to join your organization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeInvitations.map((invitation) => {
                  const isExpired = new Date(invitation.expires_at) < new Date();
                  const canResend = (invitation.status === 'pending' && isExpired) || invitation.email_status === 'failed';
                  const canDelete = invitation.status === 'pending';
                  
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invitation.status, invitation.expires_at, invitation.email_status)}
                          <div>
                            <p className="font-medium">{invitation.email}</p>
                            <p className="text-sm text-gray-500">
                              Invited {new Date(invitation.created_at).toLocaleDateString()}
                            </p>
                            {invitation.email_sent_at && (
                              <p className="text-xs text-gray-400">
                                Email: {new Date(invitation.email_sent_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {invitation.department || 'Not specified'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status, invitation.expires_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getEmailStatusBadge(invitation.email_status)}
                          {invitation.email_error && (
                            <p className="text-xs text-red-600" title={invitation.email_error}>
                              Error: {invitation.email_error.substring(0, 30)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canResend && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(invitation.id)}
                              disabled={resendInvitation.isPending}
                              title={invitation.email_status === 'failed' ? "Retry sending email" : "Resend invitation"}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deleteInvitation.isPending}
                                  title="Delete invitation"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invitation?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this invitation for {invitation.email}? 
                                    This action cannot be undone and they will no longer be able to join using this invitation.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(invitation.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
