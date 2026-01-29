import { useEffect, useRef, useState, useCallback } from 'react';

export interface SessionMonitorConfig {
    /** Idle timeout in milliseconds (default: 15 minutes) */
    idleTimeout?: number;
    /** Heartbeat interval in milliseconds (default: 60 seconds) */
    heartbeatInterval?: number;
    /** Warning time before logout in milliseconds (default: 60 seconds) */
    warningTime?: number;
    /** Whether to monitor app visibility changes (default: true) */
    monitorVisibility?: boolean;
}

export interface SessionMonitorState {
    /** Time remaining until timeout (in seconds) */
    timeRemaining: number;
    /** Whether warning modal should be shown */
    showWarning: boolean;
    /** Whether user is currently idle */
    isIdle: boolean;
}

const DEFAULT_CONFIG: Required<SessionMonitorConfig> = {
    idleTimeout: 15 * 60 * 1000, // 15 minutes
    heartbeatInterval: 60 * 1000, // 60 seconds
    warningTime: 60 * 1000, // 60 seconds
    monitorVisibility: true,
};

/**
 * Session monitor hook that tracks user activity and triggers logout on timeout
 * 
 * @param onTimeout - Callback to execute when session times out
 * @param onHeartbeat - Optional callback for sending heartbeat to backend
 * @param config - Configuration options
 */
export function useSessionMonitor(
    onTimeout: () => void,
    onHeartbeat?: () => Promise<void>,
    config: SessionMonitorConfig = {}
) {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    const [state, setState] = useState<SessionMonitorState>({
        timeRemaining: cfg.idleTimeout / 1000,
        showWarning: false,
        isIdle: false,
    });

    const lastActivityRef = useRef<number>(Date.now());
    const heartbeatTimerRef = useRef<any>(null);
    const checkTimerRef = useRef<any>(null);
    const hasTimedOutRef = useRef(false);

    /**
     * Update last activity timestamp
     */
    const updateActivity = useCallback(() => {
        lastActivityRef.current = Date.now();

        if (state.isIdle) {
            setState(prev => ({
                ...prev,
                isIdle: false,
                showWarning: false,
                timeRemaining: cfg.idleTimeout / 1000,
            }));
        }
    }, [state.isIdle, cfg.idleTimeout]);

    /**
     * Check if session has timed out
     */
    const checkTimeout = useCallback(() => {
        const now = Date.now();
        const timeSinceActivity = now - lastActivityRef.current;
        const remaining = Math.max(0, cfg.idleTimeout - timeSinceActivity);
        const remainingSeconds = Math.floor(remaining / 1000);

        setState(prev => ({
            ...prev,
            timeRemaining: remainingSeconds,
            showWarning: remaining <= cfg.warningTime && remaining > 0,
            isIdle: remaining === 0,
        }));

        // Trigger timeout if time is up
        if (remaining === 0 && !hasTimedOutRef.current) {
            hasTimedOutRef.current = true;
            console.log('[SessionMonitor] Session timed out');
            onTimeout();
        }
    }, [cfg.idleTimeout, cfg.warningTime, onTimeout]);

    /**
     * Send heartbeat to backend
     */
    const sendHeartbeat = useCallback(async () => {
        if (onHeartbeat && !hasTimedOutRef.current) {
            try {
                await onHeartbeat();
                console.log('[SessionMonitor] Heartbeat sent');
            } catch (error) {
                console.error('[SessionMonitor] Heartbeat failed:', error);
            }
        }
    }, [onHeartbeat]);

    /**
     * Handle visibility change (app minimize/restore)
     */
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden && cfg.monitorVisibility) {
            console.log('[SessionMonitor] App hidden, logging out');
            if (!hasTimedOutRef.current) {
                hasTimedOutRef.current = true;
                onTimeout();
            }
        }
    }, [cfg.monitorVisibility, onTimeout]);

    /**
     * Reset timeout (called when user extends session from warning modal)
     */
    const resetTimeout = useCallback(() => {
        updateActivity();
        hasTimedOutRef.current = false;
    }, [updateActivity]);

    useEffect(() => {
        // Activity event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Start heartbeat timer
        heartbeatTimerRef.current = setInterval(() => {
            sendHeartbeat();
        }, cfg.heartbeatInterval);

        // Start timeout check timer (check every second)
        checkTimerRef.current = setInterval(() => {
            checkTimeout();
        }, 1000);

        // Visibility change listener
        if (cfg.monitorVisibility) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        // Initial heartbeat
        sendHeartbeat();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity, true);
            });

            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }

            if (checkTimerRef.current) {
                clearInterval(checkTimerRef.current);
            }

            if (cfg.monitorVisibility) {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };
    }, [updateActivity, sendHeartbeat, checkTimeout, handleVisibilityChange, cfg.heartbeatInterval, cfg.monitorVisibility]);

    return {
        ...state,
        resetTimeout,
    };
}
