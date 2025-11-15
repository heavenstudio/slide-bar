import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import Settings from '../../../src/pages/Settings';
import { setupSupabaseCleanup, cleanDatabase } from '../../helpers/supabase';
import {
  demoLogin,
  getOrganizationSettings,
  updateOrganizationSettings,
} from '../../../src/lib/supabaseApi';

// Setup automatic database cleanup after each test
setupSupabaseCleanup();

/**
 * Settings Component Tests
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 100% (every line, branch, and function)
 *
 * Test categories:
 * 1. Basic rendering
 * 2. Settings loading
 * 3. Form interactions
 * 4. Save functionality
 * 5. Cancel functionality
 * 6. Error states
 * 7. Success states
 */

describe('Settings - Core Functionality', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
    await demoLogin();
  });

  describe('Basic rendering', () => {
    it('should render without crashing (smoke test)', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should render header with title and description', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('Configurações')).toBeInTheDocument();
        expect(screen.getByText(/Configure as preferências/i)).toBeInTheDocument();
      });
    });

    it('should render back to dashboard link', async () => {
      render(<Settings />);
      await waitFor(() => {
        const backLink = screen.getByText('← Voltar ao Dashboard');
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/');
      });
    });
  });

  describe('Settings loading', () => {
    it('should show loading state initially', () => {
      render(<Settings />);
      expect(screen.getByText('Carregando configurações...')).toBeInTheDocument();
    });

    it('should hide loading state after settings loaded', async () => {
      render(<Settings />);
      await waitFor(
        () => {
          expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should load and display current organization settings', async () => {
      // Set up organization settings first
      await updateOrganizationSettings(7000); // 7 seconds

      render(<Settings />);

      await waitFor(
        () => {
          const input = screen.getByLabelText(/Duração Padrão/i);
          expect(input).toHaveValue(7);
        },
        { timeout: 3000 }
      );
    });

    it('should display default value when no settings exist', async () => {
      render(<Settings />);

      await waitFor(
        () => {
          const input = screen.getByLabelText(/Duração Padrão/i);
          expect(input).toHaveValue(5);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Form interactions', () => {
    it('should allow changing duration value', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: '10.5' } });

      expect(input).toHaveValue(10.5);
    });

    it('should display "segundos" label next to input', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('segundos')).toBeInTheDocument();
      });
    });

    it('should render save button', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Salvar Configurações/i })).toBeInTheDocument();
      });
    });

    it('should render cancel button', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Save functionality', () => {
    it('should save settings when save button is clicked', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: '8.5' } });

      const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
      fireEvent.click(saveButton);

      await waitFor(
        () => {
          expect(screen.getByText(/Configurações salvas com sucesso/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify settings were actually saved
      const savedSettings = await getOrganizationSettings();
      expect(savedSettings?.default_slide_duration).toBe(8500);
    });

    it('should show loading state while saving', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: '6' } });

      const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
      fireEvent.click(saveButton);

      // Should briefly show "Salvando..."
      await waitFor(() => {
        expect(screen.getByText(/Salvando.../i)).toBeInTheDocument();
      });
    });

    it('should reload settings after successful save', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: '12' } });

      const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
      fireEvent.click(saveButton);

      await waitFor(
        () => {
          expect(screen.getByText(/Configurações salvas com sucesso/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Input should still show the saved value
      expect(input).toHaveValue(12);
    });

    it('should clear success message after 3 seconds', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: '9' } });

      const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
      fireEvent.click(saveButton);

      await waitFor(
        () => {
          expect(screen.getByText(/Configurações salvas com sucesso/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Wait for message to disappear
      await waitFor(
        () => {
          expect(screen.queryByText(/Configurações salvas com sucesso/i)).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });
  });

  describe('Cancel functionality', () => {
    it('should reset to current settings when cancel is clicked', async () => {
      // Set up initial settings
      await updateOrganizationSettings(6000);

      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      expect(input).toHaveValue(6);

      // Change the value
      fireEvent.change(input, { target: { value: '15' } });
      expect(input).toHaveValue(15);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelButton);

      // Should reset to original value
      expect(input).toHaveValue(6);
    });
  });

  describe('Error states', () => {
    it('should show error message for invalid duration (not a number)', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configurações...')).not.toBeInTheDocument();
      });

      const input = screen.getByLabelText(/Duração Padrão/i);
      fireEvent.change(input, { target: { value: 'abc' } });

      const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Por favor, insira uma duração válida/i)).toBeInTheDocument();
      });
    });

    // Note: Zero and negative values are prevented by HTML input min="0.1" attribute
    // Browser validation prevents these values from being entered
  });

  describe('Information section', () => {
    it('should display current default duration in information section', async () => {
      await updateOrganizationSettings(4500);

      render(<Settings />);

      await waitFor(
        () => {
          expect(screen.getByText(/A duração padrão atual é de 4.5 segundos/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should display informational text about existing images', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText(/Imagens existentes mantêm suas durações/i)).toBeInTheDocument();
      });
    });

    it('should display informational text about dashboard editing', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(
          screen.getByText(/Você pode editar durações individuais no Dashboard/i)
        ).toBeInTheDocument();
      });
    });

    it('should display informational text about batch editing', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(
          screen.getByText(/Use a edição em lote para atualizar múltiplas imagens/i)
        ).toBeInTheDocument();
      });
    });
  });
});
