import { render, screen, fireEvent } from '@testing-library/react';
import ColorToggle from '@/components/layout/colorToggle';
import '@testing-library/jest-dom';

describe('ColorThemeToggle', () => {
  test('toggle text change correctly', () => {
    render(<ColorToggle />);

    // Verify test object
    const colorToggle = screen.getByRole('checkbox');
    //const colorToggle = document.getElementById('color-theme-toggle');

    expect(colorToggle).toBeChecked();
    expect(screen.getByText('Light')).toBeInTheDocument();

    //fireEvent.change(colorToggle, { target: { checked: false } });
    fireEvent.click(colorToggle);

    expect(colorToggle).not.toBeChecked();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });
});
