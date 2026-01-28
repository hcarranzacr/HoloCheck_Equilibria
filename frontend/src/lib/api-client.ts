import { createClient } from '@metagptx/web-sdk';
import { supabase } from './supabase';

// Create the base client
const client = createClient();

// Custom API client with Supabase authentication
export const apiClient = {
  // Auth methods
  auth: {
    async getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    async getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    async signOut() {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  },

  // Dashboard endpoints
  dashboards: {
    async leader() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await client.apiCall.invoke({
        url: '/api/v1/dashboards/leader',
        method: 'GET',
        options: {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      });
      return response.data;
    },

    async hr() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await client.apiCall.invoke({
        url: '/api/v1/dashboards/hr',
        method: 'GET',
        options: {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      });
      return response.data;
    },

    async admin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await client.apiCall.invoke({
        url: '/api/v1/dashboards/admin',
        method: 'GET',
        options: {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      });
      return response.data;
    }
  },

  // Generic API call with automatic auth
  async call(url: string, method: string = 'GET', data?: any) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }

    const response = await client.apiCall.invoke({
      url,
      method,
      data,
      options: {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    });
    return response.data;
  }
};

export { client };