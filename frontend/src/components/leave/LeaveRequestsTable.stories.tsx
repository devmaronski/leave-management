import type { Meta, StoryObj } from '@storybook/react';
import { LeaveRequestsTable } from './LeaveRequestsTable';
import type { LeaveRequest } from '../../types/models';

const meta = {
  title: 'Leave/LeaveRequestsTable',
  component: LeaveRequestsTable,
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
} satisfies Meta<typeof LeaveRequestsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: 'user-1',
    type: 'VL',
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-03-05T00:00:00.000Z',
    reason: 'Family vacation planned for early March',
    status: 'PENDING',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: '2',
    userId: 'user-1',
    type: 'SL',
    startDate: '2026-02-10T00:00:00.000Z',
    endDate: '2026-02-12T00:00:00.000Z',
    reason: 'Medical appointment and recovery',
    status: 'APPROVED',
    decisionById: 'hr-1',
    decisionNote: 'Approved. Feel better soon!',
    decidedAt: '2026-02-05T14:30:00.000Z',
    createdAt: '2026-02-03T09:00:00.000Z',
    updatedAt: '2026-02-05T14:30:00.000Z',
  },
  {
    id: '3',
    userId: 'user-1',
    type: 'EL',
    startDate: '2026-01-20T00:00:00.000Z',
    endDate: '2026-01-21T00:00:00.000Z',
    reason: 'Family emergency - immediate attention required',
    status: 'REJECTED',
    decisionById: 'hr-1',
    decisionNote: 'Insufficient notice provided. Please submit emergency leaves earlier when possible.',
    decidedAt: '2026-01-19T16:00:00.000Z',
    createdAt: '2026-01-18T11:00:00.000Z',
    updatedAt: '2026-01-19T16:00:00.000Z',
  },
  {
    id: '4',
    userId: 'user-1',
    type: 'UNPAID',
    startDate: '2026-04-15T00:00:00.000Z',
    endDate: '2026-04-20T00:00:00.000Z',
    reason: 'Personal trip abroad',
    status: 'CANCELLED',
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-02T10:00:00.000Z',
  },
];

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    isLoading: false,
  },
};

export const WithPendingLeaves: Story = {
  args: {
    data: mockLeaveRequests.filter((leave) => leave.status === 'PENDING'),
    isLoading: false,
    onEdit: (leave) => console.log('Edit leave:', leave.id),
    onCancel: (leave) => console.log('Cancel leave:', leave.id),
  },
};

export const WithApprovedLeaves: Story = {
  args: {
    data: mockLeaveRequests.filter((leave) => leave.status === 'APPROVED'),
    isLoading: false,
  },
};

export const MixedStatuses: Story = {
  args: {
    data: mockLeaveRequests,
    isLoading: false,
    onEdit: (leave) => console.log('Edit leave:', leave.id),
    onCancel: (leave) => console.log('Cancel leave:', leave.id),
  },
};

export const WithLongReason: Story = {
  args: {
    data: [
      {
        id: '5',
        userId: 'user-1',
        type: 'VL',
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-10T00:00:00.000Z',
        reason:
          'This is a very long reason that exceeds the normal character limit. I need this leave for an extended family trip that has been planned for months. We will be visiting multiple countries across Europe and this is a once-in-a-lifetime opportunity. The entire family will be together for the first time in years, and I really need this time to reconnect with my relatives.',
        status: 'PENDING',
        createdAt: '2026-02-01T10:00:00.000Z',
        updatedAt: '2026-02-01T10:00:00.000Z',
      },
    ],
    isLoading: false,
    onEdit: (leave) => console.log('Edit leave:', leave.id),
    onCancel: (leave) => console.log('Cancel leave:', leave.id),
  },
};

export const NoActions: Story = {
  args: {
    data: mockLeaveRequests,
    isLoading: false,
    // onEdit and onCancel are intentionally omitted
  },
  parameters: {
    docs: {
      description: {
        story: 'When onEdit and onCancel callbacks are not provided, action buttons are hidden.',
      },
    },
  },
};
