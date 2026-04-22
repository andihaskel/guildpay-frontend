'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical, CircleCheck as CheckCircle2, Circle as XCircle, Loader as Loader2, Monitor, Tablet, Smartphone, Link as LinkIcon, Lock, Image, X } from 'lucide-react';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import { useProduct } from '@/contexts';
import { api } from '@/lib/api';
import { DiscordRole, DiscordChannel, MediaItem } from '@/lib/types';
import { compressImage } from '@/lib/compress-image';
import { useToast } from '@/hooks/use-toast';

type PageStyle = 'dark' | 'light';
type DeviceView = 'mobile' | 'tablet' | 'desktop';

interface BusinessFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FormData {
  offerImage: string;
  offerUrl: string;
  offerName: string;
  businessName: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  freeTrialPeriod: string;
  yearlyOption: string;
  yearlyPrice: string;
  welcomeChannel: string;
  roleToAssign: string;
  mediaGalleryEnabled: boolean;
  mediaItems: MediaItem[];
  discordChannelsEnabled: boolean;
  pageStyle: PageStyle;
  couponsEnabled: boolean;
  cryptoEnabled: boolean;
  requireNameOnCard: boolean;
  termsAndConditions: boolean;
  isActive: boolean;
  businessFeatures: BusinessFeature[];
}

const DEFAULT_FEATURES: BusinessFeature[] = [
  { id: '1', icon: '💬', title: 'Access to Group Chats', description: 'Join a private space where you can participate in group conversations with other members.' },
  { id: '2', icon: '⚡', title: 'Real-Time Updates', description: 'Stay connected with instant messages and updates from the community.' },
  { id: '3', icon: '🔒', title: 'Community-Only Content', description: 'Get access to conversations, resources, and discussions available exclusively to members.' },
];

