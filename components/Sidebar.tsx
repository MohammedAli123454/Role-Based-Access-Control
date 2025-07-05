import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

const routes = [
  { href: '/employee', label: 'Employee Master' },
  { href: '/item-master', label: 'Item Master' },
  { href: '/register', label: 'Register User' },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const width = collapsed ? 64 : 260;
  return (
    <aside
      className="fixed top-0 left-0 z-40 flex h-screen flex-col border-r bg-blue-900 text-white shadow-sm"
      style={{ width, transition: 'width 0.2s' }}
    >
      <div className="flex h-14 items-center justify-between border-b px-2">
        <span
          className={`font-bold transition-all duration-200 ${collapsed ? 'hidden' : 'block'}`}
        >
          Menu
        </span>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          size="icon"
          variant="ghost"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      <nav className="mt-4 flex-1">
        {!collapsed && (
          <div>
            {routes.map((route) => (
              <Link
                className="mb-1 block rounded px-4 py-2 transition-colors hover:bg-blue-500 hover:text-white"
                href={route.href}
                key={route.href}
              >
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
