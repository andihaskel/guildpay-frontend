'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Member {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  roleColor: string;
  status: 'active' | 'canceled' | 'expired';
  renewalDate: string;
  renewalInfo?: string;
  joinedDate: string;
}

export default function MembersPage() {
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort by Renewal');
  const [currentPage, setCurrentPage] = useState(1);

  const members: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahj',
      email: 'sarah.johnson@email.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'Premium Member',
      roleColor: 'bg-purple-500',
      status: 'active',
      renewalDate: 'Mar 15, 2024',
      renewalInfo: 'Renews in 5 days',
      joinedDate: 'Jan 12, 2024'
    },
    {
      id: '2',
      name: 'Mike Chen',
      username: '@mikechen',
      email: 'mike.chen@email.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      role: 'VIP Member',
      roleColor: 'bg-yellow-500',
      status: 'canceled',
      renewalDate: 'Expired',
      joinedDate: 'Dec 8, 2023'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      username: '@emmaw',
      email: 'emma.wilson@email.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      role: 'Supporter',
      roleColor: 'bg-blue-500',
      status: 'active',
      renewalDate: 'Apr 2, 2024',
      renewalInfo: 'Renews in 23 days',
      joinedDate: 'Feb 2, 2024'
    }
  ];

  const totalMembers = 47;
  const membersPerPage = 3;
  const totalPages = Math.ceil(totalMembers / membersPerPage);

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/30">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Member</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Renewal Date</th>
                <th className="py-4 px-6 font-medium uppercase tracking-wider">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm">{member.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.roleColor}`} />
                      <span className="text-sm">{member.role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {member.status === 'canceled' || member.status === 'expired' ? (
                          <span className="text-muted-foreground">{member.renewalDate}</span>
                        ) : (
                          member.renewalDate
                        )}
                      </span>
                      {member.renewalInfo && (
                        <span className="text-xs text-green-500">{member.renewalInfo}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground">{member.joinedDate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing 1 to {membersPerPage} of {totalMembers} members
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
          {[1, 2, 3].map((page) => (
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
    </div>
  );
}
