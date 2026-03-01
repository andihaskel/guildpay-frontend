'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { Member } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

export default function MembersPage() {
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort by Renewal');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentProduct?.id) {
      loadMembers();
    }
  }, [currentProduct?.id]);

  const loadMembers = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);
      const membersData = await api.getMembers(currentProduct.id);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalMembers = members.length;
  const membersPerPage = 10;
  const totalPages = Math.ceil(totalMembers / membersPerPage);
  const paginatedMembers = members.slice(
    (currentPage - 1) * membersPerPage,
    currentPage * membersPerPage
  );

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>;
    } else if (status === 'canceled') {
      return <Badge variant="secondary" className="bg-red-600/20 text-red-400 hover:bg-red-600/20">Canceled</Badge>;
    }
    return <Badge variant="secondary">Expired</Badge>;
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
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/40 border-slate-800/50"
          />
        </div>
        <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
          {roleFilter}
        </Button>
        <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
          {statusFilter}
        </Button>
        <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
          {sortBy}
        </Button>
      </div>

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.discordAvatar && (
                            <AvatarImage
                              src={`https://cdn.discordapp.com/avatars/${member.discordUserId}/${member.discordAvatar}.png`}
                              alt={member.discordUsername}
                            />
                          )}
                          <AvatarFallback>
                            {member.discordUsername[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{member.discordUsername}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.roleName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(member.currentPeriodEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(member.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!isLoading && members.length > 0 && (
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
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
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
            ))}
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
    </div>
  );
}
