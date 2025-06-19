'use client';
import {
  LineChart,
  LayoutDashboardIcon,
  Newspaper,
  HelpCircle,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import ColorThemeToggle from '@/components/layout/colorToggle';
import { useTranslation } from 'react-i18next';
import { useDialogStore, useStockPriceStyle } from '@/utils/zustand';
import { useEffect, useState } from 'react';

export const SideBarMenu = () => {
  // Menu items.
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const stockPriceStyle = useStockPriceStyle();

  const items = [
    {
      title: 'dashboard',
      url: '/',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'analysis',
      url: '/analysis',
      icon: LineChart,
    },
    {
      title: 'news',
      url: '/news',
      icon: Newspaper,
    },
  ];

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>; // Or your loading skeleton
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup data-testid="sidebar">
          <SidebarGroupLabel>LazyP Stock monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  data-testid="definition-button"
                  onClick={() => openDialog('confirmation')}
                >
                  <HelpCircle />
                  <span>{t('definitions')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => stockPriceStyle.openDialog()}>
                  <Settings />
                  <span>{t('setting')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ColorThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
