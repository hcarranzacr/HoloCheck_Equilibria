import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminPrompts from '../prompts';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const mockPromptTemplates = [
  {
    id: 'template-1',
    scope: 'employee',
    type: 'health_summary',
    content: 'Generate a health summary for the employee',
  },
  {
    id: 'template-2',
    scope: 'org',
    type: 'team_report',
    content: 'Generate a team health report',
  },
];

const mockAiConfigs = [
  {
    id: 'config-1',
    config_name: 'Default Config',
    model_name: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    system_prompt: 'You are a helpful assistant',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'config-2',
    config_name: 'Creative Config',
    model_name: 'gpt-4',
    temperature: 0.9,
    max_tokens: 3000,
    top_p: 0.95,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
    system_prompt: 'You are a creative assistant',
    is_active: false,
    created_at: '2024-01-02T00:00:00Z',
  },
];

const mockUsageLogs = [
  {
    id: 'log-1',
    template_id: 'template-1',
    user_id: 'user-1',
    organization_id: 'org-1',
    used_at: '2024-01-15T10:00:00Z',
    response_generated: true,
  },
  {
    id: 'log-2',
    template_id: 'template-2',
    user_id: 'user-2',
    organization_id: 'org-1',
    used_at: '2024-01-14T09:00:00Z',
    response_generated: false,
  },
];

const mockOrganizations = [
  { id: 'org-1', name: 'Tech Corp' },
];

const mockUsers = [
  { user_id: 'user-1', full_name: 'John Doe' },
  { user_id: 'user-2', full_name: 'Jane Smith' },
];

