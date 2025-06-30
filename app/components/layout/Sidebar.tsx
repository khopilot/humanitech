import { NavLink } from 'react-router-dom';
import { cn } from '~/lib/utils';
import {
  FileText,
  BarChart3,
  MessageCircle,
  AlertTriangle,
  ClipboardList,
  Upload,
  Home,
  FolderOpen,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Upload', href: '/documents/upload', icon: Upload },
  { name: 'Rapports', href: '/reports', icon: BarChart3 },
  { name: 'Chat IA', href: '/chat', icon: MessageCircle },
  { name: 'Analyse Risques', href: '/risk-analysis', icon: AlertTriangle },
  { name: 'SOPs', href: '/sop', icon: ClipboardList },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <h3 className="text-sm font-medium mb-1">Phase 1 - Prototype</h3>
          <p className="text-xs text-muted-foreground">
            Système d'IA pour l'action humanitaire contre les mines
          </p>
        </div>
      </div>
    </div>
  );
}