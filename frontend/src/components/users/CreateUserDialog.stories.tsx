import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateUserDialog } from './CreateUserDialog';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Users/CreateUserDialog',
  component: CreateUserDialog,
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
} satisfies Meta<typeof CreateUserDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
  },
};
