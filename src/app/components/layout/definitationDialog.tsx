'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDialogStore } from '@/utils/zustand';
import { useTranslation } from 'react-i18next';

export const DefinitionsDialog = () => {
  const { isOpen, closeDialog, dialogData } = useDialogStore();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent data-testid="definitionsDialog">
        <DialogHeader>
          <DialogTitle>{t('definitions')}</DialogTitle>
          <DialogDescription>
            {/* Indicator Definitions */}
            <ul className="space-y-2 mt-4 text-sm">
              <li>
                <strong>MA({t('ma_name')})</strong> -{t('ma_definition')}
              </li>
              <li>
                <strong>EMA({t('ema_name')})</strong> - {t('ema_definition')}
              </li>
              <li>
                <strong>RSI({t('rsi_name')})</strong> -{t('rsi_definition')}
              </li>
              <li>
                <strong>MACD({t('macd_name')})</strong> - {t('macd_definition')}
                :
                <ul className="pl-4 list-disc mt-1">
                  <li>
                    <strong>DIF:</strong> {t('dif_definition')}
                  </li>
                  <li>
                    <strong>DEA:</strong> {t('dea_definition')}
                  </li>
                  <li>
                    <strong>{t('histogram')}:</strong>{' '}
                    {t('histogram_definition')}
                  </li>
                </ul>
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
