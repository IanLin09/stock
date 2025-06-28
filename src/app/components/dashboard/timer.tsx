'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

type Props = {
  label?: string;
  targetHour?: number;
  targetMinute?: number;
  targetSecond?: number;
};

const CountdownTimer = ({
  targetHour = 9,
  targetMinute = 30,
  targetSecond = 0,
}: Props) => {
  const [timeLeft, setTimeLeft] = useState('');
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      // Get current time in UTC
      const nowNY = DateTime.now().setZone('America/New_York');

      const openTime = nowNY.set({ hour: 9, minute: 30, second: 0 });
      const closeTime = nowNY.set({ hour: 16, minute: 0, second: 0 });

      if (nowNY > openTime && nowNY < closeTime) {
        return (
          <div className="flex flex-col text-center justify-center h-full text-sm sm:text-base md:text-lg font-mono">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              Opening Now
            </p>
          </div>
        );
      }

      // If after market close (after 4 PM), calculate time until next day's market open
      let nextOpenTime = openTime;
      if (nowNY >= closeTime) {
        nextOpenTime = nowNY
          .plus({ days: 1 })
          .set({ hour: 9, minute: 30, second: 0 });
      }

      // Handle weekends: if it's Saturday (6) or Sunday (7), calculate until Monday
      if (nowNY.weekday > 5) {
        nextOpenTime = nowNY
          .startOf('week')
          .plus({ weeks: 1 })
          .set({ hour: 9, minute: 30, second: 0 });
      }

      const diff = nextOpenTime.diff(nowNY, ['hours', 'minutes', 'seconds']);

      setTimeLeft(`${diff.toFormat('hh:mm:ss')}`);
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetHour, targetMinute, targetSecond]);
  if (mounted) {
    return (
      <div
        data-testid="countdown-timer"
        className="flex flex-col text-center justify-center h-full text-sm sm:text-base md:text-lg font-mono"
      >
        <p>{t('until_open')}:</p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
          {timeLeft}
        </p>
      </div>
    );
  }
};

export default CountdownTimer;
