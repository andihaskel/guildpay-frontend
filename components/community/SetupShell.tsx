'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { CommunitySetupPreview } from '@/components/community/CommunitySetupPreview';
import { useSetupWorkspace } from '@/components/community/SetupWorkspaceContext';

const DESKTOP_VIEWPORT_W = 1280;

function DeviceSwitch({
  device,
  onChange,
}: {
  device: 'desktop' | 'mobile';
  onChange: (d: 'desktop' | 'mobile') => void;
}) {
  return (
    <div className="device-switch" role="tablist" aria-label="Preview device">
      <button
        type="button"
        aria-pressed={device === 'desktop'}
        aria-label="Desktop preview"
        title="Desktop"
        onClick={() => onChange('desktop')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-pressed={device === 'mobile'}
        aria-label="Mobile preview"
        title="Mobile"
        onClick={() => onChange('mobile')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function SetupPreviewPanel() {
  const { community, previewDevice, setPreviewDevice, previewModel } = useSetupWorkspace();
  const desktopStageRef = useRef<HTMLDivElement>(null);
  const [desktopScale, setDesktopScale] = useState(0.5);

  const applyDesktopScale = useCallback(() => {
    const stage = desktopStageRef.current;
    if (!stage) return;
    const w = stage.clientWidth || 1;
    setDesktopScale(w / DESKTOP_VIEWPORT_W);
  }, []);

  useEffect(() => {
    applyDesktopScale();
    const stage = desktopStageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(applyDesktopScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [applyDesktopScale, previewDevice]);

  useEffect(() => {
    if (previewDevice !== 'desktop') return;
    const t1 = window.setTimeout(applyDesktopScale, 200);
    const t2 = window.setTimeout(applyDesktopScale, 360);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [previewDevice, applyDesktopScale]);

  return (
    <div className="setup-preview">
      <div className="preview-stage" data-device={previewDevice}>
        <div className="preview-controls">
          <DeviceSwitch device={previewDevice} onChange={setPreviewDevice} />
        </div>

        {previewDevice === 'mobile' ? (
          <div className="device device-mobile">
            <div className="device-mobile-notch" aria-hidden />
            <div className="device-mobile-screen">
              <CommunitySetupPreview model={previewModel} previewFrame="mobile" />
            </div>
          </div>
        ) : (
          <div className="device device-desktop">
            <div className="device-desktop-chrome">
              <div className="device-desktop-dots" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="device-desktop-addr">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {community.slug ? `accessgate.io/${community.slug}` : 'accessgate.io/your-page'}
              </div>
            </div>
            <div className="device-desktop-stage" ref={desktopStageRef}>
              <div
                className="device-desktop-screen"
                style={{ ['--scale' as string]: String(desktopScale) }}
              >
                <CommunitySetupPreview model={previewModel} previewFrame="desktop" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SetupShell({ children }: { children: ReactNode }) {
  const { previewDevice } = useSetupWorkspace();

  return (
    <div className="setup-split" data-preview-mode={previewDevice}>
      <div className="setup-editor">{children}</div>
      <div className="setup-preview-col">
        <SetupPreviewPanel />
      </div>
    </div>
  );
}
