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
  const [pageFilter, setPageFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [accessStatusFilter, setAccessStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const membersPerPage = 20;

  useEffect(() => {
    if (currentProduct?.id) {
      loadPages();
    }
  }, [currentProduct?.id]);

  useEffect(() => {
    if (currentProduct?.id) {
      loadMembers();
    }
  }, [currentProduct?.id, currentPage, searchQuery, pageFilter, paymentStatusFilter, accessStatusFilter]);

  const loadPages = async () => {
    if (!currentProduct?.id) return;

    try {
      const pagesData = await api.getPages(currentProduct.id);
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadMembers = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        page_id?: string;
        payment_status?: string;
        access_status?: string;
        email?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
      } = {
        page: currentPage,
        limit: membersPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (pageFilter) params.page_id = pageFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (accessStatusFilter) params.access_status = accessStatusFilter;
      if (searchQuery) params.email = searchQuery;

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

  const totalPages = Math.ceil(totalMembers / membersPerPage);

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>;
    } else if (status === 'trialing') {
      return <Badge variant="secondary" className="bg-sky-600/20 text-sky-400 hover:bg-sky-600/20">Trialing</Badge>;
    } else if (status === 'canceling') {
      return <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 hover:bg-orange-600/20">Canceling</Badge>;
    } else if (status === 'free') {
      return <Badge variant="secondary" className="bg-slate-600/20 text-slate-400 hover:bg-slate-600/20">Free</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const getAccessStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>;
    } else if (status === 'onboarding') {
      return <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 hover:bg-orange-600/20">Onboarding</Badge>;
    } else if (status === 'free') {
      return <Badge variant="secondary" className="bg-slate-600/20 text-slate-400 hover:bg-slate-600/20">Free</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilter = (status: string) => {
    setPaymentStatusFilter(status === paymentStatusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleAccessStatusFilter = (status: string) => {
    setAccessStatusFilter(status === accessStatusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handlePageFilter = (pageId: string) => {
    setPageFilter(pageId === pageFilter ? '' : pageId);
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

  const getSelectedPageName = () => {
    if (!pageFilter) return 'All Pages';
    const page = pages.find((p) => p.id === pageFilter);
    return page?.offer_name || 'All Pages';
  };

  const getSelectedPaymentStatusName = () => {
    if (!paymentStatusFilter) return 'Payment Status';
    return paymentStatusFilter.charAt(0).toUpperCase() + paymentStatusFilter.slice(1);
  };

  const getSelectedAccessStatusName = () => {
    if (!accessStatusFilter) return 'Access Status';
    return accessStatusFilter.charAt(0).toUpperCase() + accessStatusFilter.slice(1);
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
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-slate-900/40 border-slate-800/50"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
              <Filter className="h-4 w-4 mr-2" />
              {getSelectedPageName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handlePageFilter('')}>
              All Pages
            </DropdownMenuItem>
            {pages?.map((page) => (
              <DropdownMenuItem
                key={page.id}
                onClick={() => handlePageFilter(page.id)}
              >
                {page.offer_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
              <Filter className="h-4 w-4 mr-2" />
              {getSelectedPaymentStatusName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handlePaymentStatusFilter('')}>
              All Payment Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePaymentStatusFilter('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePaymentStatusFilter('trialing')}>
              Trialing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePaymentStatusFilter('canceling')}>
              Canceling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePaymentStatusFilter('free')}>
              Free
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
              <Filter className="h-4 w-4 mr-2" />
              {getSelectedAccessStatusName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleAccessStatusFilter('')}>
              All Access Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAccessStatusFilter('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAccessStatusFilter('onboarding')}>
              Onboarding
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAccessStatusFilter('free')}>
              Free
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
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Price</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Payment Status</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Access Status</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Renewal Date</th>
                  <th className="py-4 px-6 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members?.map((member) => (
                  <tr key={member.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{member.email}</div>
                        {member.discord_user_id && (
                          <div className="text-xs text-muted-foreground">
                            Discord: {member.discord_user_id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm">{member.role_name || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium">{formatPrice(member.price)}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getPaymentStatusBadge(member.payment_status)}
                    </td>
                    <td className="py-4 px-6">
                      {getAccessStatusBadge(member.access_status)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm">
                        {formatDate(member.current_period_end)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {member.access_status === 'onboarding' && member.discord_connect_url && (
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
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
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
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
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
        <DialogContent className="bg-slate-900 border-slate-800 max-w-xl">
          <DialogHeader>
            <DialogTitle>Share Discord Connection Link</DialogTitle>
            <DialogDescription>
              This member has completed payment but hasn't connected their Discord account yet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-primary/8 border border-primary/20 rounded-lg">
              <p className="text-sm text-slate-300">
                Send this link to <strong>{selectedMember?.email}</strong> so they can connect their Discord account and gain access to the server.
              </p>
            </div>

            {selectedMember?.discord_connect_url && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Discord Connect Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={selectedMember.discord_connect_url}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 font-mono text-xs"
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
                  Once they click this link and authorize Discord, they'll automatically receive their role and access.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