describe('AdminPrompts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.paramPromptTemplates.listAll as jest.Mock).mockResolvedValue({
      items: mockPromptTemplates,
    });
    (apiClient.paramAiPromptConfigs.listAll as jest.Mock).mockResolvedValue({
      items: mockAiConfigs,
    });
    (apiClient.call as jest.Mock).mockResolvedValue({
      items: mockUsageLogs,
    });
    (apiClient.organizations.list as jest.Mock).mockResolvedValue({
      items: mockOrganizations,
    });
    (apiClient.userProfiles.listAll as jest.Mock).mockResolvedValue({
      items: mockUsers,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminPrompts />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    test('should render loading state initially', () => {
      renderComponent();
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should render prompts data after loading', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('💬 Gestión de Prompts')).toBeInTheDocument();
        expect(screen.getByText('Templates de Prompts')).toBeInTheDocument();
        expect(screen.getByText('Configuraciones de IA')).toBeInTheDocument();
      });
    });

    test('should call apiClient methods on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.paramPromptTemplates.listAll).toHaveBeenCalledWith({
          limit: 1000,
          sort: 'scope,type',
        });
        expect(apiClient.paramAiPromptConfigs.listAll).toHaveBeenCalledWith({
          limit: 1000,
          sort: '-created_at',
        });
      });
    });
  });

  describe('Summary Statistics', () => {
    test('should display total templates count', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Templates')).toBeInTheDocument();
        const templateCards = screen.getAllByText('2');
        expect(templateCards.length).toBeGreaterThan(0);
      });
    });

    test('should display total AI configs count', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Configs IA')).toBeInTheDocument();
        const configCards = screen.getAllByText('2');
        expect(configCards.length).toBeGreaterThan(0);
      });
    });

    test('should display total usage count', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Usos Totales')).toBeInTheDocument();
        const usageCards = screen.getAllByText('2');
        expect(usageCards.length).toBeGreaterThan(0);
      });
    });

    test('should display employee prompts count', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Empleado')).toBeInTheDocument();
        const employeeCards = screen.getAllByText('1');
        expect(employeeCards.length).toBeGreaterThan(0);
      });
    });

    test('should display organization prompts count', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Organización')).toBeInTheDocument();
        const orgCards = screen.getAllByText('1');
        expect(orgCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Prompt Templates Display', () => {
    test('should display all prompt templates', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('health_summary')).toBeInTheDocument();
        expect(screen.getByText('team_report')).toBeInTheDocument();
      });
    });

    test('should show template scope badges', async () => {
      renderComponent();

      await waitFor(() => {
        const scopeBadges = screen.getAllByText(/employee|org/);
        expect(scopeBadges.length).toBeGreaterThan(0);
      });
    });

    test('should show template content preview', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Generate a health summary/)).toBeInTheDocument();
        expect(screen.getByText(/Generate a team health report/)).toBeInTheDocument();
      });
    });

    test('should have view full content button for each template', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Completo');
        expect(viewButtons.length).toBe(mockPromptTemplates.length);
      });
    });

    test('should open template detail modal on view button click', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Completo');
        userEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Contenido del Template:')).toBeInTheDocument();
        expect(screen.getByText('Generate a health summary for the employee')).toBeInTheDocument();
      });
    });
  });

  describe('AI Prompt Configs Display', () => {
    test('should display all AI configs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Default Config')).toBeInTheDocument();
        expect(screen.getByText('Creative Config')).toBeInTheDocument();
      });
    });

    test('should show active/inactive status', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
      });
    });

    test('should display model names', async () => {
      renderComponent();

      await waitFor(() => {
        const modelNames = screen.getAllByText(/gpt-4/);
        expect(modelNames.length).toBeGreaterThan(0);
      });
    });

    test('should display config parameters', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Temp:/)).toBeInTheDocument();
        expect(screen.getByText(/Max Tokens:/)).toBeInTheDocument();
        expect(screen.getByText(/Top P:/)).toBeInTheDocument();
        expect(screen.getByText(/Freq Penalty:/)).toBeInTheDocument();
      });
    });

    test('should have view details button for each config', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Detalles');
        expect(viewButtons.length).toBe(mockAiConfigs.length);
      });
    });

    test('should open config detail modal on view button click', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Detalles');
        userEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Temperature')).toBeInTheDocument();
        expect(screen.getByText('0.7')).toBeInTheDocument();
        expect(screen.getByText('System Prompt:')).toBeInTheDocument();
      });
    });
  });

  describe('Usage Logs Display', () => {
    test('should display usage logs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Historial de Uso')).toBeInTheDocument();
        expect(screen.getByText('Registros de Uso')).toBeInTheDocument();
      });
    });

    test('should show template types in logs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('health_summary')).toBeInTheDocument();
        expect(screen.getByText('team_report')).toBeInTheDocument();
      });
    });

    test('should show user names in logs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      });
    });

    test('should show organization names in logs', async () => {
      renderComponent();

      await waitFor(() => {
        const orgNames = screen.getAllByText('Tech Corp');
        expect(orgNames.length).toBeGreaterThan(0);
      });
    });

    test('should show generation status', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Generado')).toBeInTheDocument();
        expect(screen.getByText('Fallido')).toBeInTheDocument();
      });
    });

    test('should format dates correctly', async () => {
      renderComponent();

      await waitFor(() => {
        const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty States', () => {
    test('should show empty state for templates when none exist', async () => {
      (apiClient.paramPromptTemplates.listAll as jest.Mock).mockResolvedValue({
        items: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No hay templates configurados')).toBeInTheDocument();
      });
    });

    test('should show empty state for AI configs when none exist', async () => {
      (apiClient.paramAiPromptConfigs.listAll as jest.Mock).mockResolvedValue({
        items: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No hay configuraciones de IA')).toBeInTheDocument();
      });
    });

    test('should show empty state for usage logs when none exist', async () => {
      (apiClient.call as jest.Mock).mockResolvedValue({
        items: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No hay registros de uso disponibles')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should show error toast when templates loading fails', async () => {
      (apiClient.paramPromptTemplates.listAll as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Templates loading failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Templates loading failed')
        );
      });
    });

    test('should show error toast when AI configs loading fails', async () => {
      (apiClient.paramAiPromptConfigs.listAll as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Configs loading failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Configs loading failed')
        );
      });
    });

    test('should handle missing template types gracefully', async () => {
      const logsWithoutType = [
        {
          ...mockUsageLogs[0],
          template_id: 'unknown-template',
        },
      ];

      (apiClient.call as jest.Mock).mockResolvedValue({
        items: logsWithoutType,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Desconocido')).toBeInTheDocument();
      });
    });

    test('should handle missing user names gracefully', async () => {
      const logsWithoutUser = [
        {
          ...mockUsageLogs[0],
          user_id: 'unknown-user',
        },
      ];

      (apiClient.call as jest.Mock).mockResolvedValue({
        items: logsWithoutUser,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Usuario Desconocido')).toBeInTheDocument();
      });
    });

    test('should handle missing organization names gracefully', async () => {
      const logsWithoutOrg = [
        {
          ...mockUsageLogs[0],
          organization_id: 'unknown-org',
        },
      ];

      (apiClient.call as jest.Mock).mockResolvedValue({
        items: logsWithoutOrg,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Organización Desconocida')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interactions', () => {
    test('should close template detail modal on close button click', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Completo');
        userEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Contenido del Template:')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Cerrar');
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Contenido del Template:')).not.toBeInTheDocument();
      });
    });

    test('should close config detail modal on close button click', async () => {
      renderComponent();

      await waitFor(() => {
        const viewButtons = screen.getAllByText('Ver Detalles');
        userEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('System Prompt:')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Cerrar');
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('System Prompt:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Integration', () => {
    test('should map template types to usage logs', async () => {
      renderComponent();

      await waitFor(() => {
        const templateTypes = screen.getAllByText(/health_summary|team_report/);
        expect(templateTypes.length).toBeGreaterThan(0);
      });
    });

    test('should map user names to usage logs', async () => {
      renderComponent();

      await waitFor(() => {
        const userNames = screen.getAllByText(/John Doe|Jane Smith/);
        expect(userNames.length).toBeGreaterThan(0);
      });
    });

    test('should map organization names to usage logs', async () => {
      renderComponent();

      await waitFor(() => {
        const orgNames = screen.getAllByText('Tech Corp');
        expect(orgNames.length).toBeGreaterThan(0);
      });
    });
  });
});