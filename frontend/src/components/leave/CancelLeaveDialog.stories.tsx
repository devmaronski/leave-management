import type { Meta, StoryObj } from '@storybook/react';
import { CancelLeaveDialog } from './CancelLeaveDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LeaveRequest } from '../../types/models';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Leave/CancelLeaveDialog',
  component: CancelLeaveDialog,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CancelLeaveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLeaveRequest: LeaveRequest = {
  id: '1',
  userId: 'user-1',
  type: 'VL',
  startDate: '2026-03-01T00:00:00.000Z',
  endDate: '2026-03-05T00:00:00.000Z',
  reason: 'Family vacation planned for early March',
  status: 'PENDING',
  createdAt: '2026-02-01T10:00:00.000Z',
  updatedAt: '2026-02-01T10:00:00.000Z',
};

export const Closed: Story = {
  args: {
    leave: mockLeaveRequest,
    open: false,
    onOpenChange: () => console.log('Dialog closed'),
  },
};

export const Open: Story = {
  args: {
    leave: mockLeaveRequest,
    open: true,
    onOpenChange: (open) => console.log('Dialog state changed:', open),
  },
};

export const WithLongReason: Story = {
  args: {
    leave: {
      ...mockLeaveRequest,
      reason:
        'This is a very long reason for requesting leave. I need this time off to attend to several important personal matters that require my immediate attention and cannot be postponed.',
    },
    open: true,
    onOpenChange: (open) => console.log('Dialog state changed:', open),
  },
};
