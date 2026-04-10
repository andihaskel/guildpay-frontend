'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Crown, MessageSquare, Zap, Lock, ExternalLink, Loader as Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useProduct } from '@/contexts';
import { api } from '@/lib/api';
import { CreatePageRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProduct } = useProduct();
  const { toast } = useToast();
  const pageId = searchParams.get('id');
  const dataParam = searchParams.get('data');
  const [isPublishing, setIsPublishing] = useState(false);

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const parsed = JSON.parse(dataParam);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to parse form data:', error);
      }
    }
  }, [dataParam]);

  const [previewData] = useState({
    offerImage: 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=800',
    offerName: 'Artistry Collective',
    businessName: 'testandi',
    description: `# Welcome to Testandi! 👋

Dive into a vibrant community dedicated to the world of art! Testandi is all about connection, inspiration, and creativity. Here's what makes us special:

• **Passionate Artists Unite**: Furthers your artistic journey alongside like-minded individuals who share your love for creativity.
• **Diverse Art Forms**: Explore various genres including painting, digital art, sculpture, and beyond!
• **Showcase Your Work**: A supportive environment for sharing and receiving feedback on your creations.
• **Workshops and Challenges**: Participate in collaborative projects, themed challenges, and skill-building workshops to enhance your craft.
• **Inspiring Discussions**: Engage in stimulating conversations about techniques, inspirations, and the art world at large.
• **Friendship and Collaboration**: Build lasting connections with fellow artists and collaborate on exciting new projects.

Join us in a space where creativity flourishes and every artist feels at home! 🎨✨`,
    price: 30.00,
    yearlyPrice: 300.00,
    currency: 'USD',
    interval: 'Monthly',
    businessFeatures: [
      { icon: '💬', title: 'Access to Group Chats:', description: 'Join a private space where you can participate in group conversations with other members.' },
      { icon: '⚡', title: 'Real-Time Updates:', description: 'Stay connected with instant messages and updates from the community.' },
      { icon: '🔒', title: 'Community-Only Content:', description: 'Get access to conversations, resources, and discussions available exclusively to members.' },
    ],
  });

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handlePublish = async () => {
    if (!currentProduct?.id || !formData) {
      toast({
        title: 'Error',
        description: 'Missing product or form data',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPublishing(true);

      const parsePrice = (price: string): number => {
        const parsed = parseFloat(price);
        return Math.round(parsed * 100);
      };

      const parseTrialDays = (trial: string): number | undefined => {
        if (trial === 'None') return undefined;
        const match = trial.match(/\d+/);
        return match ? parseInt(match[0]) : undefined;
      };

      const createPageData: CreatePageRequest = {
        slug: formData.offerUrl,
        offer_name: formData.offerName,
        hero_image_url: formData.offerImage || undefined,
        description: formData.description,
        features: formData.businessFeatures,
        media_gallery_enabled: formData.mediaGalleryEnabled,
        discord_role_id: formData.roleToAssign,
        discord_welcome_channel_id: formData.welcomeChannel || undefined,
        accepts_signups: formData.isActive,
        monthly_amount_minor: parsePrice(formData.price),
        yearly_amount_minor: formData.yearlyOption === 'yes' ? parsePrice(formData.yearlyPrice) : undefined,
        currency: formData.currency.toLowerCase(),
        trial_days: parseTrialDays(formData.freeTrialPeriod),
        settings: {
          coupons_enabled: formData.couponsEnabled,
          crypto_enabled: formData.cryptoEnabled,
          require_name_on_card: formData.requireNameOnCard,
          terms_and_conditions: formData.termsAndConditions,
          page_style: formData.pageStyle || 'dark',
        },
      };

      if (pageId) {
        await api.updatePage(currentProduct.id, pageId, createPageData);
        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        await api.createPage(currentProduct.id, createPageData);
        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }

      router.push('/dashboard/pages');
    } catch (error: any) {
      console.error('Failed to publish page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish page',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/pages/edit' + (pageId ? `?id=${pageId}` : ''))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
          <Badge variant="outline" className="border-primary/50 text-primary">
            Preview Mode
          </Badge>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handlePublish}
            disabled={isPublishing || !formData}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={(formData?.offerImage || previewData.offerImage)}
                  alt={(formData?.offerName || previewData.offerName)}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-slate-700"
                />
                <div>
                  <h1 className="text-3xl font-bold">{formData?.offerName || previewData.offerName}</h1>
                  <p className="text-slate-400">by {formData?.businessName || previewData.businessName}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">
                  ${selectedPlan === 'monthly'
                    ? parseFloat(formData?.price || previewData.price).toFixed(2)
                    : parseFloat(formData?.yearlyPrice || previewData.yearlyPrice).toFixed(2)}
                </span>
                <span className="text-xl text-slate-400">
                  / {selectedPlan === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </div>

            <Card className="p-6 bg-slate-900/40 border-slate-800/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                What's Included
              </h2>
              <div className="space-y-4">
                {(formData?.businessFeatures || previewData.businessFeatures).map((feature: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800/60 flex items-center justify-center text-xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/40 border-slate-800/50">
              <MarkdownRenderer
                content={formData?.description || previewData.description}
                className="text-slate-300"
              />
            </Card>

            <Card className="p-6 bg-slate-900/40 border-slate-800/50">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How does billing work?</h3>
                  <p className="text-sm text-slate-400">
                    You'll be charged {selectedPlan === 'monthly' ? 'monthly' : 'annually'} and can cancel anytime. No hidden fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
                  <p className="text-sm text-slate-400">
                    Yes! You can upgrade, downgrade, or cancel your subscription at any time from your account settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-sm text-slate-400">
                    We accept all major credit cards, debit cards, and digital wallets through Stripe.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <div className="sticky top-24">
              <Card className="p-6 bg-slate-900/60 border-slate-800/50">
                <h2 className="text-2xl font-bold mb-6">Join {formData?.offerName || previewData.offerName}</h2>

                <Tabs value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as 'monthly' | 'yearly')} className="mb-6">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800/60">
                    <TabsTrigger value="monthly" className="data-[state=active]:bg-slate-700">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="data-[state=active]:bg-slate-700">
                      Yearly
                      <Badge className="ml-2 bg-green-600 text-white border-0 text-xs">
                        Save 17%
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="mb-6 p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">
                      {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Subscription
                    </span>
                    <span className="text-xl font-bold">
                      ${selectedPlan === 'monthly'
                        ? parseFloat(formData?.price || previewData.price).toFixed(2)
                        : parseFloat(formData?.yearlyPrice || previewData.yearlyPrice).toFixed(2)}
                    </span>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <p className="text-sm text-green-400">
                      You save ${((parseFloat(formData?.price || previewData.price) * 12) - parseFloat(formData?.yearlyPrice || previewData.yearlyPrice)).toFixed(2)} per year
                    </p>
                  )}
                </div>

                <div className="mb-6 p-6 rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/20">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-3">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Stripe Payment Form</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Secure payment processing powered by Stripe
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-left">
                        <label className="text-xs text-slate-400 block mb-2">Card Number</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-10 bg-slate-800/50 rounded border border-slate-700 flex items-center px-3">
                            <span className="text-slate-500">•••• •••• •••• ••••</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-8 h-6 bg-slate-700 rounded flex items-center justify-center text-xs">💳</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-left">
                          <label className="text-xs text-slate-400 block mb-2">Expiry</label>
                          <div className="h-10 bg-slate-800/50 rounded border border-slate-700 flex items-center px-3">
                            <span className="text-slate-500">MM / YY</span>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-left">
                          <label className="text-xs text-slate-400 block mb-2">CVC</label>
                          <div className="h-10 bg-slate-800/50 rounded border border-slate-700 flex items-center px-3">
                            <span className="text-slate-500">•••</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-left">
                        <label className="text-xs text-slate-400 block mb-2">Email</label>
                        <div className="h-10 bg-slate-800/50 rounded border border-slate-700 flex items-center px-3">
                          <span className="text-slate-500">your@email.com</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold">
                      Subscribe Now
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Lock className="h-3 w-3" />
                      <span>Secured by Stripe</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">Cancel anytime, no questions asked</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">Instant access to all features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">24/7 community support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">Secure payment processing</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400 text-center">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    Your subscription will renew automatically until cancelled.
                  </p>
                </div>
              </Card>

              <div className="mt-6 text-center">
                <Button variant="link" className="text-slate-400 hover:text-slate-300">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in new tab
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
