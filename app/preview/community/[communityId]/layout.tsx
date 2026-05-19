import '@/components/community/setup-preview.css';
import './community-preview-standalone.css';

export default function CommunityPreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="community-preview-standalone">{children}</div>;
}
