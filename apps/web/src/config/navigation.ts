import { LayoutDashboard, FileText, Files, ShieldCheck, Settings } from 'lucide-react';
import { UserRole } from '../types/auth';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.LAWYER, UserRole.PARTNER],
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.LAWYER],
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: Files,
    roles: [UserRole.ADMIN, UserRole.LAWYER, UserRole.PARTNER],
  },
  {
    title: 'Audit Log',
    href: '/audit',
    icon: ShieldCheck,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMIN],
  },
];
