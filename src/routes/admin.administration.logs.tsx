import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, User, Clock, CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/admin/administration/logs')({
  component: ActivityLogsPage,
});

type AuditLog = {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  status: 'SUCCESS' | 'INFO' | 'WARNING';
};

const mockLogs: AuditLog[] = [
  {
    id: 'log-1',
    user: 'admin@southzoom.com',
    action: 'LOGIN_SUCCESS',
    module: 'Auth',
    details: 'Admin logged in from Dashboard session',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'log-2',
    user: 'admin@southzoom.com',
    action: 'SETTINGS_UPDATE',
    module: 'Settings',
    details: 'Updated contact phone and WhatsApp settings',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'INFO',
  },
  {
    id: 'log-3',
    user: 'admin@southzoom.com',
    action: 'FLEET_UPDATE',
    module: 'Fleet',
    details: 'Updated base tariff rates for Innova Crysta & Dzire',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'log-4',
    user: 'admin@southzoom.com',
    action: 'CMS_UPDATE',
    module: 'Hero Carousel',
    details: 'Updated homepage hero slide order & promo banner',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'log-5',
    user: 'admin@southzoom.com',
    action: 'SCHEMA_SYNC',
    module: 'Database',
    details: 'Core CRM & Booking schema synchronized with Supabase',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'SUCCESS',
  },
];

function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold">System Activity & Audit Logs</h1>
        <p className="text-sm text-gray-500">Chronological history of admin changes, updates, and logins</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity size={16} /> Audit Trail
          </CardTitle>
          <CardDescription>Security tracking of changes made across all modules.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500">
                  <th className="text-left px-4 py-3">Timestamp</th>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Module</th>
                  <th className="text-left px-4 py-3">Details</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{log.user}</td>
                    <td className="px-4 py-3 text-xs font-mono text-orange-600">{log.action}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{log.details}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                        <CheckCircle2 size={11} /> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
