/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from 'react';
import { generateReading } from './lib/reading/engine';
import { PRODUCTS } from './lib/products';
import { clearLastReading, getLastReading, hasEntitlement, saveLastReading } from './lib/storage';
import type { CaptureResult, Reading } from './types';
import { CaptureScreen } from './screens/CaptureScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ShareSheet } from './screens/ShareSheet';

type Step = 'onboarding' | 'capture' | 'loading' | 'result' | 'paywall';

export function App() {
  // 앱을 나갔다 들어와도 마지막 결과로 자동 복귀 — 결제 후 실수로 나가서 결과를 잃어버리는 문제 방지.
  const [reading, setReading] = useState<Reading | null>(() => getLastReading());
  const [step, setStep] = useState<Step>(() => (getLastReading() ? 'result' : 'onboarding'));
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [unlockTick, setUnlockTick] = useState(0); // 결제 후 재평가 트리거
  const [showShare, setShowShare] = useState(false);

  const unlocked = useMemo(
    () => (reading ? hasEntitlement(reading.id, PRODUCTS.reportFull.sku) : false),
    [reading, unlockTick],
  );

  const handleCaptured = useCallback((result: CaptureResult) => {
    setCapture(result);
    const fresh = generateReading(result.dataUri);
    setReading(fresh);
    saveLastReading(fresh);
    setStep('loading');
  }, []);

  const restart = useCallback(() => {
    setCapture(null);
    setReading(null);
    clearLastReading();
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

      {showShare && reading && <ShareSheet reading={reading} onClose={() => setShowShare(false)} />}
    </>
  );
}
