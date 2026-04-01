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
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { useProduct } from '@/contexts';
import { api } from '@/lib/api';
import { DiscordRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EditPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProduct } = useProduct();
  const { toast } = useToast();
  const pageId = searchParams.get('id');
  const isEditing = !!pageId;

  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [initialImageSeed, setInitialImageSeed] = useState('default');

  const [formData, setFormData] = useState({
    offerImage: 'https://api.dicebear.com/9.x/shapes/svg?seed=default',
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
    roleToAssign: '',
    mediaGalleryEnabled: false,
    couponsEnabled: false,
    cryptoEnabled: false,
    requireNameOnCard: false,
    termsAndConditions: false,
    isActive: true,
    businessFeatures: [
      { id: '1', icon: '💬', title: 'Access to Group Chats:', description: 'Join a private space where you can participate in group conversations with other members.' },
      { id: '2', icon: '⚡', title: 'Real-Time Updates:', description: 'Stay connected with instant messages and updates from the community.' },
      { id: '3', icon: '🔒', title: 'Community-Only Content:', description: 'Get access to conversations, resources, and discussions available exclusively to members.' },
    ],
  });

  const [premiumFeaturesOpen, setPremiumFeaturesOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);

  useEffect(() => {
    const loadDiscordRoles = async () => {
      if (!currentProduct?.id) return;

      try {
        setIsLoadingRoles(true);
        const overview = await api.getProductOverview(currentProduct.id);

        if (overview.discord_guild_id) {
          const roles = await api.getDiscordGuildRoles(overview.discord_guild_id);
          setDiscordRoles(roles);
        }
      } catch (error) {
        console.error('Failed to load Discord roles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Discord roles',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadDiscordRoles();
  }, [currentProduct]);

  useEffect(() => {
    const loadPageData = async () => {
      if (!currentProduct?.id || !pageId || !isEditing) {
        setIsLoadingPage(false);
        return;
      }

      try {
        setIsLoadingPage(true);
        const pageData = await api.getPage(currentProduct.id, pageId);

        const trialDaysMap: Record<number, string> = {
          0: 'None',
          7: '7 days',
          14: '14 days',
          30: '30 days',
        };

        const imageSeed = pageData.hero_image_url?.includes('dicebear.com')
          ? pageData.hero_image_url.split('seed=')[1] || pageData.slug
          : pageData.slug;

        setInitialImageSeed(imageSeed);
        setHasCustomImage(!pageData.hero_image_url?.includes('dicebear.com'));

        setFormData({
          offerImage: pageData.hero_image_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${imageSeed}`,
          offerUrl: pageData.slug,
          offerName: pageData.offer_name,
          businessName: currentProduct.name || '',
          description: typeof pageData.description === 'string' ? pageData.description : JSON.stringify(pageData.description),
          price: (pageData.monthly_amount_minor / 100).toFixed(2),
          currency: pageData.currency.toUpperCase(),
          interval: 'Monthly',
          freeTrialPeriod: trialDaysMap[pageData.trial_days || 0] || 'None',
          yearlyOption: pageData.yearly_amount_minor ? 'yes' : 'no',
          yearlyPrice: pageData.yearly_amount_minor ? (pageData.yearly_amount_minor / 100).toFixed(2) : '300.00',
          welcomeChannel: pageData.discord_welcome_channel_id || 'welcome',
          roleToAssign: pageData.discord_role_id,
          mediaGalleryEnabled: pageData.media_gallery_enabled,
          couponsEnabled: false,
          cryptoEnabled: false,
          requireNameOnCard: false,
          termsAndConditions: false,
          isActive: pageData.accepts_signups,
          businessFeatures: Array.isArray(pageData.features) && pageData.features.length > 0
            ? pageData.features.map((f: any, idx: number) => ({
                id: f.id || `${idx + 1}`,
                icon: f.icon || '✨',
                title: f.title || '',
                description: f.description || '',
              }))
            : [
                { id: '1', icon: '💬', title: 'Access to Group Chats:', description: 'Join a private space where you can participate in group conversations with other members.' },
                { id: '2', icon: '⚡', title: 'Real-Time Updates:', description: 'Stay connected with instant messages and updates from the community.' },
                { id: '3', icon: '🔒', title: 'Community-Only Content:', description: 'Get access to conversations, resources, and discussions available exclusively to members.' },
              ],
        });
      } catch (error) {
        console.error('Failed to load page data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load page data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadPageData();
  }, [currentProduct?.id, pageId, isEditing]);

  useEffect(() => {
    if (!hasCustomImage && !isLoadingPage) {
      const seed = encodeURIComponent(initialImageSeed);
      setFormData(prev => ({
        ...prev,
        offerImage: `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`
      }));
    }
  }, [hasCustomImage, initialImageSeed, isLoadingPage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          offerImage: reader.result as string
        }));
        setHasCustomImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.offerUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Offer URL is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.roleToAssign) {
      toast({
        title: 'Validation Error',
        description: 'Please select a role to assign',
        variant: 'destructive',
      });
      return;
    }

    const params = new URLSearchParams();
    if (pageId) params.append('id', pageId);
    params.append('data', JSON.stringify(formData));
    router.push('/dashboard/pages/preview?' + params.toString());
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

  const updateBusinessFeature = (id: string, field: 'title' | 'description' | 'icon', value: string) => {
    setFormData({
      ...formData,
      businessFeatures: formData.businessFeatures.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  if (isLoadingPage && isEditing) {
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

          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading page data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center cursor-pointer bg-slate-800/50 block"
                >
                  {formData.offerImage ? (
                    <img src={formData.offerImage} alt="Offer" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Upload className="h-8 w-8 text-slate-500" />
                  )}
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  {hasCustomImage ? 'Custom image uploaded' : 'Auto-generated from name'}
                </p>
              </div>

              <div className="flex-1">
                <Label htmlFor="offerUrl" className="mb-3 block">
                  Offer URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="offerUrl"
                  value={formData.offerUrl}
                  onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                  placeholder="artistry-collective"
                  className="mb-2 bg-slate-800/50 border-slate-700"
                  required
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
                        <div className="flex gap-2">
                          <EmojiPicker
                            value={feature.icon}
                            onChange={(emoji) => updateBusinessFeature(feature.id, 'icon', emoji)}
                          />
                          <Input
                            value={feature.title}
                            onChange={(e) => updateBusinessFeature(feature.id, 'title', e.target.value)}
                            placeholder="Feature title"
                            className="flex-1 bg-slate-900/50 border-slate-600"
                          />
                        </div>
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
                <Select
                  value={formData.freeTrialPeriod}
                  onValueChange={(value) => setFormData({ ...formData, freeTrialPeriod: value })}
                >
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
              {formData.interval === 'Yearly' && (
                <p className="text-sm text-amber-400 mb-3">
                  Yearly pricing option is not available when the base interval is set to Yearly.
                </p>
              )}
              <RadioGroup
                value={formData.yearlyOption}
                onValueChange={(value) => setFormData({ ...formData, yearlyOption: value })}
                disabled={formData.interval === 'Yearly'}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`p-4 bg-slate-800/40 border-slate-700/50 ${formData.interval === 'Yearly' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="no-yearly" disabled={formData.interval === 'Yearly'} />
                      <Label htmlFor="no-yearly" className="cursor-pointer flex-1">No yearly option</Label>
                    </div>
                  </Card>
                  <Card className={`p-4 bg-slate-800/40 border-slate-700/50 ${formData.interval === 'Yearly' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="yes-yearly" disabled={formData.interval === 'Yearly'} />
                      <Label htmlFor="yes-yearly" className="cursor-pointer">Yes, priced at</Label>
                      <Input
                        type="number"
                        value={formData.yearlyPrice}
                        onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                        className="w-32 bg-slate-900/50 border-slate-600"
                        step="0.01"
                        disabled={formData.yearlyOption === 'no' || formData.interval === 'Yearly'}
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
                <Label htmlFor="roleToAssign" className="mb-3 block">
                  Role to Assign <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.roleToAssign}
                  onValueChange={(value) => setFormData({ ...formData, roleToAssign: value })}
                  disabled={isLoadingRoles}
                >
                  <SelectTrigger id="roleToAssign" className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {discordRoles.length === 0 && !isLoadingRoles ? (
                      <SelectItem value="_empty" disabled>No roles available</SelectItem>
                    ) : (
                      discordRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
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
                <div className="px-6 pb-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive" className="cursor-pointer">Page Active</Label>
                      <p className="text-sm text-slate-400 mt-1">When disabled, the page will not be accessible to new members</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
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
