/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from 'react';
import { generateReading } from './lib/reading/engine';
import { PRODUCTS } from './lib/products';
import { hasEntitlement } from './lib/storage';
import type { CaptureResult, Reading } from './types';
import { CaptureScreen } from './screens/CaptureScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ShareSheet } from './screens/ShareSheet';

type Step = 'onboarding' | 'capture' | 'loading' | 'result' | 'paywall';

export function App() {
  const [step, setStep] = useState<Step>('onboarding');
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [unlockTick, setUnlockTick] = useState(0); // 결제 후 재평가 트리거
  const [showShare, setShowShare] = useState(false);

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
