'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function EditPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id');
  const isEditing = !!pageId;

  const [formData, setFormData] = useState({
    offerImage: '',
    offerUrl: '',
    offerName: '',
    businessName: '',
    description: '',
    price: '30.00',
    currency: 'USD',
    interval: 'Monthly',
    freeTrialPeriod: 'None',
    yearlyOption: 'yes',
    yearlyPrice: '300.00',
    welcomeChannel: 'welcome',
    roleToAssign: 'premium',
    mediaGalleryEnabled: false,
    couponsEnabled: false,
    cryptoEnabled: false,
    requireNameOnCard: false,
    termsAndConditions: false,
    businessFeatures: [
      { id: '1', icon: '💬', title: 'Access to Group Chats:', description: 'Join a private space where you can participate in group conversations with other members.' },
      { id: '2', icon: '⚡', title: 'Real-Time Updates:', description: 'Stay connected with instant messages and updates from the community.' },
      { id: '3', icon: '🔒', title: 'Community-Only Content:', description: 'Get access to conversations, resources, and discussions available exclusively to members.' },
    ],
  });

  const [premiumFeaturesOpen, setPremiumFeaturesOpen] = useState(true);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard/pages/preview' + (pageId ? `?id=${pageId}` : ''));
  };

  const addBusinessFeature = () => {
    setFormData({
      ...formData,
      businessFeatures: [
        ...formData.businessFeatures,
        { id: Date.now().toString(), icon: '✨', title: '', description: '' }
      ]
    });
  };

  const removeBusinessFeature = (id: string) => {
    setFormData({
      ...formData,
      businessFeatures: formData.businessFeatures.filter(f => f.id !== id)
    });
  };

  const updateBusinessFeature = (id: string, field: 'title' | 'description', value: string) => {
    setFormData({
      ...formData,
      businessFeatures: formData.businessFeatures.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => router.push('/dashboard/pages')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pages
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">
            {isEditing ? 'Edit your LaunchPass!' : 'Create your LaunchPass!'}
          </h1>
          <p className="text-muted-foreground text-lg">
            This info will show on your signup page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <h2 className="text-xl font-semibold mb-6">Product Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="mb-3 block">Offer Image</Label>
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center cursor-pointer bg-slate-800/50">
                  {formData.offerImage ? (
                    <img src={formData.offerImage} alt="Offer" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Upload className="h-8 w-8 text-slate-500" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <Label htmlFor="offerUrl" className="mb-3 block">Offer URL</Label>
                <Input
                  id="offerUrl"
                  value={formData.offerUrl}
                  onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                  placeholder="artistry-collective"
                  className="mb-2 bg-slate-800/50 border-slate-700"
                />
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  🔗 launchpass.com/testandi/{formData.offerUrl || 'artistry-collective'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="offerName" className="mb-3 block">Offer Name</Label>
                <Input
                  id="offerName"
                  value={formData.offerName}
                  onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
                  placeholder="Artistry Collective"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div>
                <Label htmlFor="businessName" className="mb-3 block">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="testandi"
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label>Media Gallery</Label>
                  <Switch
                    checked={formData.mediaGalleryEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, mediaGalleryEnabled: checked })}
                  />
                </div>
                <p className="text-sm text-slate-400">
                  Add a carousel with multiple images and videos to your signup page.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <h2 className="text-xl font-semibold mb-6">Business Features</h2>

            <div className="space-y-4 mb-4">
              {formData.businessFeatures.map((feature, index) => (
                <Card key={feature.id} className="p-4 bg-slate-800/40 border-slate-700/50">
                  <div className="flex gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-slate-700/50 rounded-lg mt-1">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input
                          value={feature.title}
                          onChange={(e) => updateBusinessFeature(feature.id, 'title', e.target.value)}
                          placeholder="Feature title"
                          className="bg-slate-900/50 border-slate-600"
                        />
                        <Textarea
                          value={feature.description}
                          onChange={(e) => updateBusinessFeature(feature.id, 'description', e.target.value)}
                          placeholder="Feature description"
                          rows={2}
                          className="bg-slate-900/50 border-slate-600 resize-none"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBusinessFeature(feature.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-slate-700 hover:border-slate-600"
              onClick={addBusinessFeature}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a new feature
            </Button>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <h2 className="text-xl font-semibold mb-6">Description</h2>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
            />
            <p className="text-sm text-slate-400 mt-3">
              Describe your community: what it is, what it offers, the benefits of joining. Be descriptive!
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <h2 className="text-xl font-semibold mb-6">Price and Period</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="mb-3 block">What You'll Charge</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-slate-800/50 border-slate-700"
                    step="0.01"
                  />
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="w-24 bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })}>
                    <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Enter the price and currency you would like to charge and select a subscription period.
                </p>
              </div>

              <div>
                <Label className="mb-3 block">Free Trial Period</Label>
                <Select value={formData.freeTrialPeriod} onValueChange={(value) => setFormData({ ...formData, freeTrialPeriod: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="14 days">14 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Yearly option?</Label>
              <RadioGroup value={formData.yearlyOption} onValueChange={(value) => setFormData({ ...formData, yearlyOption: value })}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-slate-800/40 border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="no-yearly" />
                      <Label htmlFor="no-yearly" className="cursor-pointer flex-1">No yearly option</Label>
                    </div>
                  </Card>
                  <Card className="p-4 bg-slate-800/40 border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="yes-yearly" />
                      <Label htmlFor="yes-yearly" className="cursor-pointer">Yes, priced at</Label>
                      <Input
                        type="number"
                        value={formData.yearlyPrice}
                        onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                        className="w-32 bg-slate-900/50 border-slate-600"
                        step="0.01"
                        disabled={formData.yearlyOption === 'no'}
                      />
                    </div>
                  </Card>
                </div>
              </RadioGroup>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <h2 className="text-xl font-semibold mb-6">Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="welcomeChannel" className="mb-3 block">Welcome Channel</Label>
                <Select value={formData.welcomeChannel} onValueChange={(value) => setFormData({ ...formData, welcomeChannel: value })}>
                  <SelectTrigger id="welcomeChannel" className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">welcome</SelectItem>
                    <SelectItem value="general">general</SelectItem>
                    <SelectItem value="announcements">announcements</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-400 mt-2">
                  Select the channel where users will be sent when they open your discord from launchpass.
                </p>
              </div>

              <div>
                <Label htmlFor="roleToAssign" className="mb-3 block">Role to Assign</Label>
                <Select value={formData.roleToAssign} onValueChange={(value) => setFormData({ ...formData, roleToAssign: value })}>
                  <SelectTrigger id="roleToAssign" className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">premium</SelectItem>
                    <SelectItem value="member">member</SelectItem>
                    <SelectItem value="subscriber">subscriber</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-400 mt-2">
                  Select the role that will be assigned after payment.
                </p>
              </div>
            </div>
          </Card>

          <Collapsible open={premiumFeaturesOpen} onOpenChange={setPremiumFeaturesOpen}>
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                <h2 className="text-xl font-semibold">Premium Features</h2>
                <Plus className={`h-5 w-5 transition-transform ${premiumFeaturesOpen ? 'rotate-45' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="coupons" className="cursor-pointer">Coupons Enabled</Label>
                    <Switch
                      id="coupons"
                      checked={formData.couponsEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, couponsEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireName" className="cursor-pointer">Require Name on card</Label>
                    <Switch
                      id="requireName"
                      checked={formData.requireNameOnCard}
                      onCheckedChange={(checked) => setFormData({ ...formData, requireNameOnCard: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crypto" className="cursor-pointer">Crypto Enabled</Label>
                    <Switch
                      id="crypto"
                      checked={formData.cryptoEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, cryptoEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="terms" className="cursor-pointer">Terms & Conditions</Label>
                    <Switch
                      id="terms"
                      checked={formData.termsAndConditions}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAndConditions: checked })}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen}>
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                <h2 className="text-xl font-semibold">Advanced Settings</h2>
                <Plus className={`h-5 w-5 transition-transform ${advancedSettingsOpen ? 'rotate-45' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <p className="text-sm text-slate-400">Advanced configuration options will appear here.</p>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                className="bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20"
              >
                Delete Page
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700"
                onClick={() => router.push('/dashboard/pages')}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Next: Preview your signup page
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
