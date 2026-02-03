import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AuthContext } from '@/contexts/AuthContext';
import type { User } from '@/types/models';

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user data
const employeeUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'EMPLOYEE',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const hrUser: User = {
  id: '2',
  email: 'jane.smith@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'HR',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const adminUser: User = {
  id: '3',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock logout function
const mockLogout = () => {
  console.log('Logout clicked');
};

export const Employee: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          user: employeeUser,
          login: async () => {},
          logout: mockLogout,
          isLoading: false,
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const HR: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          user: hrUser,
          login: async () => {},
          logout: mockLogout,
          isLoading: false,
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const Admin: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          user: adminUser,
          login: async () => {},
          logout: mockLogout,
          isLoading: false,
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          user: employeeUser,
          login: async () => {},
          logout: mockLogout,
          isLoading: false,
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          user: hrUser,
          login: async () => {},
          logout: mockLogout,
          isLoading: false,
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
