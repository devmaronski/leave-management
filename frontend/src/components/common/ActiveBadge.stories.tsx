import type { Meta, StoryObj } from '@storybook/react';
import { ActiveBadge } from './ActiveBadge';

const meta = {
  title: 'Common/ActiveBadge',
  component: ActiveBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActiveBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Inactive: Story = {
  args: {
    isActive: false,
  },
};

export const BothStates: Story = {
  args: {
    isActive: true,
  },
  render: () => (
    <div className="flex gap-2">
      <ActiveBadge isActive={true} />
      <ActiveBadge isActive={false} />
    </div>
  ),
};
