import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './RoleBadge';

const meta = {
  title: 'Common/RoleBadge',
  component: RoleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Employee: Story = {
  args: {
    role: 'EMPLOYEE',
  },
};

export const HR: Story = {
  args: {
    role: 'HR',
  },
};

export const Admin: Story = {
  args: {
    role: 'ADMIN',
  },
};

export const AllRoles: Story = {
  render: () => (
    <div className="flex gap-2">
      <RoleBadge role="EMPLOYEE" />
      <RoleBadge role="HR" />
      <RoleBadge role="ADMIN" />
    </div>
  ),
};
