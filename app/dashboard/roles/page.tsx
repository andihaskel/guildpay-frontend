'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Pause, Trash2, Play, UserPlus, Check } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonetizedRole {
  id: string;
  name: string;
  color: string;
  price: string;
  interval: string;
  members: number;
  memberChange: number;
  revenue: number;
  status: 'active' | 'disabled';
  created: string;
}

export default function RolesPage() {
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Sort by Revenue');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [selectedDiscordRole, setSelectedDiscordRole] = useState('');
  const [selectedStripePrice, setSelectedStripePrice] = useState('');

  const roles: MonetizedRole[] = [
    {
      id: '1',
      name: 'VIP Member',
      color: 'bg-yellow-500',
      price: '$25',
      interval: 'month',
      members: 142,
      memberChange: 12,
      revenue: 3550,
      status: 'active',
      created: 'Mar 15, 2024'
    },
    {
      id: '2',
      name: 'Premium Access',
      color: 'bg-purple-500',
      price: '$15',
      interval: 'month',
      members: 89,
      memberChange: 7,
      revenue: 1335,
      status: 'active',
      created: 'Feb 8, 2024'
    },
    {
      id: '3',
      name: 'Supporter',
      color: 'bg-blue-500',
      price: '$5',
      interval: 'month',
      members: 256,
      memberChange: 18,
      revenue: 1280,
      status: 'active',
      created: 'Jan 12, 2024'
    },
    {
      id: '4',
      name: 'Elite Gaming',
      color: 'bg-red-500',
      price: '$50',
      interval: 'month',
      members: 0,
      memberChange: 0,
      revenue: 0,
      status: 'disabled',
      created: 'Apr 2, 2024'
    }
  ];

  if (showEmptyState) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Monetized Roles</h1>
            <p className="text-muted-foreground">
              Create subscription-based roles for this server.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmptyState(false)}
            className="bg-slate-800/50 border-slate-700/50"
          >
            Show Roles
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No monetized roles yet</h2>
          <p className="text-muted-foreground mb-8">
            Create a paid role to start accepting subscriptions.
          </p>
          <Button size="lg" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Role
          </Button>
        </div>

        <Card className="p-8 bg-slate-900/40 border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">How it works</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Select a Discord role</h4>
              <p className="text-sm text-muted-foreground">
                Choose an existing role from your server
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Connect or choose a Stripe price</h4>
              <p className="text-sm text-muted-foreground">
                Set your subscription pricing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Members automatically receive access</h4>
              <p className="text-sm text-muted-foreground">
                Subscribers get the role instantly
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Monetized Roles</h1>
          <p className="text-muted-foreground">
            Manage subscription-based roles for this server.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmptyState(true)}
            className="bg-slate-800/50 border-slate-700/50"
          >
            Show Empty State
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Role
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/40 border-slate-800/50"
          />
        </div>
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
                <th className="py-4 px-6 font-medium">Role Name</th>
                <th className="py-4 px-6 font-medium">Price</th>
                <th className="py-4 px-6 font-medium">Active Members</th>
                <th className="py-4 px-6 font-medium">Revenue</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Created</th>
                <th className="py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium">{role.price} / {role.interval}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.members}</span>
                      {role.memberChange > 0 && (
                        <span className="text-xs text-green-500">+{role.memberChange}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-green-500">${role.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    {role.status === 'active' ? (
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">Disabled</Badge>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground">{role.created}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        {role.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
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

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Monetized Role</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Map a Discord role to a Stripe subscription
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Card className="p-3 bg-slate-800/50 border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SELECTED SERVER</p>
                  <p className="text-sm font-semibold">Gaming Community</p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Select Discord Role</h3>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Discord Role</label>
                    <Select value={selectedDiscordRole} onValueChange={setSelectedDiscordRole}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                        <SelectValue placeholder="Choose a role..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="vip">VIP Member</SelectItem>
                        <SelectItem value="premium">Premium Access</SelectItem>
                        <SelectItem value="supporter">Supporter</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the role members will receive upon subscription
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Select Stripe Price</h3>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Stripe Subscription Price</label>
                    <Select value={selectedStripePrice} onValueChange={setSelectedStripePrice}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
                        <SelectValue placeholder="Select a price..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="price_1">$10.00 / month</SelectItem>
                        <SelectItem value="price_2">$25.00 / month</SelectItem>
                        <SelectItem value="price_3">$50.00 / month</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose an existing Stripe price from your connected account
                    </p>
                  </div>
                  <Card className="p-3 bg-slate-800/30 border-slate-700/50">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-0.5">Need to create a new price?</p>
                        <p className="text-xs text-muted-foreground">
                          Visit your <span className="text-blue-400 underline cursor-pointer">Stripe Dashboard</span> to create new subscription prices
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">Configuration Summary</h3>
                  {selectedDiscordRole && selectedStripePrice ? (
                    <Card className="p-3 bg-slate-800/30 border-slate-700/50 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stripe Price</span>
                        <span className="font-medium">$10.00 / month</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Server</span>
                        <span className="font-medium">Gaming Community</span>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t border-slate-700/50">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-green-500">Ready to Create</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Members who subscribe to this price will automatically receive the VIP Member role
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-3 bg-slate-800/30 border-slate-700/50">
                      <p className="text-sm text-muted-foreground">
                        Complete the steps above to see your configuration summary
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="bg-slate-800/50 border-slate-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowCreateModal(false)}
                disabled={!selectedDiscordRole || !selectedStripePrice}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Monetized Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
