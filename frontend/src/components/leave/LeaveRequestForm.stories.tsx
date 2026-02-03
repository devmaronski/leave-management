import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeaveRequestForm } from './LeaveRequestForm';
import type { LeaveRequest } from '../../types/models';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Leave/LeaveRequestForm',
  component: LeaveRequestForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-2xl mx-auto p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LeaveRequestForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {
    mode: 'create',
    onSuccess: () => console.log('Leave request created'),
  },
};

export const EditMode: Story = {
  args: {
    mode: 'edit',
    initialValues: {
      id: '1',
      userId: 'user-1',
      type: 'VL',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-05T00:00:00.000Z',
      reason: 'Family vacation planned for March',
      status: 'PENDING',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
    } as LeaveRequest,
    onSuccess: () => console.log('Leave request updated'),
    onCancel: () => console.log('Edit cancelled'),
  },
};

export const WithValidationErrors: Story = {
  args: {
    mode: 'create',
  },
  play: async ({ canvasElement }) => {
    // This story demonstrates what happens when user submits without filling required fields
    // In the actual UI, the validation errors will appear when user tries to submit
  },
};

export const Loading: Story = {
  args: {
    mode: 'create',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the loading state when form is being submitted. The submit button is disabled and shows "Submitting..." text.',
      },
    },
  },
};

export const EditWithAllFields: Story = {
  args: {
    mode: 'edit',
    initialValues: {
      id: '2',
      userId: 'user-2',
      type: 'SL',
      startDate: '2026-02-10T00:00:00.000Z',
      endDate: '2026-02-12T00:00:00.000Z',
      reason:
        'Medical appointment and recovery time needed. Doctor has advised rest for three days following the procedure.',
      status: 'PENDING',
      createdAt: '2026-02-03T09:00:00.000Z',
      updatedAt: '2026-02-03T09:00:00.000Z',
    } as LeaveRequest,
    onSuccess: () => console.log('Leave request updated'),
    onCancel: () => console.log('Edit cancelled'),
  },
};

export const DateValidationError: Story = {
  args: {
    mode: 'create',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates cross-field validation. If you set end date before start date and try to submit, the form will show an error: "End date must be on or after start date".',
      },
    },
  },
};

export const ReasonTooLong: Story = {
  args: {
    mode: 'create',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The reason field has a maximum length of 500 characters. If exceeded, validation will show "Reason must not exceed 500 characters".',
      },
    },
  },
};

export const EmergencyLeave: Story = {
  args: {
    mode: 'edit',
    initialValues: {
      id: '3',
      userId: 'user-3',
      type: 'EL',
      startDate: '2026-02-15T00:00:00.000Z',
      endDate: '2026-02-15T00:00:00.000Z',
      reason: 'Family emergency requiring immediate attention',
      status: 'PENDING',
      createdAt: '2026-02-14T18:00:00.000Z',
      updatedAt: '2026-02-14T18:00:00.000Z',
    } as LeaveRequest,
    onSuccess: () => console.log('Emergency leave updated'),
    onCancel: () => console.log('Edit cancelled'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of an emergency leave request (single day).',
      },
    },
  },
};
