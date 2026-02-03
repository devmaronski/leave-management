import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import type { User } from '../../types/models';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Users/DeactivateUserDialog',
  component: DeactivateUserDialog,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeactivateUserDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'EMPLOYEE',
  isActive: true,
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

export const Open: Story = {
  args: {
    user: mockUser,
    open: true,
    onOpenChange: () => {},
  },
};

export const Closed: Story = {
  args: {
    user: mockUser,
    open: false,
    onOpenChange: () => {},
  },
};

export const WithAdminUser: Story = {
  args: {
    user: {
      ...mockUser,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
    },
    open: true,
    onOpenChange: () => {},
  },
};
