'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader as Loader2, Filter, Share2, Copy, Check } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Member, Role } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

export default function MembersPage() {
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const membersPerPage = 20;

  useEffect(() => {
    if (currentProduct?.id) {
      loadRoles();
    }
  }, [currentProduct?.id]);

  useEffect(() => {
    if (currentProduct?.id) {
      loadMembers();
    }
  }, [currentProduct?.id, currentPage, searchQuery, roleFilter, statusFilter]);

  const loadRoles = async () => {
    if (!currentProduct?.id) return;

    try {
      const rolesData = await api.getRoles(currentProduct.id);
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadMembers = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: string;
        role_id?: string;
        search?: string;
      } = {
        page: currentPage,
        limit: membersPerPage,
      };

      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role_id = roleFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.getMembers(currentProduct.id, params);
      setMembers(response.members);
      setTotalMembers(response.total);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const getRoleName = (roleIdentifier?: string) => {
    if (!roleIdentifier) return 'Unknown Role';
    const role = roles.find(r => r.id === roleIdentifier);
    return role?.name || 'Unknown Role';
  };

  const totalPages = Math.ceil(totalMembers / membersPerPage);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>;
    } else if (status === 'pending_discord') {
      return <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 hover:bg-orange-600/20">Pending Discord</Badge>;
    } else if (status === 'pending_stripe') {
      return <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/20">Pending Stripe</Badge>;
    } else if (status === 'canceled') {
      return <Badge variant="secondary" className="bg-red-600/20 text-red-400 hover:bg-red-600/20">Canceled</Badge>;
    } else if (status === 'past_due') {
      return <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/20">Past Due</Badge>;
    } else if (status === 'trialing') {
      return <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/20">Trialing</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleRoleFilter = (roleId: string) => {
    setRoleFilter(roleId === roleFilter ? '' : roleId);
    setCurrentPage(1);
  };

  const handleShareClick = (member: Member) => {
    setSelectedMember(member);
    setShareDialogOpen(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSelectedRoleName = () => {
    if (!roleFilter) return 'All Roles';
    const role = roles.find((r) => r.id === roleFilter);
    return role?.name || 'All Roles';
  };

  const getSelectedStatusName = () => {
    if (!statusFilter) return 'All Status';
    return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Members</h1>
        <p className="text-muted-foreground">
          Manage subscribers for this server.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Discord username or ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-slate-900/40 border-slate-800/50"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
              <Filter className="h-4 w-4 mr-2" />
              {getSelectedRoleName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleRoleFilter('')}>
              All Roles
            </DropdownMenuItem>
            {roles?.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => handleRoleFilter(role.id)}
              >
                {role.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
              <Filter className="h-4 w-4 mr-2" />
              {getSelectedStatusName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleStatusFilter('')}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('canceled')}>
              Canceled
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('past_due')}>
              Past Due
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter('trialing')}>
              Trialing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : totalMembers === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Members will appear here when they subscribe to your roles"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Member</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Renewal Date</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Joined Date</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members?.map((member) => (
                  <tr key={member.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.discord_avatar && member.discord_user_id && (
                            <AvatarImage
                              src={`https://cdn.discordapp.com/avatars/${member.discord_user_id}/${member.discord_avatar}.png`}
                              alt={member.discord_username || member.email || 'User'}
                            />
                          )}
                          <AvatarFallback>
                            {(member.discord_username?.[0] || member.email?.[0] || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {member.discord_username || member.email || 'Unknown User'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.discord_user_id || member.email || 'No identifier'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{getRoleName(member.role_identifier)}</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(member.price)}/mo</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(member.current_period_end)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(member.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(member.discord_connect_url || member.checkout_url) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareClick(member)}
                          className="gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!isLoading && totalMembers > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * membersPerPage + 1} to{' '}
            {Math.min(currentPage * membersPerPage, totalMembers)} of {totalMembers} members
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-slate-900/40 border-slate-800/50"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {totalPages <= 5 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  className={`h-9 w-9 ${
                    currentPage === page
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-900/40 border-slate-800/50'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))
            ) : (
              <>
                {currentPage > 2 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-slate-900/40 border-slate-800/50"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>
                    {currentPage > 3 && <span className="px-2">...</span>}
                  </>
                )}

                {Array.from({ length: 3 }, (_, i) => {
                  const page = currentPage === 1 ? i + 1 : currentPage === totalPages ? totalPages - 2 + i : currentPage - 1 + i;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="icon"
                      className={`h-9 w-9 ${
                        currentPage === page
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-900/40 border-slate-800/50'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-slate-900/40 border-slate-800/50"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-slate-900/40 border-slate-800/50"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Share Links</DialogTitle>
            <DialogDescription>
              Share these links with {selectedMember?.email || selectedMember?.discord_username || 'the member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedMember?.discord_connect_url && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Discord Connect Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={selectedMember.discord_connect_url}
                    readOnly
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedMember.discord_connect_url!, 'discord')}
                    className="shrink-0"
                  >
                    {copiedField === 'discord' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link allows the user to connect their Discord account
                </p>
              </div>
            )}
            {selectedMember?.checkout_url && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Checkout Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={selectedMember.checkout_url}
                    readOnly
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedMember.checkout_url!, 'checkout')}
                    className="shrink-0"
                  >
                    {copiedField === 'checkout' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link takes the user to complete their payment
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
