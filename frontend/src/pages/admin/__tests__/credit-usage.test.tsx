import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminCreditUsage from '../credit-usage';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const mockOrganizations = [
  { id: 'org-1', name: 'Tech Corp' },
  { id: 'org-2', name: 'Business Inc' },
];

const mockUsers = [
  { user_id: 'user-1', full_name: 'John Doe', email: 'john@example.com' },
  { user_id: 'user-2', full_name: 'Jane Smith', email: 'jane@example.com' },
];

const mockUsageLogs = [
  {
    id: 'log-1',
    organization_id: 'org-1',
    scan_type: 'biometric',
    used_at: '2024-01-15T10:00:00Z',
    user_id: 'user-1',
    source: 'mobile',
    scan_success: true,
  },
  {
    id: 'log-2',
    organization_id: 'org-1',
    scan_type: 'health',
    used_at: '2024-01-14T09:00:00Z',
    user_id: 'user-2',
    source: 'web',
    scan_success: false,
  },
  {
    id: 'log-3',
    organization_id: 'org-2',
    scan_type: 'biometric',
    used_at: '2024-01-13T08:00:00Z',
    user_id: 'user-1',
    source: 'mobile',
    scan_success: true,
  },
];

describe('AdminCreditUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.organizations.list as jest.Mock).mockResolvedValue({
      items: mockOrganizations,
    });
    (apiClient.userProfiles.listAll as jest.Mock).mockResolvedValue({
      items: mockUsers,
    });
    (apiClient.subscriptionUsageLogs.listAll as jest.Mock).mockResolvedValue({
      items: mockUsageLogs,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminCreditUsage />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    test('should render loading state initially', () => {
      renderComponent();
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should render credit usage data after loading', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('💳 Uso de Créditos')).toBeInTheDocument();
        expect(screen.getByText('Total de Usos')).toBeInTheDocument();
      });
    });

    test('should call apiClient methods on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.organizations.list).toHaveBeenCalledWith({
          limit: 1000,
        });
        expect(apiClient.userProfiles.listAll).toHaveBeenCalledWith({
          limit: 10000,
        });
        expect(apiClient.subscriptionUsageLogs.listAll).toHaveBeenCalledWith({
          limit: 200,
          sort: '-used_at',
        });
      });
    });
  });

  describe('Statistics Display', () => {
    test('should display total usage count', async () => {
      renderComponent();

      await waitFor(() => {
        const totalCards = screen.getAllByText('3');
        expect(totalCards.length).toBeGreaterThan(0);
      });
    });

    test('should display successful scans count', async () => {
      renderComponent();

      await waitFor(() => {
        const successCards = screen.getAllByText('2');
        expect(successCards.length).toBeGreaterThan(0);
      });
    });

    test('should display failed scans count', async () => {
      renderComponent();

      await waitFor(() => {
        const failedCards = screen.getAllByText('1');
        expect(failedCards.length).toBeGreaterThan(0);
      });
    });

    test('should calculate success rate correctly', async () => {
      renderComponent();

      await waitFor(() => {
        // Success rate should be 66.7% (2 out of 3)
        expect(screen.getByText(/66\.7%/)).toBeInTheDocument();
      });
    });

    test('should display active organizations count', async () => {
      renderComponent();

      await waitFor(() => {
        // 2 organizations have usage logs
        expect(screen.getByText('Organizaciones Activas')).toBeInTheDocument();
        const orgCards = screen.getAllByText('2');
        expect(orgCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Usage by Organization', () => {
    test('should display organization usage breakdown', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
        expect(screen.getByText('Business Inc')).toBeInTheDocument();
      });
    });

    test('should show correct usage counts per organization', async () => {
      renderComponent();

      await waitFor(() => {
        // Tech Corp has 2 logs
        const techCorpCard = screen.getByText('Tech Corp').closest('div');
        expect(techCorpCard).toHaveTextContent('2 usos');

        // Business Inc has 1 log
        const businessIncCard = screen.getByText('Business Inc').closest('div');
        expect(businessIncCard).toHaveTextContent('1 usos');
      });
    });

    test('should show successful and failed counts per organization', async () => {
      renderComponent();

      await waitFor(() => {
        const techCorpCard = screen.getByText('Tech Corp').closest('div');
        expect(techCorpCard).toHaveTextContent('1'); // 1 successful
        expect(techCorpCard).toHaveTextContent('1'); // 1 failed
      });
    });
  });

  describe('Recent Usage Logs', () => {
    test('should display recent usage logs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Historial de Uso')).toBeInTheDocument();
        expect(screen.getByText('biometric')).toBeInTheDocument();
        expect(screen.getByText('health')).toBeInTheDocument();
      });
    });

    test('should show user names in logs', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      });
    });

    test('should show scan success status', async () => {
      renderComponent();

      await waitFor(() => {
        const successBadges = screen.getAllByText('Exitoso');
        const failedBadges = screen.getAllByText('Fallido');
        
        expect(successBadges.length).toBe(2);
        expect(failedBadges.length).toBe(1);
      });
    });

    test('should display scan source', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/mobile/)).toBeInTheDocument();
        expect(screen.getByText(/web/)).toBeInTheDocument();
      });
    });

    test('should format dates correctly', async () => {
      renderComponent();

      await waitFor(() => {
        // Check that dates are displayed
        const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should show error toast when loading fails', async () => {
      (apiClient.subscriptionUsageLogs.listAll as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Loading failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Loading failed')
        );
      });
    });

    test('should handle empty usage logs gracefully', async () => {
      (apiClient.subscriptionUsageLogs.listAll as jest.Mock).mockResolvedValue({
        items: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No hay registros de uso disponibles')).toBeInTheDocument();
      });
    });

    test('should handle missing organization names', async () => {
      const logsWithoutOrg = [
        {
          ...mockUsageLogs[0],
          organization_id: 'unknown-org',
        },
      ];

      (apiClient.subscriptionUsageLogs.listAll as jest.Mock).mockResolvedValue({
        items: logsWithoutOrg,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Desconocida')).toBeInTheDocument();
      });
    });

    test('should handle missing user names', async () => {
      const logsWithoutUser = [
        {
          ...mockUsageLogs[0],
          user_id: 'unknown-user',
        },
      ];

      (apiClient.subscriptionUsageLogs.listAll as jest.Mock).mockResolvedValue({
        items: logsWithoutUser,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Usuario Desconocido')).toBeInTheDocument();
      });
    });
  });

  describe('Data Integration', () => {
    test('should map organization names to logs', async () => {
      renderComponent();

      await waitFor(() => {
        const logs = screen.getAllByText(/Tech Corp|Business Inc/);
        expect(logs.length).toBeGreaterThan(0);
      });
    });

    test('should map user names to logs', async () => {
      renderComponent();

      await waitFor(() => {
        const userNames = screen.getAllByText(/John Doe|Jane Smith/);
        expect(userNames.length).toBeGreaterThan(0);
      });
    });

    test('should sort logs by date descending', async () => {
      renderComponent();

      await waitFor(() => {
        const logElements = screen.getAllByText(/biometric|health/);
        // Most recent log (log-1) should appear first
        expect(logElements[0]).toHaveTextContent('biometric');
      });
    });
  });

  describe('Summary Cards', () => {
    test('should display all summary cards', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Total de Usos')).toBeInTheDocument();
        expect(screen.getByText('Escaneos Exitosos')).toBeInTheDocument();
        expect(screen.getByText('Escaneos Fallidos')).toBeInTheDocument();
        expect(screen.getByText('Organizaciones Activas')).toBeInTheDocument();
      });
    });

    test('should show correct icons for each card', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Activity Icon')).toBeInTheDocument();
        expect(screen.getByText('CheckCircle Icon')).toBeInTheDocument();
        expect(screen.getByText('XCircle Icon')).toBeInTheDocument();
        expect(screen.getByText('TrendingUp Icon')).toBeInTheDocument();
      });
    });
  });
});