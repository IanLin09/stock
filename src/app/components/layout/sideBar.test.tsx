import { render, screen, fireEvent } from '@testing-library/react';
import { SideBarMenu } from '@/components/layout/sideBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import '@testing-library/jest-dom';
import Navbar from './navBar';
import { DefinitionsDialog } from './definitationDialog';

describe('SideBarMenu', () => {
  test('Sidebar close when the hamburger button is clicked', () => {
    render(
      <SidebarProvider>
        <Navbar />
        <SideBarMenu />
      </SidebarProvider>
    );
    // Get the hamburger button
    const button = screen.getByTestId('hamburger-menu');
    const sidebar = document.querySelector('[data-variant="sidebar"]');
    // Verify the drawer is initially closed (checkbox is unchecked)
    fireEvent.click(button);
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    fireEvent.click(button);
    expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });

  test('Sidebar Dialog show up correctly', () => {
    render(
      <SidebarProvider>
        <DefinitionsDialog />
        <SideBarMenu />
      </SidebarProvider>
    );
    // Get the hamburger button
    const button = screen.getByTestId('definition-button');

    // Verify the drawer is initially closed (checkbox is unchecked)
    fireEvent.click(button);
    const dialog = screen.getByTestId('definitionsDialog');
    expect(dialog).toHaveAttribute('data-state', 'open');
  });
});
