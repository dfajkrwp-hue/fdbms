import { useLocalStorage } from './useLocalStorage';
import { AuditLog, AuthUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useAuditLog() {
    const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('auditLogs', []);

    const logAction = (action: string, user: AuthUser | null, details: Record<string, any> = {}) => {
        if (!user) return; // Don't log actions for non-logged-in users

        const newLog: AuditLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            userId: user.id,
            username: user.username,
            action: action,
            details: details,
        };
        
        setAuditLogs(prevLogs => [newLog, ...prevLogs]);
    };

    return { auditLogs, logAction };
}
