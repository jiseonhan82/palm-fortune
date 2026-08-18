/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from 'react';
import { generateReading } from './lib/reading/engine';
import { PRODUCTS } from './lib/products';
import { hasEntitlement } from './lib/storage';
import type { CaptureResult, CoupleInvite, CoupleReading, Reading } from './types';
import { CaptureScreen } from './screens/CaptureScreen';
import { CoupleInviteScreen } from './screens/CoupleInviteScreen';
import { CoupleJoinFlow } from './screens/CoupleJoinFlow';
import { CoupleResultScreen } from './screens/CoupleResultScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ShareSheet } from './screens/ShareSheet';

type Step = 'onboarding' | 'capture' | 'loading' | 'result' | 'paywall' | 'coupleInvite' | 'coupleResult';

export function App() {
  // 초대 링크(?invite=xxx)로 들어온 경우, 기존 플로우 전체를 건너뛰고 파트너 전용 플로우로 진입.
  const inviteIdFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('invite'), []);

  if (inviteIdFromUrl) {
    return (
      <CoupleJoinFlow
        inviteId={inviteIdFromUrl}
        onExit={() => {
          // 쿼리 파라미터를 지우고 일반 플로우로 이동
          const url = new URL(window.location.href);
          url.searchParams.delete('invite');
          window.location.href = url.toString();
        }}
      />
    );
  }

  return <MainFlow />;
}

function MainFlow() {
  const [step, setStep] = useState<Step>('onboarding');
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [unlockTick, setUnlockTick] = useState(0); // 결제 후 재평가 트리거
  const [showShare, setShowShare] = useState(false);
  const [coupleReading, setCoupleReading] = useState<CoupleReading | null>(null);
  const [coupleInvite, setCoupleInvite] = useState<CoupleInvite | null>(null);

  const unlocked = useMemo(
    () => (reading ? hasEntitlement(reading.id, PRODUCTS.reportFull.sku) : false),
    [reading, unlockTick],
  );

  const handleCaptured = useCallback((result: CaptureResult) => {
    setCapture(result);
    setReading(generateReading(result.dataUri));
    setStep('loading');
  }, []);

  const restart = useCallback(() => {
    setCapture(null);
    setReading(null);
    setCoupleReading(null);
    setCoupleInvite(null);
    setStep('capture');
  }, []);

  return (
    <>
      {step === 'onboarding' && <OnboardingScreen onStart={() => setStep('capture')} />}

      {step === 'capture' && (
        <CaptureScreen onCaptured={handleCaptured} onBack={() => setStep('onboarding')} />
      )}

      {step === 'loading' && capture && (
        <LoadingScreen imageUri={capture.dataUri} onDone={() => setStep('result')} />
      )}

      {step === 'result' && reading && (
        <ResultScreen
          reading={reading}
          unlocked={unlocked}
          onOpenPaywall={() => setStep('paywall')}
          onOpenCouple={() => setStep('coupleInvite')}
          onShare={() => setShowShare(true)}
          onRestart={restart}
        />
      )}

      {step === 'paywall' && reading && (
        <PaywallScreen
          reading={reading}
          onPurchased={() => {
            setUnlockTick((t) => t + 1);
            setStep('result');
          }}
          onClose={() => setStep('result')}
        />
      )}

      {step === 'coupleInvite' && reading && (
        <CoupleInviteScreen
          reading={reading}
          onReady={(cr, invite) => {
            setCoupleReading(cr);
            setCoupleInvite(invite);
            setStep('coupleResult');
          }}
          onClose={() => setStep('result')}
        />
      )}

      {step === 'coupleResult' && coupleReading && coupleInvite && (
        <CoupleResultScreen coupleReading={coupleReading} invite={coupleInvite} onRestart={restart} />
      )}

      {showShare && reading && <ShareSheet reading={reading} onClose={() => setShowShare(false)} />}
    </>
  );
}
