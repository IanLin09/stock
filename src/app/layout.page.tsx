import '../style/globals.css';
import { SideBarMenu } from '@/components/layout/sideBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from './components/layout/navBar';
import QueryProvider from './components/layout/queryClient';
import { DefinitionsDialog } from './components/layout/definitationDialog';
import { SettingDialog } from './components/layout/settingDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemesProviders } from './providers';
import { I18nProvider } from './i18nProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body suppressHydrationWarning>
        <I18nProvider>
          <ThemesProviders>
            <SidebarProvider defaultOpen={false}>
              <main>
                <div className="w-screen h-screen flex flex-row">
                  <div className="grow-0">
                    <SideBarMenu></SideBarMenu>
                  </div>
                  <div className="flex-auto">
                    <div className="h-screen flex flex-col">
                      <div className="grow-0">
                        <Navbar></Navbar>
                      </div>
                      <div className="flex-auto min-h-0 pb-2">
                        <QueryProvider>{children}</QueryProvider>
                      </div>
                    </div>
                    <DefinitionsDialog />
                    <SettingDialog />
                  </div>
                </div>
              </main>
              <Toaster />
            </SidebarProvider>
          </ThemesProviders>
        </I18nProvider>
      </body>
    </html>
  );
}
