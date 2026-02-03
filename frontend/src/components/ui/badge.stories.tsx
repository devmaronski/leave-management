import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Pending: Story = {
  args: {
    children: 'PENDING',
    variant: 'secondary',
  },
};

export const Approved: Story = {
  args: {
    children: 'APPROVED',
    variant: 'default',
  },
};

export const Rejected: Story = {
  args: {
    children: 'REJECTED',
    variant: 'destructive',
  },
};

export const Cancelled: Story = {
  args: {
    children: 'CANCELLED',
    variant: 'outline',
  },
};
