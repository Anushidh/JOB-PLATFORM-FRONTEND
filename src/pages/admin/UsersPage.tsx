import { useState } from 'react';
import {
  Container, Stack, Text, Button, Input, Badge, Surface, Spinner, EmptyState,
  Avatar, Dropdown, DropdownItem, DropdownSeparator, useToast,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useAdminEmployees, useAdminEmployers, useSuspendUser, useReactivateUser, useDeleteUser } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { exportToExcel } from '@/lib/export';
import type { Employee, Employer } from '@/types';
import { Search, Users, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, Download } from 'lucide-react';

interface UsersPageProps {
  userType: 'employees' | 'employers';
}

export function UsersPage({ userType }: UsersPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const role = userType === 'employees' ? 'employee' : 'employer';
  const title = userType === 'employees' ? 'Job Seekers' : 'Employers';

  const employeesQuery = useAdminEmployees({ page, limit: 15, search: debouncedSearch || undefined });
  const employersQuery = useAdminEmployers({ page, limit: 15, search: debouncedSearch || undefined });
  const { data, isLoading } = userType === 'employees' ? employeesQuery : employersQuery;

  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const deleteMutation = useDeleteUser();

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <Text variant="h2">{title}</Text>
          <div className="flex items-center gap-3">
            {data?.data && data.data.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download />}
                onClick={() => {
                  const exportData = data.data.map((u: Employee | Employer) => ({
                    Name: `${u.firstName} ${u.lastName}`,
                    Email: u.email,
                    Phone: u.phone || '',
                    Status: u.isSuspended ? 'Suspended' : u.isActive ? 'Active' : 'Inactive',
                    Joined: new Date(u.createdAt).toLocaleDateString(),
                  }));
                  exportToExcel(exportData, `${userType}-export`);
                }}
              >
                Export
              </Button>
            )}
            {data?.pagination && <Text variant="body-sm" color="muted">{data.pagination.total} total</Text>}
          </div>
        </div>

        <Input placeholder={`Search ${title.toLowerCase()}...`} leftIcon={<Search />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState icon={<Users />} title={`No ${title.toLowerCase()} found`} />
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">User</th>
                  <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Email</th>
                  <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user: Employee | Employer) => (
                  <tr key={user._id} className="border-b border-border last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors" onClick={() => window.location.href = `/admin/users/${role}/${user._id}`}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src={user.avatar} fallback={`${user.firstName} ${user.lastName}`} />
                        <Text variant="body-sm" className="font-medium">{user.firstName} {user.lastName}</Text>
                      </div>
                    </td>
                    <td className="py-3"><Text variant="body-sm" color="secondary">{user.email}</Text></td>
                    <td className="py-3">
                      {user.isSuspended ? <Badge variant="danger" size="sm">Suspended</Badge> : user.isActive ? <Badge variant="success" size="sm" dot>Active</Badge> : <Badge variant="default" size="sm">Inactive</Badge>}
                    </td>
                    <td className="py-3 hidden sm:table-cell"><Text variant="caption" color="muted">{new Date(user.createdAt).toLocaleDateString()}</Text></td>
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <Dropdown trigger={<Button variant="ghost" size="icon-xs"><MoreHorizontal className="size-4" /></Button>} align="end">
                        {user.isSuspended ? (
                          <DropdownItem icon={<CheckCircle />} onClick={() => reactivateMutation.mutate({ role, userId: user._id })}>Reactivate</DropdownItem>
                        ) : (
                          <DropdownItem icon={<Ban />} onClick={() => suspendMutation.mutate({ role, userId: user._id })}>Suspend</DropdownItem>
                        )}
                        <DropdownSeparator />
                        <DropdownItem icon={<Trash2 />} destructive onClick={() => {
                          setUserToDelete(user._id);
                          document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                        }}>Delete</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" /></Button>
            <Text variant="body-sm" color="muted" className="px-3">{data.pagination.page} / {data.pagination.pages}</Text>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4" /></Button>
          </div>
        )}
      </Stack>

      <Modal open={!!userToDelete} onClose={() => setUserToDelete(null)}>
        <ModalHeader onClose={() => setUserToDelete(null)}>Confirm Deletion</ModalHeader>
        <ModalBody>
          <Text variant="body" color="secondary">
            Are you sure you want to delete this user? This action cannot be undone and all their data will be permanently removed.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setUserToDelete(null)}>Cancel</Button>
          <Button 
            variant="danger" 
            loading={deleteMutation.isPending} 
            onClick={() => {
              if (userToDelete) {
                deleteMutation.mutate({ role, userId: userToDelete }, {
                  onSuccess: () => setUserToDelete(null)
                });
              }
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}
