'use client';

import * as React from 'react';
import { BicameralHeading, MicroLabel, StatusPill, Button } from '@/components/primitives';
import { getAdminUsers } from '@/lib/data/queries';
import { AdminUser } from '@/lib/data/types';
import { Users, Plus } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);

  React.useEffect(() => {
    async function loadUsers() {
      const data = await getAdminUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)]">CURATORIAL TEAM</MicroLabel>
          <BicameralHeading italicPart="User" romanPart="Management" size="xl" />
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          INVITE TEAM MEMBER
        </Button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4"><MicroLabel>NAME & INITIALS</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>ROLE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>LAST ACTIVE</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {users.map((u) => (
              <tr key={u.id} className="h-16 hover:bg-[var(--color-cream-50)] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-ink-800)] text-white font-sans text-xs font-semibold flex items-center justify-center">
                      {u.avatarInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-900)]">{u.name}</p>
                      <p className="text-[11px] text-[var(--color-text-500)]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[var(--color-gold-600)] font-semibold">{u.role}</td>
                <td className="py-3 px-4">
                  <StatusPill variant={u.status === 'active' ? 'ok' : 'warn'} dot>
                    {u.status}
                  </StatusPill>
                </td>
                <td className="py-3 px-4 text-right text-[var(--color-text-500)]">{u.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
