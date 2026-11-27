import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";
import { Loader2, Search, MoreVertical, UserPlus, ShieldCheck, ShieldOff, Ban, Undo2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isOwner?: boolean;
  banned?: boolean;
  createdAt: string;
  lastLogin: string | null;
}

type Confirm = { kind: "delete" | "ban"; user: AdminUser } | null;

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "Never");

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [newUsername, setNewUsername] = React.useState("");
  const [newIsAdmin, setNewIsAdmin] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminUser | null>(null);
  const [editUsername, setEditUsername] = React.useState("");
  const [confirm, setConfirm] = React.useState<Confirm>(null);

  // Search after typing pauses, not on every keystroke.
  React.useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const { data: users, isLoading, isError } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", search],
    queryFn: () =>
      apiRequest<AdminUser[]>(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    enabled: !!user?.isAdmin,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  const onError = (title: string) => (error: unknown) =>
    toast({ title, description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });

  const createUser = useMutation({
    mutationFn: () =>
      apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ email: newEmail, username: newUsername || undefined, isAdmin: newIsAdmin }),
      }),
    onSuccess: () => {
      toast({ title: "User added", description: `${newEmail} gets this account when they sign in with Google.` });
      setAddOpen(false);
      setNewEmail("");
      setNewUsername("");
      setNewIsAdmin(false);
      refresh();
    },
    onError: onError("Couldn't add user"),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Record<string, unknown>; done: string }) =>
      apiRequest(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: (_data, vars) => {
      toast({ title: vars.done });
      setEditing(null);
      setConfirm(null);
      refresh();
    },
    onError: onError("Couldn't update user"),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "User deleted" });
      setConfirm(null);
      refresh();
    },
    onError: onError("Couldn't delete user"),
  });

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const busy = updateUser.isPending || deleteUser.isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">User Management</h1>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>User List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search users..."
                aria-label="Search users"
                className="pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Couldn't load users. Please refresh.</p>
          ) : !users?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isMe = u.id === user.id;
                  const protectedUser = isMe || !!u.isOwner;
                  return (
                    <TableRow key={u.id} className={u.banned ? "opacity-60" : undefined}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={u.isAdmin ? "default" : "secondary"}>
                            {u.isOwner ? "Owner" : u.isAdmin ? "Admin" : "User"}
                          </Badge>
                          {u.banned && <Badge variant="destructive">Banned</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(u.createdAt)}</TableCell>
                      <TableCell>{formatDate(u.lastLogin)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={busy}>
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions for {u.username}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditUsername(u.username);
                                setEditing(u);
                              }}
                            >
                              Edit username
                            </DropdownMenuItem>
                            {u.isAdmin ? (
                              <DropdownMenuItem
                                disabled={protectedUser}
                                onSelect={() =>
                                  updateUser.mutate({ id: u.id, patch: { isAdmin: false }, done: `${u.username} is no longer an admin` })
                                }
                              >
                                <ShieldOff className="h-4 w-4 mr-2" aria-hidden="true" />
                                Remove admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() =>
                                  updateUser.mutate({ id: u.id, patch: { isAdmin: true }, done: `${u.username} is now an admin` })
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" aria-hidden="true" />
                                Make admin
                              </DropdownMenuItem>
                            )}
                            {u.banned ? (
                              <DropdownMenuItem
                                onSelect={() =>
                                  updateUser.mutate({ id: u.id, patch: { banned: false }, done: `${u.username} is unbanned` })
                                }
                              >
                                <Undo2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                Unban
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled={protectedUser} onSelect={() => setConfirm({ kind: "ban", user: u })}>
                                <Ban className="h-4 w-4 mr-2" aria-hidden="true" />
                                Ban user
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={protectedUser}
                              className="text-destructive focus:text-destructive"
                              onSelect={() => setConfirm({ kind: "delete", user: u })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add user */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createUser.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
              <DialogDescription>
                Sign-in is with Google, so there's no password to set. When this person signs in with the email below
                they get this account and role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Username (optional)</Label>
                <Input id="new-user-name" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-user-admin">Admin</Label>
                <Switch id="new-user-admin" checked={newIsAdmin} onCheckedChange={setNewIsAdmin} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUser.isPending || !newEmail}>
                {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add user
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit username */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editing) updateUser.mutate({ id: editing.id, patch: { username: editUsername }, done: "Username updated" });
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription>{editing?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="edit-user-name">Username</Label>
              <Input
                id="edit-user-name"
                required
                minLength={2}
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUser.isPending || editUsername.trim().length < 2}>
                {updateUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm ban / delete */}
      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "delete" ? `Delete ${confirm.user.username}?` : `Ban ${confirm?.user.username}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "delete"
                ? "Their account, bookmarks and reading progress are removed. Their comments stay, shown without a name. This can't be undone."
                : "They're signed out and can't sign in again until you unban them."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!confirm) return;
                if (confirm.kind === "delete") deleteUser.mutate(confirm.user.id);
                else updateUser.mutate({ id: confirm.user.id, patch: { banned: true }, done: `${confirm.user.username} is banned` });
              }}
            >
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {confirm?.kind === "delete" ? "Delete" : "Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
