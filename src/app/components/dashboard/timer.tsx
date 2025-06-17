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
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      const now = new Date();

      // Get current time in UTC
      const nowNY = DateTime.now().setZone('America/New_York');

      const openTime = nowNY.set({ hour: 9, minute: 30, second: 0 });
      const closeTime = nowNY.set({ hour: 16, minute: 0, second: 0 });

      if (nowNY > openTime && nowNY < closeTime) {
        return (
          <div className="flex flex-col text-center  justify-center h-full text-lg font-mono">
            <p>Opening Now</p>
          </div>
        );
      }

      let diff = openTime.diff(nowNY, ['hours', 'minutes', 'seconds']);
      if (nowNY.weekday > 5) {
        let hourPlus = 8 - nowNY.weekday;
        diff = diff.plus({ hour: hourPlus * 24 });
      }

      setTimeLeft(`${diff.toFormat('hh:mm:ss')}`);
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetHour, targetMinute, targetSecond]);
  if (mounted) {
    return (
      <div className="flex flex-col text-center  justify-center h-full text-lg font-mono">
        <p>{t('until_open')}:</p>
        <p className="text-3xl font-bold">{timeLeft}</p>
      </div>
    );
  }
};

export default CountdownTimer;
