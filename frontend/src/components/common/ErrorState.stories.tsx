import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';

const meta = {
  title: 'Common/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'Failed to load data. Please check your connection.',
  },
};

export const WithRetry: Story = {
  args: {
    message: 'Unable to fetch leave requests.',
    onRetry: () => alert('Retry clicked'),
  },
};

export const NetworkError: Story = {
  args: {
    message: 'Network error. Please try again later.',
    onRetry: () => console.log('Retrying...'),
  },
};
