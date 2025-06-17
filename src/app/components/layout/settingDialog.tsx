'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStockPriceStyle } from '@/utils/zustand';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SettingDialog = () => {
  const { isOpen, closeDialog, type, changeType } = useStockPriceStyle();
  const { t } = useTranslation();

  const toggleType = () => {
    changeType(type === 'US' ? 'Asia' : 'US');
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('definitions')}</DialogTitle>
          <DialogDescription>
            <ul className="space-y-2 mt-4 text-sm">
              <li className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="color-mode">{t('setting')}</Label>
                  <div className="text-muted-foreground text-xs">
                    {type === 'US'
                      ? 'Green = Up, Red = Down'
                      : 'Red = Up, Green = Down'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="color-mode"
                    checked={type === 'US'}
                    onCheckedChange={toggleType}
                  />
                  <Label htmlFor="color-mode" className="capitalize">
                    {type}
                  </Label>
                </div>
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