export default function EditPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProduct } = useProduct();
  const { toast } = useToast();
  const pageId = searchParams.get('id');
  const isEditing = !!pageId;

  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);
  const [discordChannels, setDiscordChannels] = useState<DiscordChannel[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [initialImageSeed, setInitialImageSeed] = useState('default');
  const [guildId, setGuildId] = useState<string | null>(null);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [deviceView, setDeviceView] = useState<DeviceView>('tablet');
  const [activeSection, setActiveSection] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const slugDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedSlug = useRef<string>('');

  const [formData, setFormData] = useState<FormData>({
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
    mediaItems: [],
    discordChannelsEnabled: false,
    pageStyle: 'dark',
    couponsEnabled: false,
    cryptoEnabled: false,
    requireNameOnCard: false,
    termsAndConditions: false,
    isActive: true,
    businessFeatures: DEFAULT_FEATURES,
  });

  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!currentProduct?.id) return;
      try {
        setIsLoadingRoles(true);
        const overview = await api.getProductOverview(currentProduct.id);
        if (overview.discord_guild_id) {
          setGuildId(overview.discord_guild_id);
          const roles = await api.getDiscordGuildRoles(overview.discord_guild_id);
          setDiscordRoles(roles);
          if (roles.length > 0 && !formData.roleToAssign && !isEditing) {
            const firstRoleId = roles[0].id;
            setFormData(prev => ({ ...prev, roleToAssign: firstRoleId }));
            try {
              setIsLoadingChannels(true);
              const channels = await api.getDiscordGuildChannels(overview.discord_guild_id, firstRoleId);
              setDiscordChannels(channels);
            } catch { } finally { setIsLoadingChannels(false); }
          }
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load Discord roles', variant: 'destructive' });
      } finally { setIsLoadingRoles(false); }
    };
    load();
  }, [currentProduct]);

  useEffect(() => {
    const load = async () => {
      if (!currentProduct?.id || !pageId || !isEditing) { setIsLoadingPage(false); return; }
      try {
        setIsLoadingPage(true);
        const pageData = await api.getPage(currentProduct.id, pageId);
        const trialDaysMap: Record<number, string> = { 0: 'None', 7: '7 days', 14: '14 days', 30: '30 days' };
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
          mediaItems: Array.isArray(pageData.media_items) ? pageData.media_items : [],
          discordChannelsEnabled: pageData.discord_channels_enabled ?? false,
          pageStyle: (pageData.settings?.page_style as PageStyle) || 'dark',
          couponsEnabled: false, cryptoEnabled: false, requireNameOnCard: false, termsAndConditions: false,
          isActive: pageData.status ? pageData.status === 'active' : (pageData.accepts_signups ?? true),
          businessFeatures: Array.isArray(pageData.features) && pageData.features.length > 0
            ? pageData.features.map((f: any, idx: number) => ({ id: f.id || `${idx + 1}`, icon: f.icon || '✨', title: f.title || '', description: f.description || '' }))
            : DEFAULT_FEATURES,
        });
      } catch {
        toast({ title: 'Error', description: 'Failed to load page data', variant: 'destructive' });
      } finally { setIsLoadingPage(false); }
    };
    load();
  }, [currentProduct?.id, pageId, isEditing]);

  useEffect(() => {
    if (!hasCustomImage && !isLoadingPage) {
      const seed = encodeURIComponent(initialImageSeed);
      setFormData(prev => ({ ...prev, offerImage: `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}` }));
    }
  }, [hasCustomImage, initialImageSeed, isLoadingPage]);

  useEffect(() => {
    const slug = formData.offerUrl.trim();
    if (!slug || !currentProduct?.id) { setSlugStatus('idle'); return; }
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    setSlugStatus('checking');
    slugDebounceRef.current = setTimeout(async () => {
      if (slug === lastCheckedSlug.current) return;
      lastCheckedSlug.current = slug;
      try {
        const result = await api.checkSlug(currentProduct.id, slug, pageId || undefined);
        setSlugStatus(result.available ? 'available' : 'taken');
      } catch { setSlugStatus('idle'); }
    }, 1000);
    return () => { if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current); };
  }, [formData.offerUrl, currentProduct?.id, pageId]);

  useEffect(() => {
    const load = async () => {
      if (!guildId || !formData.roleToAssign) return;
      try {
        setIsLoadingChannels(true);
        const channels = await api.getDiscordGuildChannels(guildId, formData.roleToAssign);
        setDiscordChannels(channels);
      } catch {
        toast({ title: 'Error', description: 'Failed to load Discord channels', variant: 'destructive' });
      } finally { setIsLoadingChannels(false); }
    };
    load();
  }, [formData.roleToAssign, guildId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentProduct?.id) return;
    try {
      const compressed = await compressImage(file);
      let presign: Awaited<ReturnType<typeof api.presignMedia>>;
      try {
        presign = await api.presignMedia(currentProduct.id, {
          filename: compressed.filename,
          content_type: compressed.content_type,
          page_id: pageId || undefined,
        });
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 400) toast({ title: 'Invalid file type', description: 'This file type is not supported for upload.', variant: 'destructive' });
        else if (status === 404) toast({ title: 'Not found', description: 'Product or page not found.', variant: 'destructive' });
        else toast({ title: 'Could not prepare upload', description: 'Failed to initialize file upload. Please try again.', variant: 'destructive' });
        return;
      }
      const uploadResp = await fetch(presign.upload_url, {
        method: presign.method,
        headers: { 'Content-Type': compressed.content_type },
        body: compressed.blob,
      });
      if (!uploadResp.ok) {
        toast({ title: 'Could not upload file', description: `Upload failed with status ${uploadResp.status}.`, variant: 'destructive' });
        return;
      }
      setFormData(prev => ({ ...prev, offerImage: presign.asset_url }));
      setHasCustomImage(true);
    } catch {
      toast({ title: 'Could not upload file', description: 'An unexpected error occurred during upload.', variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingMedia) { toast({ title: 'Please wait', description: 'Media is still uploading...', variant: 'destructive' }); return; }
    if (!formData.offerUrl.trim()) { toast({ title: 'Validation Error', description: 'Offer URL is required', variant: 'destructive' }); return; }
    if (slugStatus === 'taken') { toast({ title: 'Validation Error', description: 'This URL is already taken.', variant: 'destructive' }); return; }
    if (slugStatus === 'checking') { toast({ title: 'Please wait', description: 'Checking URL availability...', variant: 'destructive' }); return; }
    if (!formData.offerName.trim()) { toast({ title: 'Validation Error', description: 'Offer Name is required', variant: 'destructive' }); return; }
    if (formData.mediaGalleryEnabled && formData.mediaItems.length === 0) { toast({ title: 'Validation Error', description: 'Add at least one image or video to the media gallery, or disable it.', variant: 'destructive' }); setActiveSection(0); return; }
    if (!formData.roleToAssign) { toast({ title: 'Validation Error', description: 'Please select a role to assign', variant: 'destructive' }); return; }
    if (!formData.welcomeChannel || formData.welcomeChannel === '_empty') { toast({ title: 'Validation Error', description: 'Please select a welcome channel', variant: 'destructive' }); return; }
    const params = new URLSearchParams();
    if (pageId) params.append('id', pageId);
    params.append('data', JSON.stringify(formData));
    router.push('/dashboard/pages/preview?' + params.toString());
  };

  const addFeature = () => {
    updateForm('businessFeatures', [...formData.businessFeatures, { id: Date.now().toString(), icon: '✨', title: '', description: '' }]);
  };

  const removeFeature = (id: string) => {
    updateForm('businessFeatures', formData.businessFeatures.filter(f => f.id !== id));
  };

  const updateFeature = (id: string, field: 'title' | 'description' | 'icon', value: string) => {
    updateForm('businessFeatures', formData.businessFeatures.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const initials = formData.offerName.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'A';
  const isLight = formData.pageStyle === 'light';

  const sections = ['Details', 'Features', 'Pricing', 'Settings'];

  if (isLoadingPage && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg, #0a0a0a)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <header className="h-[52px] border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-20 bg-[rgba(10,10,10,0.88)] backdrop-blur-[10px]">
        <div className="flex items-center gap-2.5 text-[12.5px] text-[#888]">
          <button onClick={() => router.push('/dashboard/pages')} className="hover:text-[#f0f0f0] transition-colors">Pages</button>
          <span className="text-[#2a2a2a]">/</span>
          <span className="text-[#f0f0f0] font-medium">{isEditing ? formData.offerName || 'Edit Page' : 'New Page'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push('/dashboard/pages')} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium text-[#888] hover:text-[#f0f0f0] transition-colors">
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium bg-white text-[#0a0a0a] border border-white/90 hover:opacity-90 transition-opacity"
          >
            Next: Preview
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] min-h-[calc(100vh-52px)]">
        <div className="py-8 px-10 pb-24 max-w-[780px] w-full mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard/pages')}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#888] hover:text-[#f0f0f0] transition-colors mb-6 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Pages
            </button>
            <h1 className="text-[28px] font-medium tracking-tight text-[#f0f0f0] mb-1.5">
              {isEditing ? 'Edit your access page' : 'Create your access page'}
            </h1>
            <p className="text-[14px] text-[#888]">Everything below updates the live preview on the right.</p>
          </div>

          <div className="flex gap-1 mb-8 bg-[#111] border border-white/[0.08] rounded-lg p-1">
            {sections.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSection(i)}
                className={`flex-1 py-2 px-3 rounded-md text-[12.5px] font-medium flex items-center justify-center gap-2 transition-all ${activeSection === i ? 'bg-[#1a1a1a] text-[#f0f0f0]' : 'text-[#888] hover:text-[#f0f0f0]'}`}
              >
                <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10.5px] font-medium border transition-all ${activeSection === i ? 'bg-[rgba(88,101,242,0.12)] border-[rgba(88,101,242,0.25)] text-[#8b92f8]' : 'bg-[#161616] border-white/[0.08] text-[#555]'}`}>
                  {i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeSection === 0 && (
              <>
                <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Product details</h2>
                    <p className="text-[12px] text-[#555] mt-0.5">What your members will see first.</p>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Offer image</label>
                        <div className="flex items-center gap-4">
                          <div className="w-[72px] h-[72px] rounded-[10px] border border-white/[0.08] overflow-hidden flex-shrink-0 bg-[#161616]">
                            {formData.offerImage ? (
                              <img src={formData.offerImage} alt="Offer" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[22px] font-semibold text-white bg-gradient-to-br from-[#5865f2] to-[#7983f5]">{initials}</div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <label htmlFor="image-upload" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium text-[#f0f0f0] border border-white/[0.15] hover:border-white/30 hover:bg-white/[0.03] transition-all cursor-pointer">
                              <Upload className="h-3.5 w-3.5" />
                              Upload
                            </label>
                            <span className="text-[11.5px] text-[#555]">{hasCustomImage ? 'Custom image' : 'Auto-generated'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">
                          Offer URL <span className="text-[#8b92f8]">*</span>
                        </label>
                        <div className={`flex bg-[#0d0d0d] border rounded-md overflow-hidden transition-all ${slugStatus === 'taken' ? 'border-red-500/60' : slugStatus === 'available' ? 'border-emerald-500/40' : 'border-white/[0.08]'}`}>
                          <span className="px-3 py-2.5 text-[13px] text-[#555] bg-white/[0.02] border-r border-white/[0.08] font-mono whitespace-nowrap text-[11px]">
                            {currentProduct?.name || 'you'}/
                          </span>
                          <input
                            type="text"
                            value={formData.offerUrl}
                            onChange={e => updateForm('offerUrl', e.target.value)}
                            placeholder="my-community"
                            className="flex-1 px-3 py-2.5 bg-transparent text-[13.5px] text-[#f0f0f0] outline-none placeholder:text-[#555]"
                            required
                          />
                          <span className="px-3 flex items-center">
                            {slugStatus === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#555]" />}
                            {slugStatus === 'available' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            {slugStatus === 'taken' && <XCircle className="h-3.5 w-3.5 text-red-400" />}
                          </span>
                        </div>
                        {slugStatus === 'taken' && <p className="text-[11.5px] text-red-400 mt-1">This URL is already taken</p>}
                        {slugStatus === 'available' && <p className="text-[11.5px] text-emerald-500 mt-1">URL is available</p>}
                        <p className="text-[11.5px] text-[#555] mt-1.5 flex items-center gap-1">
                          <LinkIcon className="h-2.5 w-2.5" />
                          accessgate.io/p/{currentProduct?.name || 'you'}/{formData.offerUrl || 'my-community'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">
                        Offer name <span className="text-[#8b92f8]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.offerName}
                        onChange={e => updateForm('offerName', e.target.value)}
                        placeholder="Artistry Collective"
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none placeholder:text-[#555] focus:border-[rgba(88,101,242,0.4)] focus:shadow-[0_0_0_3px_rgba(88,101,242,0.10)] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Business name</label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={e => updateForm('businessName', e.target.value)}
                        placeholder="Your brand"
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none placeholder:text-[#555] focus:border-[rgba(88,101,242,0.4)] focus:shadow-[0_0_0_3px_rgba(88,101,242,0.10)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-white/[0.06]">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h4 className="text-[13.5px] font-medium text-[#f0f0f0] mb-0.5">Media gallery</h4>
                        <p className="text-[12.5px] text-[#555]">Add a carousel with images and videos to your signup page.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateForm('mediaGalleryEnabled', !formData.mediaGalleryEnabled)}
                        className={`relative w-8 h-[18px] rounded-full border transition-all flex-shrink-0 mt-0.5 ${formData.mediaGalleryEnabled ? 'bg-[#5865f2] border-[#5865f2]' : 'bg-[#1a1a1a] border-white/[0.08]'}`}
                        role="switch"
                        aria-checked={formData.mediaGalleryEnabled}
                      >
                        <span className={`absolute top-[1px] w-3.5 h-3.5 rounded-full transition-all ${formData.mediaGalleryEnabled ? 'left-[calc(100%-15px)] bg-white' : 'left-[1px] bg-[#888]'}`} />
                      </button>
                    </div>

                    {formData.mediaGalleryEnabled && (
                      <div className="mt-4 pt-4 border-t border-dashed border-white/[0.06]">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {formData.mediaItems.map(item => (
                            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/[0.08] bg-[#161616]">
                              {item.type === 'image' ? (
                                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#161616]">
                                  <video src={item.url} className="w-full h-full object-cover" muted />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => updateForm('mediaItems', formData.mediaItems.filter(m => m.id !== item.id))}
                                  className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/60 text-white/80 uppercase">{item.type}</span>
                            </div>
                          ))}
                          <label className={`aspect-square rounded-lg border border-dashed border-white/[0.12] bg-[#0d0d0d] flex flex-col items-center justify-center transition-all ${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/[0.2] hover:bg-white/[0.02]'}`}>
                            {uploadingMedia ? (
                              <Loader2 className="h-4 w-4 text-[#555] animate-spin" />
                            ) : (
                              <>
                                <Image className="h-4 w-4 text-[#555] mb-1" />
                                <span className="text-[10.5px] text-[#555] font-medium">Add</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              disabled={uploadingMedia}
                              className="hidden"
                              onChange={async e => {
                                console.log('[media] onChange fired', e.target.files);
                                const files = Array.from(e.target.files ?? []);
                                e.target.value = '';
                                if (files.length === 0) { console.log('[media] no files'); return; }
                                if (!currentProduct?.id) {
                                  console.log('[media] no currentProduct');
                                  toast({ title: 'Error', description: 'No product selected.', variant: 'destructive' });
                                  return;
                                }
                                console.log('[media] product', currentProduct.id, 'files', files.length);
                                setUploadingMedia(true);
                                try {
                                  for (const file of files) {
                                    const isVideo = file.type.startsWith('video/');
                                    let blob: Blob = file;
                                    let contentType = file.type;
                                    let filename = file.name;
                                    if (!isVideo) {
                                      const compressed = await compressImage(file);
                                      blob = compressed.blob;
                                      contentType = compressed.content_type;
                                      filename = compressed.filename;
                                    }
                                    let presign: Awaited<ReturnType<typeof api.presignMedia>>;
                                    try {
                                      presign = await api.presignMedia(currentProduct.id, {
                                        filename,
                                        content_type: contentType,
                                        page_id: pageId || undefined,
                                      });
                                    } catch (err: any) {
                                      const status = err?.statusCode;
                                      if (status === 400) toast({ title: 'Invalid file type', description: 'This file type is not supported.', variant: 'destructive' });
                                      else if (status === 404) toast({ title: 'Not found', description: 'Product or page not found.', variant: 'destructive' });
                                      else toast({ title: 'Could not prepare upload', description: 'Failed to initialize file upload. Please try again.', variant: 'destructive' });
                                      break;
                                    }
                                    const uploadResp = await fetch(presign.upload_url, {
                                      method: presign.method,
                                      headers: { 'Content-Type': contentType },
                                      body: blob,
                                    });
                                    if (!uploadResp.ok) {
                                      toast({ title: 'Could not upload file', description: `Upload failed with status ${uploadResp.status}.`, variant: 'destructive' });
                                      break;
                                    }
                                    const newItem: MediaItem = {
                                      id: presign.asset_key,
                                      type: isVideo ? 'video' : 'image',
                                      url: presign.asset_url,
                                      caption: '',
                                    };
                                    setFormData(prev => ({ ...prev, mediaItems: [...prev.mediaItems, newItem] }));
                                  }
                                } catch (err) {
                                  toast({ title: 'Could not upload file', description: err instanceof Error ? err.message : 'Unexpected error during upload.', variant: 'destructive' });
                                } finally {
                                  setUploadingMedia(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-[#555]">{uploadingMedia ? 'Uploading...' : `${formData.mediaItems.length} file${formData.mediaItems.length !== 1 ? 's' : ''} added`}{!uploadingMedia && formData.mediaItems.length === 0 && <span className="text-amber-500/80"> - at least 1 required</span>}</p>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-4 border-t border-white/[0.06]">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h4 className="text-[13.5px] font-medium text-[#f0f0f0] mb-0.5">Show Discord channels</h4>
                        <p className="text-[12.5px] text-[#555]">Display available channels for the selected role on the signup page.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateForm('discordChannelsEnabled', !formData.discordChannelsEnabled)}
                        className={`relative w-8 h-[18px] rounded-full border transition-all flex-shrink-0 mt-0.5 ${formData.discordChannelsEnabled ? 'bg-[#5865f2] border-[#5865f2]' : 'bg-[#1a1a1a] border-white/[0.08]'}`}
                        role="switch"
                        aria-checked={formData.discordChannelsEnabled}
                      >
                        <span className={`absolute top-[1px] w-3.5 h-3.5 rounded-full transition-all ${formData.discordChannelsEnabled ? 'left-[calc(100%-15px)] bg-white' : 'left-[1px] bg-[#888]'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-white/[0.06]">
                    <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-3">Page style</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['dark', 'light'] as PageStyle[]).map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateForm('pageStyle', style)}
                          className={`relative bg-[#161616] border rounded-[10px] p-3.5 flex flex-col gap-3 transition-all ${formData.pageStyle === style ? 'border-[#5865f2] bg-[rgba(88,101,242,0.06)]' : 'border-white/[0.08] hover:border-white/[0.12]'}`}
                        >
                          <div className={`h-[74px] rounded-lg border border-white/[0.08] flex items-center justify-center ${style === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#f3f3f3]'}`}>
                            <div className="w-8 h-[3px] rounded-full bg-[#5865f2]" />
                          </div>
                          <span className={`text-center text-[12.5px] font-medium ${formData.pageStyle === style ? 'text-[#f0f0f0]' : 'text-[#888]'}`}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </span>
                          {formData.pageStyle === style && (
                            <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-[#5865f2] flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Description</h2>
                    <p className="text-[12px] text-[#555] mt-0.5">Describe your community and what members get.</p>
                  </div>
                  <div className="p-5">
                    <RichTextEditor
                      value={formData.description}
                      onChange={v => updateForm('description', v)}
                    />
                  </div>
                </div>
              </>
            )}

            {activeSection === 1 && (
              <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Business features</h2>
                    <p className="text-[12px] text-[#555] mt-0.5">What members get when they join.</p>
                  </div>
                  <span className="text-[11.5px] text-[#555] tabular-nums">{formData.businessFeatures.length} / 8</span>
                </div>
                <div className="p-5 space-y-2">
                  {formData.businessFeatures.map(feature => (
                    <div key={feature.id} className="bg-[#161616] border border-white/[0.08] rounded-[10px] p-3.5 hover:border-white/[0.12] transition-colors">
                      <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 mb-0">
                        <span className="text-[#555] cursor-grab hover:text-[#888] p-1">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <EmojiPicker
                          value={feature.icon}
                          onChange={emoji => updateFeature(feature.id, 'icon', emoji)}
                        />
                        <input
                          type="text"
                          value={feature.title}
                          onChange={e => updateFeature(feature.id, 'title', e.target.value)}
                          placeholder="Feature title"
                          className="bg-transparent border-0 text-[13.5px] font-medium text-[#f0f0f0] outline-none placeholder:text-[#555] min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(feature.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/[0.06] pl-[72px]">
                        <textarea
                          value={feature.description}
                          onChange={e => updateFeature(feature.id, 'description', e.target.value)}
                          placeholder="Describe what this unlocks for the member."
                          rows={2}
                          className="w-full bg-transparent border-0 text-[12.5px] text-[#888] outline-none resize-none placeholder:text-[#555] leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFeature}
                    className="w-full py-3 rounded-[10px] border border-dashed border-white/[0.08] text-[#555] text-[12.5px] font-medium flex items-center justify-center gap-2 hover:text-[#f0f0f0] hover:border-white/[0.12] hover:bg-[#111] transition-all"
                    disabled={formData.businessFeatures.length >= 8}
                  >
                    <Plus className="h-3 w-3" />
                    Add feature
                  </button>
                </div>
              </div>
            )}

            {activeSection === 2 && (
              <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Pricing</h2>
                  <p className="text-[12px] text-[#555] mt-0.5">Paid via your connected Stripe account.</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-[140px_1fr_1fr] gap-3">
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Price</label>
                      <div className="flex bg-[#0d0d0d] border border-white/[0.08] rounded-md overflow-hidden focus-within:border-[rgba(88,101,242,0.4)]">
                        <span className="px-3 py-2.5 text-[13px] text-[#555] bg-white/[0.02] border-r border-white/[0.08]">$</span>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={e => updateForm('price', e.target.value)}
                          className="flex-1 px-3 py-2.5 bg-transparent text-[13.5px] text-[#f0f0f0] outline-none"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={e => updateForm('currency', e.target.value)}
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none focus:border-[rgba(88,101,242,0.4)] transition-all"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Billing</label>
                      <select
                        value={formData.interval}
                        onChange={e => updateForm('interval', e.target.value)}
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none focus:border-[rgba(88,101,242,0.4)] transition-all"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Free trial period</label>
                    <select
                      value={formData.freeTrialPeriod}
                      onChange={e => updateForm('freeTrialPeriod', e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none focus:border-[rgba(88,101,242,0.4)] transition-all"
                    >
                      <option value="None">None</option>
                      <option value="7 days">7 days</option>
                      <option value="14 days">14 days</option>
                      <option value="30 days">30 days</option>
                    </select>
                  </div>

                  {formData.interval !== 'Yearly' && (
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">Yearly option</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => updateForm('yearlyOption', 'no')}
                          className={`p-3.5 rounded-[10px] border text-left transition-all ${formData.yearlyOption === 'no' ? 'border-[#5865f2] bg-[rgba(88,101,242,0.06)]' : 'border-white/[0.08] bg-[#161616] hover:border-white/[0.12]'}`}
                        >
                          <span className="text-[13px] font-medium text-[#f0f0f0]">No yearly option</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateForm('yearlyOption', 'yes')}
                          className={`p-3.5 rounded-[10px] border text-left transition-all ${formData.yearlyOption === 'yes' ? 'border-[#5865f2] bg-[rgba(88,101,242,0.06)]' : 'border-white/[0.08] bg-[#161616] hover:border-white/[0.12]'}`}
                        >
                          <span className="text-[13px] font-medium text-[#f0f0f0] block mb-2">Yes, priced at</span>
                          <div className="flex bg-[#0d0d0d] border border-white/[0.08] rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
                            <span className="px-2.5 py-1.5 text-[12px] text-[#555] bg-white/[0.02] border-r border-white/[0.08]">$</span>
                            <input
                              type="number"
                              value={formData.yearlyPrice}
                              onChange={e => { updateForm('yearlyOption', 'yes'); updateForm('yearlyPrice', e.target.value); }}
                              className="flex-1 px-2.5 py-1.5 bg-transparent text-[13px] text-[#f0f0f0] outline-none"
                              step="0.01"
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 3 && (
              <>
                <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Discord settings</h2>
                    <p className="text-[12px] text-[#555] mt-0.5">Configure where members land after subscribing.</p>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">
                        Role to assign <span className="text-[#8b92f8]">*</span>
                      </label>
                      <select
                        value={formData.roleToAssign}
                        onChange={e => updateForm('roleToAssign', e.target.value)}
                        disabled={isLoadingRoles}
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none focus:border-[rgba(88,101,242,0.4)] transition-all disabled:opacity-50"
                      >
                        <option value="">{isLoadingRoles ? 'Loading roles...' : 'Select a role'}</option>
                        {discordRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <p className="text-[11.5px] text-[#555] mt-1.5">Assigned after successful payment.</p>
                    </div>
                    <div>
                      <label className="text-[12.5px] font-medium text-[#f0f0f0] block mb-2">
                        Welcome channel <span className="text-[#8b92f8]">*</span>
                      </label>
                      <select
                        value={formData.welcomeChannel}
                        onChange={e => updateForm('welcomeChannel', e.target.value)}
                        disabled={isLoadingChannels}
                        className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-md px-3 py-2.5 text-[13.5px] text-[#f0f0f0] outline-none focus:border-[rgba(88,101,242,0.4)] transition-all disabled:opacity-50"
                      >
                        <option value="">{isLoadingChannels ? 'Loading channels...' : 'Select a channel'}</option>
                        {discordChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <p className="text-[11.5px] text-[#555] mt-1.5">Where members land after joining.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="text-[14px] font-medium text-[#f0f0f0] tracking-tight">Premium features</h2>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4">
                    {([
                      { key: 'couponsEnabled', label: 'Coupons enabled', desc: 'Allow discount codes at checkout.' },
                      { key: 'cryptoEnabled', label: 'Crypto enabled', desc: 'Accept cryptocurrency payments.' },
                      { key: 'requireNameOnCard', label: 'Require name on card', desc: 'Collect cardholder name.' },
                      { key: 'termsAndConditions', label: 'Terms & conditions', desc: 'Require acceptance before joining.' },
                    ] as Array<{ key: keyof FormData; label: string; desc: string }>).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13.5px] font-medium text-[#f0f0f0]">{label}</p>
                          <p className="text-[12px] text-[#555] mt-0.5">{desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateForm(key, !formData[key])}
                          className={`relative w-8 h-[18px] rounded-full border transition-all flex-shrink-0 mt-0.5 ${formData[key] ? 'bg-[#5865f2] border-[#5865f2]' : 'bg-[#1a1a1a] border-white/[0.08]'}`}
                          role="switch"
                          aria-checked={formData[key] as boolean}
                        >
                          <span className={`absolute top-[1px] w-3.5 h-3.5 rounded-full transition-all ${formData[key] ? 'left-[calc(100%-15px)] bg-white' : 'left-[1px] bg-[#888]'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111] border border-white/[0.08] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h4 className="text-[13.5px] font-medium text-[#f0f0f0] mb-0.5">Page active</h4>
                        <p className="text-[12.5px] text-[#555]">When disabled, the page won't be accessible to new members.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateForm('isActive', !formData.isActive)}
                        className={`relative w-8 h-[18px] rounded-full border transition-all flex-shrink-0 mt-0.5 ${formData.isActive ? 'bg-[#5865f2] border-[#5865f2]' : 'bg-[#1a1a1a] border-white/[0.08]'}`}
                        role="switch"
                        aria-checked={formData.isActive}
                      >
                        <span className={`absolute top-[1px] w-3.5 h-3.5 rounded-full transition-all ${formData.isActive ? 'left-[calc(100%-15px)] bg-white' : 'left-[1px] bg-[#888]'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>

          <div className="sticky bottom-0 pt-6 pb-1 mt-6" style={{ background: 'linear-gradient(180deg, transparent 0, rgba(10,10,10,0.9) 30%, #0a0a0a 70%)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12.5px] text-[#555]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {isEditing ? 'Editing page' : 'New page'}
              </div>
              <div className="flex items-center gap-2">
                {activeSection > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(s => s - 1)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium text-[#f0f0f0] border border-white/[0.15] hover:border-white/30 hover:bg-white/[0.03] transition-all"
                  >
                    Back
                  </button>
                )}
                {activeSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection(s => s + 1)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium bg-white text-[#0a0a0a] hover:opacity-90 transition-opacity"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium bg-white text-[#0a0a0a] hover:opacity-90 transition-opacity"
                  >
                    Preview page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex flex-col bg-[#0d0d0d] border-l border-white/[0.06] sticky top-[52px] h-[calc(100vh-52px)]">
          <div className="h-[46px] border-b border-white/[0.06] flex items-center justify-between px-[18px] flex-shrink-0">
            <span className="text-[11px] font-medium text-[#555] uppercase tracking-[0.08em]">Live preview</span>
            <div className="flex p-[3px] bg-[#111] border border-white/[0.08] rounded-[7px] gap-0.5">
              {([
                { id: 'mobile', icon: Smartphone },
                { id: 'tablet', icon: Tablet },
                { id: 'desktop', icon: Monitor },
              ] as Array<{ id: DeviceView; icon: any }>).map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDeviceView(id)}
                  className={`w-[26px] h-[22px] flex items-center justify-center rounded-[4px] transition-all ${deviceView === id ? 'bg-[#1a1a1a] text-[#f0f0f0]' : 'text-[#555] hover:text-[#888]'}`}
                  aria-pressed={deviceView === id}
                >
                  <Icon className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 flex justify-center items-start" style={{ background: 'radial-gradient(1000px 500px at 50% -10%, rgba(88,101,242,0.06), transparent 60%), #0d0d0d' }}>
            <div
              className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-200"
              style={{
                width: '100%',
                maxWidth: deviceView === 'mobile' ? '360px' : deviceView === 'desktop' ? '680px' : '480px',
              }}
            >
              <div className="h-[30px] flex items-center px-3 bg-[#111] border-b border-white/[0.06] gap-2.5">
                <div className="flex gap-[5px]">
                  <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                  <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                  <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                </div>
                <div className="flex-1 h-[18px] bg-[#0d0d0d] border border-white/[0.08] rounded-[4px] flex items-center px-2 gap-1.5 overflow-hidden">
                  <Lock className="h-2.5 w-2.5 text-[#555] flex-shrink-0" />
                  <span className="text-[10.5px] text-[#555] font-mono truncate">
                    accessgate.io/p/{currentProduct?.name || 'you'}/{formData.offerUrl || 'my-page'}
                  </span>
                </div>
              </div>

              <PreviewContent formData={formData} isLight={isLight} initials={initials} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewContent({ formData, isLight, initials }: { formData: FormData; isLight: boolean; initials: string }) {
  const price = parseFloat(formData.price) || 0;
  const currSymbol = formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : '$';
  const trialDays = formData.freeTrialPeriod !== 'None' ? formData.freeTrialPeriod.replace(' days', '') : null;

  const bg = isLight ? '#fafafa' : '#0a0a0a';
  const text = isLight ? '#0a0a0a' : '#f0f0f0';
  const subText = isLight ? '#555' : '#888';
  const mutedText = isLight ? '#888' : '#555';
  const featureBg = isLight ? '#fff' : '#111';
  const featureBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const dividerColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

  return (
    <div style={{ background: bg, color: text, padding: '28px 20px 36px', minHeight: '540px', fontFamily: 'Inter, ui-sans-serif, sans-serif', fontSize: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: subText }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8b92f8', fontSize: '10px', fontWeight: 600 }}>A</span>
          Secured by AccessGate
        </span>
        {trialDays && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', color: '#8b92f8', fontSize: '10.5px', fontWeight: 500 }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
            {trialDays}-day free trial
          </span>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #5865f2, #7983f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 600, margin: '0 auto 14px', border: '0.5px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          {formData.offerImage ? (
            <img src={formData.offerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        {formData.businessName && <p style={{ fontSize: '11px', color: mutedText, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{formData.businessName}</p>}
        <h1 style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 8px', color: text }}>
          {formData.offerName || 'Untitled Page'}
        </h1>
      </div>

      {formData.businessFeatures.length > 0 && (
        <>
          <div style={{ height: '1px', background: dividerColor, margin: '0 -20px 20px' }} />
          <p style={{ fontSize: '10.5px', fontWeight: 500, color: mutedText, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>What's included</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.businessFeatures.slice(0, 3).map(f => (
              <div key={f.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: featureBg, border: `0.5px solid ${featureBorder}`, borderRadius: '10px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, margin: '0 0 2px', color: text }}>{f.title || 'Feature'}</p>
                  {f.description && <p style={{ fontSize: '11px', color: subText, margin: 0, lineHeight: 1.45 }}>{f.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {formData.mediaGalleryEnabled && formData.mediaItems.length > 0 && (
        <>
          <div style={{ height: '1px', background: dividerColor, margin: '20px -20px' }} />
          <p style={{ fontSize: '10.5px', fontWeight: 500, color: mutedText, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Gallery</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', borderRadius: '10px', overflow: 'hidden' }}>
            {formData.mediaItems.slice(0, 6).map(item => (
              <div key={item.id} style={{ aspectRatio: '1', background: '#161616', position: 'relative', overflow: 'hidden' }}>
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {formData.discordChannelsEnabled && (
        <>
          <div style={{ height: '1px', background: dividerColor, margin: '20px -20px' }} />
          <p style={{ fontSize: '10.5px', fontWeight: 500, color: mutedText, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Discord channels</p>
          <div style={{ background: featureBg, border: `0.5px solid ${featureBorder}`, borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {['welcome', 'general', 'announcements'].map((ch, i) => (
              <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 500, color: i === 0 ? text : mutedText, background: i === 0 ? 'rgba(88,101,242,0.08)' : 'transparent' }}>
                <span style={{ color: mutedText, fontSize: '13px', width: '14px', textAlign: 'center' }}>#</span>
                {ch}
                {i > 0 && <Lock style={{ width: '10px', height: '10px', marginLeft: 'auto', opacity: 0.5 }} />}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: '1px', background: dividerColor, margin: '20px -20px' }} />
      <p style={{ fontSize: '10.5px', fontWeight: 500, color: mutedText, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Pricing</p>
      <div style={{ padding: '14px', background: isLight ? '#fff' : 'linear-gradient(180deg, rgba(88,101,242,0.06), rgba(88,101,242,0.01))', border: '0.5px solid rgba(88,101,242,0.3)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 3px', color: text }}>Membership</p>
            <p style={{ fontSize: '11.5px', color: subText, margin: 0 }}>All features. Cancel anytime.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.02em', color: text }}>{currSymbol}{price.toFixed(2)}</div>
            <div style={{ fontSize: '10.5px', color: mutedText }}>/ {formData.interval.toLowerCase()}</div>
          </div>
        </div>
        <button style={{ width: '100%', padding: '8px', background: '#5865f2', border: '0.5px solid #5865f2', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500, color: '#fff', cursor: 'default' }}>
          {trialDays ? `Start ${trialDays}-day free trial` : `Join for ${currSymbol}${price.toFixed(2)}/${formData.interval === 'Monthly' ? 'mo' : 'yr'}`}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: mutedText, marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <Lock style={{ width: '10px', height: '10px' }} />
        Secure checkout via Stripe
      </p>
    </div>
  );
}
