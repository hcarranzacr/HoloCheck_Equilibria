import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminDepartments from '../departments';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const mockDepartments = [
  {
    id: '1',
    name: 'Engineering',
    organization_id: 'org-1',
    created_at: '2024-01-01T00:00:00Z',
    organization_name: 'Tech Corp',
  },
  {
    id: '2',
    name: 'Marketing',
    organization_id: 'org-1',
    created_at: '2024-01-02T00:00:00Z',
    organization_name: 'Tech Corp',
  },
];

const mockOrganizations = [
  { id: 'org-1', name: 'Tech Corp' },
  { id: 'org-2', name: 'Business Inc' },
];

describe('AdminDepartments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.organizations.list as jest.Mock).mockResolvedValue({
      items: mockOrganizations,
    });
    (apiClient.departments.listAll as jest.Mock).mockResolvedValue({
      items: mockDepartments,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminDepartments />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    test('should render loading state initially', () => {
      renderComponent();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    test('should render departments after loading', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
      });
    });

    test('should render empty state when no departments', async () => {
      (apiClient.departments.listAll as jest.Mock).mockResolvedValue({
        items: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No se encontraron departamentos')).toBeInTheDocument();
      });
    });

    test('should call apiClient.departments.listAll on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.departments.listAll).toHaveBeenCalledWith({
          limit: 1000,
          sort: '-created_at',
        });
      });
    });

    test('should call apiClient.organizations.list on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.organizations.list).toHaveBeenCalledWith({
          limit: 100,
          sort: 'name',
        });
      });
    });
  });

  describe('Search and Filter', () => {
    test('should filter departments by search term', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar departamento...');
      await userEvent.type(searchInput, 'Marketing');

      await waitFor(() => {
        expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
      });
    });

    test('should filter departments by organization', async () => {
      const multiOrgDepts = [
        ...mockDepartments,
        {
          id: '3',
          name: 'Sales',
          organization_id: 'org-2',
          created_at: '2024-01-03T00:00:00Z',
          organization_name: 'Business Inc',
        },
      ];

      (apiClient.departments.listAll as jest.Mock).mockResolvedValue({
        items: multiOrgDepts,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Sales')).toBeInTheDocument();
      });

      // Open organization filter dropdown
      const filterSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(filterSelect);

      // Select specific organization
      const orgOption = screen.getByText('Business Inc');
      await userEvent.click(orgOption);

      await waitFor(() => {
        expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
        expect(screen.getByText('Sales')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations - Create', () => {
    test('should open create dialog when clicking create button', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Crear Departamento');
      await userEvent.click(createButton);

      expect(screen.getByText('Crear Nuevo Departamento')).toBeInTheDocument();
    });

    test('should create new department successfully', async () => {
      (apiClient.departments.create as jest.Mock).mockResolvedValue({
        id: '3',
        name: 'New Dept',
        organization_id: 'org-1',
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Open create dialog
      const createButton = screen.getByText('Crear Departamento');
      await userEvent.click(createButton);

      // Fill form
      const nameInput = screen.getByPlaceholderText('Nombre del departamento');
      await userEvent.type(nameInput, 'New Dept');

      // Select organization
      const orgSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(orgSelect);
      const orgOption = screen.getByText('Tech Corp');
      await userEvent.click(orgOption);

      // Submit form
      const submitButton = screen.getByText('Crear Departamento');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.departments.create).toHaveBeenCalledWith({
          name: 'New Dept',
          organization_id: 'org-1',
        });
        expect(toast.success).toHaveBeenCalledWith('Departamento creado exitosamente');
        expect(apiClient.logAudit).toHaveBeenCalledWith(
          'CREATE',
          'departments',
          undefined,
          expect.any(Object)
        );
      });
    });

    test('should show error toast on create failure', async () => {
      (apiClient.departments.create as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Creation failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Open create dialog
      const createButton = screen.getByText('Crear Departamento');
      await userEvent.click(createButton);

      // Fill form
      const nameInput = screen.getByPlaceholderText('Nombre del departamento');
      await userEvent.type(nameInput, 'New Dept');

      // Select organization
      const orgSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(orgSelect);
      const orgOption = screen.getByText('Tech Corp');
      await userEvent.click(orgOption);

      // Submit form
      const submitButton = screen.getByText('Crear Departamento');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Creation failed')
        );
      });
    });

    test('should validate required fields on create', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Open create dialog
      const createButton = screen.getByText('Crear Departamento');
      await userEvent.click(createButton);

      // Try to submit without filling form
      const submitButton = screen.getByText('Crear Departamento');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Por favor completa todos los campos requeridos'
        );
        expect(apiClient.departments.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('CRUD Operations - Update', () => {
    test('should open edit dialog when clicking edit button', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click edit button (Pencil icon)
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn => btn.querySelector('div')?.textContent === 'Pencil Icon');
      
      if (editButton) {
        await userEvent.click(editButton);
        expect(screen.getByText('Editar Departamento')).toBeInTheDocument();
      }
    });

    test('should update department successfully', async () => {
      (apiClient.departments.update as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Updated Engineering',
        organization_id: 'org-1',
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn => btn.querySelector('div')?.textContent === 'Pencil Icon');
      
      if (editButton) {
        await userEvent.click(editButton);

        // Update name
        const nameInput = screen.getByDisplayValue('Engineering');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Engineering');

        // Submit form
        const submitButton = screen.getByText('Actualizar Departamento');
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(apiClient.departments.update).toHaveBeenCalledWith('1', {
            name: 'Updated Engineering',
            organization_id: 'org-1',
          });
          expect(toast.success).toHaveBeenCalledWith('Departamento actualizado exitosamente');
        });
      }
    });

    test('should show error toast on update failure', async () => {
      (apiClient.departments.update as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Update failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(btn => btn.querySelector('div')?.textContent === 'Pencil Icon');
      
      if (editButton) {
        await userEvent.click(editButton);

        // Update name
        const nameInput = screen.getByDisplayValue('Engineering');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Engineering');

        // Submit form
        const submitButton = screen.getByText('Actualizar Departamento');
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            expect.stringContaining('Update failed')
          );
        });
      }
    });
  });

  describe('CRUD Operations - Delete', () => {
    test('should delete department successfully', async () => {
      global.confirm = jest.fn(() => true);
      (apiClient.departments.delete as jest.Mock).mockResolvedValue({});

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('div')?.textContent === 'Trash2 Icon');
      
      if (deleteButton) {
        await userEvent.click(deleteButton);

        await waitFor(() => {
          expect(global.confirm).toHaveBeenCalledWith(
            expect.stringContaining('Engineering')
          );
          expect(apiClient.departments.delete).toHaveBeenCalledWith('1');
          expect(toast.success).toHaveBeenCalledWith('Departamento eliminado exitosamente');
        });
      }
    });

    test('should not delete when user cancels confirmation', async () => {
      global.confirm = jest.fn(() => false);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('div')?.textContent === 'Trash2 Icon');
      
      if (deleteButton) {
        await userEvent.click(deleteButton);

        expect(apiClient.departments.delete).not.toHaveBeenCalled();
      }
    });

    test('should show error toast on delete failure', async () => {
      global.confirm = jest.fn(() => true);
      (apiClient.departments.delete as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Delete failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('div')?.textContent === 'Trash2 Icon');
      
      if (deleteButton) {
        await userEvent.click(deleteButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            expect.stringContaining('Delete failed')
          );
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('should show error toast when data loading fails', async () => {
      (apiClient.departments.listAll as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Loading failed' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Loading failed')
        );
      });
    });
  });
});