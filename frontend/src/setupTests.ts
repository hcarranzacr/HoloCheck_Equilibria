import '@testing-library/jest-dom';
import React from 'react';

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    departments: {
      list: jest.fn(),
      listAll: jest.fn(),
      query: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizations: {
      list: jest.fn(),
      listAll: jest.fn(),
      query: jest.fn(),
      get: jest.fn(),
    },
    userProfiles: {
      list: jest.fn(),
      listAll: jest.fn(),
      query: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subscriptionUsageLogs: {
      list: jest.fn(),
      listAll: jest.fn(),
      query: jest.fn(),
    },
    paramPromptTemplates: {
      list: jest.fn(),
      listAll: jest.fn(),
      get: jest.fn(),
    },
    paramAiPromptConfigs: {
      list: jest.fn(),
      listAll: jest.fn(),
      get: jest.fn(),
    },
    prompts: {
      query: jest.fn(),
      queryAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    logAudit: jest.fn(),
    call: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => React.createElement('div', null, 'Plus Icon'),
  Pencil: () => React.createElement('div', null, 'Pencil Icon'),
  Trash2: () => React.createElement('div', null, 'Trash2 Icon'),
  Search: () => React.createElement('div', null, 'Search Icon'),
  Loader2: () => React.createElement('div', null, 'Loader2 Icon'),
  UserPlus: () => React.createElement('div', null, 'UserPlus Icon'),
  Activity: () => React.createElement('div', null, 'Activity Icon'),
  CheckCircle: () => React.createElement('div', null, 'CheckCircle Icon'),
  XCircle: () => React.createElement('div', null, 'XCircle Icon'),
  TrendingUp: () => React.createElement('div', null, 'TrendingUp Icon'),
  Calendar: () => React.createElement('div', null, 'Calendar Icon'),
  MessageSquare: () => React.createElement('div', null, 'MessageSquare Icon'),
  Settings: () => React.createElement('div', null, 'Settings Icon'),
  Eye: () => React.createElement('div', null, 'Eye Icon'),
}));

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};