import { useTranslation } from 'react-i18next';

type params = {
  translationKey: string;
};

export const TranslatedText = ({ translationKey }: params) => {
  const { t } = useTranslation();
  return <span suppressHydrationWarning>{t(translationKey)}</span>;
};
