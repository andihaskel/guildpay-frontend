'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, Shield, Eye, Edit, Trash2, Plus, Search, Check, ArrowRight, CreditCard, UserPlus, GraduationCap } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MonetizedRole {
  id: string;
  guild: string;
  role: string;
  icon: string;
  price: number;
  members: number;
  memberChange: string;
  revenue: number;
  status: 'active' | 'disabled';
  created: string;
}

interface RecentMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'active' | 'canceled';
  expires: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [guildFilter, setGuildFilter] = useState('All Guilds');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showEmptyState, setShowEmptyState] = useState(false);

  const stats = [
    {
      title: 'Active Roles',
      value: '12',
      change: '+2 this month',
      changeType: 'positive' as const,
      icon: Shield,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Members',
      value: '1,247',
      change: '+89 this week',
      changeType: 'positive' as const,
      icon: Users,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Monthly Revenue',
      value: '$8,456',
      change: '+12.5% vs last month',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Active Guilds',
      value: '3',
      change: 'No change',
      changeType: 'neutral' as const,
      icon: Shield,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
    },
  ];

  const monetizedRoles: MonetizedRole[] = [
    {
      id: '1',
      guild: 'Gaming Community',
      role: '@VIP Member',
      icon: '🎮',
      price: 9.99,
      members: 247,
      memberChange: '+12 this week',
      revenue: 2467,
      status: 'active',
      created: 'Jan 15, 2024',
    },
    {
      id: '2',
      guild: 'Creative Hub',
      role: '@Pro Creator',
      icon: '🎨',
      price: 19.99,
      members: 156,
      memberChange: '+8 this week',
      revenue: 3118,
      status: 'active',
      created: 'Dec 8, 2023',
    },
    {
      id: '3',
      guild: 'Tech Talks',
      role: '@Premium Access',
      icon: '💻',
      price: 4.99,
      members: 89,
      memberChange: '-3 this week',
      revenue: 444,
      status: 'disabled',
      created: 'Nov 22, 2023',
    },
  ];

  const recentMembers: RecentMember[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      avatar: '',
      role: '@VIP Member',
      status: 'active',
      expires: 'Expires Feb 15, 2024',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      avatar: '',
      role: '@Pro Creator',
      status: 'active',
      expires: 'Expires Mar 8, 2024',
    },
    {
      id: '3',
      name: 'David Chen',
      email: 'david.chen@email.com',
      avatar: '',
      role: '@VIP Member',
      status: 'canceled',
      expires: 'Canceled Jan 30, 2024',
    },
  ];

  if (showEmptyState) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your monetized Discord roles and subscriptions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="bg-slate-800/50 border-slate-700/50"
          >
            Show Dashboard
          </Button>
        </div>

        <Card className="p-12 bg-gradient-to-br from-purple-600 to-blue-600 border-0">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your server is ready 🚀
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Create your first paid role and start accepting subscriptions.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-lg">Server connected</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-lg">Bot installed</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border-2 border-white/60" />
                </div>
                <span className="text-lg">Create your first paid role</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90" onClick={() => router.push('/dashboard/roles')}>
                Create Your First Role
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                See how it works
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-muted-foreground">Active Roles</p>
              <div className="p-2 rounded-lg bg-slate-800">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-4xl font-semibold mb-2">0</p>
            <p className="text-sm text-muted-foreground">Ready to create your first</p>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-muted-foreground">Paying Members</p>
              <div className="p-2 rounded-lg bg-slate-800">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-4xl font-semibold mb-2">0</p>
            <p className="text-sm text-muted-foreground">Your subscribers will appear here</p>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-muted-foreground">Revenue This Month</p>
              <div className="p-2 rounded-lg bg-slate-800">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-4xl font-semibold mb-2">$0</p>
            <p className="text-sm text-muted-foreground">Start earning today</p>
          </Card>
        </div>

        <Card className="p-6 bg-slate-900/40 border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ArrowRight className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">Next Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Connect Stripe</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Enable subscription payments to start earning from your community.
              </p>
              <Button variant="outline" className="w-full bg-slate-700/50 border-slate-600/50">
                Connect Stripe
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-blue-500/50 relative">
              <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                Recommended
              </Badge>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Create Your First Role</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set pricing and link a Stripe plan to a Discord role.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboard/roles')}>
                Create Role
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Learn How Monetization Works</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Understand the full process from setup to earning your first dollar.
              </p>
              <Button variant="outline" className="w-full bg-slate-700/50 border-slate-600/50">
                View Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your monetized Discord roles and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="bg-slate-800/50 border-slate-700/50"
          >
            Switch to Empty State
          </Button>
          <Button size="lg" onClick={() => router.push('/dashboard/roles')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-slate-900/40 border-slate-800/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-semibold mb-2">{stat.value}</p>
            <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-muted-foreground'}`}>
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles or guilds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/40 border-slate-800/50"
          />
        </div>
        <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
          {guildFilter}
        </Button>
        <Button variant="outline" className="bg-slate-900/40 border-slate-800/50">
          {statusFilter}
        </Button>
      </div>

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold">Monetized Roles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-3 px-6 font-medium">Guild & Role</th>
                <th className="py-3 px-6 font-medium">Price</th>
                <th className="py-3 px-6 font-medium">Members</th>
                <th className="py-3 px-6 font-medium">Revenue</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Created</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {monetizedRoles.map((role) => (
                <tr key={role.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                        {role.icon}
                      </div>
                      <div>
                        <p className="font-medium">{role.guild}</p>
                        <p className="text-sm text-purple-400">{role.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold">${role.price}</p>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold">{role.members}</p>
                      <p className={`text-sm ${role.memberChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {role.memberChange}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold">${role.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={role.status === 'active' ? 'default' : 'secondary'}
                      className={role.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}
                    >
                      {role.status === 'active' ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-muted-foreground">{role.created}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Members</h2>
          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700/50">
            All Roles
          </Button>
        </div>
        <div className="divide-y divide-slate-800/50">
          {recentMembers.map((member) => (
            <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-400 font-medium mb-1">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.expires}</p>
              </div>
              <Badge
                variant={member.status === 'active' ? 'default' : 'secondary'}
                className={member.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}
              >
                {member.status === 'active' ? 'Active' : 'Canceled'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
