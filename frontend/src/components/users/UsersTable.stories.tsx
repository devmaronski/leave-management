import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { UsersTable } from './UsersTable';
import type { User } from '../../types/models';

const meta = {
  title: 'Users/UsersTable',
  component: UsersTable,
  decorators: [
    (Story) => (
      <div className="max-w-6xl mx-auto p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onDeactivate: fn(),
  },
} satisfies Meta<typeof UsersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'HR',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: '3',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: '4',
    email: 'bob.johnson@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'EMPLOYEE',
    isActive: false,
    createdAt: '2025-12-01T10:00:00.000Z',
    updatedAt: '2026-02-01T14:30:00.000Z',
  },
  {
    id: '5',
    email: 'alice.brown@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: '2026-01-20T11:00:00.000Z',
    updatedAt: '2026-01-20T11:00:00.000Z',
  },
];

export const Default: Story = {
  args: {
    users: mockUsers,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    users: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    users: [],
    isLoading: false,
  },
};

export const AllInactive: Story = {
  args: {
    users: mockUsers.map((user) => ({ ...user, isActive: false })),
    isLoading: false,
  },
};

export const OnlyAdmins: Story = {
  args: {
    users: mockUsers.filter((user) => user.role === 'ADMIN'),
    isLoading: false,
  },
};

export const MixedRoles: Story = {
  args: {
    users: mockUsers,
    isLoading: false,
  },
};
