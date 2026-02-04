import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import InviteUser from '../invite-user';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const mockOrganizations = [
  { id: 'org-1', name: 'Tech Corp' },
  { id: 'org-2', name: 'Business Inc' },
];

const mockDepartments = [
  { id: 'dept-1', name: 'Engineering', organization_id: 'org-1' },
  { id: 'dept-2', name: 'Marketing', organization_id: 'org-1' },
  { id: 'dept-3', name: 'Sales', organization_id: 'org-2' },
];

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('InviteUser', () => {
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
        <InviteUser />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    test('should render invite form', async () => {
      renderComponent();

      expect(screen.getByText('Invite New User')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Role *')).toBeInTheDocument();
      expect(screen.getByLabelText('Organization *')).toBeInTheDocument();
    });

    test('should load organizations on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.organizations.list).toHaveBeenCalledWith({
          limit: 100,
          sort: 'name',
        });
      });
    });

    test('should load departments on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(apiClient.departments.listAll).toHaveBeenCalledWith({
          limit: 1000,
          sort: 'name',
        });
      });
    });
  });

  describe('Form Validation', () => {
    test('should validate required email field', async () => {
      renderComponent();

      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
        expect(apiClient.userProfiles.create).not.toHaveBeenCalled();
      });
    });

    test('should validate email format', async () => {
      renderComponent();

      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      // HTML5 validation will prevent submission
      expect(apiClient.userProfiles.create).not.toHaveBeenCalled();
    });

    test('should validate required full name field', async () => {
      renderComponent();

      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
        expect(apiClient.userProfiles.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Invitation', () => {
    test('should invite user successfully', async () => {
      (apiClient.userProfiles.create as jest.Mock).mockResolvedValue({
        user_id: 'user-1',
        email: 'newuser@example.com',
        full_name: 'New User',
      });

      renderComponent();

      // Fill email
      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'newuser@example.com');

      // Fill full name
      const nameInput = screen.getByPlaceholderText('John Doe');
      await userEvent.type(nameInput, 'New User');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(roleSelect);
      const roleOption = screen.getByText('Employee');
      await userEvent.click(roleOption);

      // Select organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      // Submit form
      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.userProfiles.create).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          full_name: 'New User',
          role: 'employee',
          organization_id: 'org-1',
          department_id: null,
        });
        expect(toast.success).toHaveBeenCalledWith('User invited successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
      });
    });

    test('should invite user with department', async () => {
      (apiClient.userProfiles.create as jest.Mock).mockResolvedValue({
        user_id: 'user-1',
        email: 'newuser@example.com',
        full_name: 'New User',
      });

      renderComponent();

      // Fill email
      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'newuser@example.com');

      // Fill full name
      const nameInput = screen.getByPlaceholderText('John Doe');
      await userEvent.type(nameInput, 'New User');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(roleSelect);
      const roleOption = screen.getByText('Employee');
      await userEvent.click(roleOption);

      // Select organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      // Select department
      await waitFor(() => {
        const deptSelect = screen.getAllByRole('combobox')[2];
        userEvent.click(deptSelect);
      });
      
      const deptOption = await screen.findByText('Engineering');
      await userEvent.click(deptOption);

      // Submit form
      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.userProfiles.create).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          full_name: 'New User',
          role: 'employee',
          organization_id: 'org-1',
          department_id: 'dept-1',
        });
      });
    });

    test('should show error toast on invitation failure', async () => {
      (apiClient.userProfiles.create as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Invitation failed' } },
      });

      renderComponent();

      // Fill email
      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'newuser@example.com');

      // Fill full name
      const nameInput = screen.getByPlaceholderText('John Doe');
      await userEvent.type(nameInput, 'New User');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(roleSelect);
      const roleOption = screen.getByText('Employee');
      await userEvent.click(roleOption);

      // Select organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      // Submit form
      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Invitation failed')
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    test('should log audit on successful invitation', async () => {
      (apiClient.userProfiles.create as jest.Mock).mockResolvedValue({
        user_id: 'user-1',
        email: 'newuser@example.com',
        full_name: 'New User',
      });

      renderComponent();

      // Fill form and submit
      const emailInput = screen.getByPlaceholderText('user@example.com');
      await userEvent.type(emailInput, 'newuser@example.com');

      const nameInput = screen.getByPlaceholderText('John Doe');
      await userEvent.type(nameInput, 'New User');

      const roleSelect = screen.getAllByRole('combobox')[0];
      await userEvent.click(roleSelect);
      const roleOption = screen.getByText('Employee');
      await userEvent.click(roleOption);

      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      const submitButton = screen.getByText('Invite User');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.logAudit).toHaveBeenCalledWith(
          'CREATE',
          'user_profiles',
          undefined,
          expect.objectContaining({
            email: 'newuser@example.com',
            full_name: 'New User',
          })
        );
      });
    });
  });

  describe('Department Filtering', () => {
    test('should filter departments by selected organization', async () => {
      renderComponent();

      // Select organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      // Open department dropdown
      await waitFor(() => {
        const deptSelect = screen.getAllByRole('combobox')[2];
        userEvent.click(deptSelect);
      });

      // Should only show departments for Tech Corp
      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
        expect(screen.queryByText('Sales')).not.toBeInTheDocument();
      });
    });

    test('should clear department when changing organization', async () => {
      renderComponent();

      // Select organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const orgOption = await screen.findByText('Tech Corp');
      await userEvent.click(orgOption);

      // Select department
      await waitFor(() => {
        const deptSelect = screen.getAllByRole('combobox')[2];
        userEvent.click(deptSelect);
      });
      
      const deptOption = await screen.findByText('Engineering');
      await userEvent.click(deptOption);

      // Change organization
      await waitFor(() => {
        const orgSelect = screen.getAllByRole('combobox')[1];
        userEvent.click(orgSelect);
      });
      
      const newOrgOption = await screen.findByText('Business Inc');
      await userEvent.click(newOrgOption);

      // Department should be cleared
      const deptSelect = screen.getAllByRole('combobox')[2];
      expect(deptSelect).toHaveTextContent('Select department');
    });
  });

  describe('Navigation', () => {
    test('should navigate to users list on cancel', async () => {
      renderComponent();

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });
});