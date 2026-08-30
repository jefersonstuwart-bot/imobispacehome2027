import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ACCEPTANCE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface ProposalWithTimer {
  id: string;
  assigned_at: string;
  remainingTime: number;
  isExpired: boolean;
  percentRemaining: number;
}

export const useProposalTimer = (proposalId?: string, assignedAt?: string) => {
  const [remainingTime, setRemainingTime] = useState<number>(ACCEPTANCE_TIMEOUT_MS);
  const [isExpired, setIsExpired] = useState(false);
  const { user } = useAuth();

  const calculateRemainingTime = useCallback((assignedAtStr: string) => {
    const assignedTime = new Date(assignedAtStr).getTime();
    const now = Date.now();
    const elapsed = now - assignedTime;
    const remaining = Math.max(0, ACCEPTANCE_TIMEOUT_MS - elapsed);
    return remaining;
  }, []);

  useEffect(() => {
    if (!assignedAt || !proposalId) return;

    const updateTimer = () => {
      const remaining = calculateRemainingTime(assignedAt);
      setRemainingTime(remaining);
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        // Auto-redistribute the proposal back to admin
        redistributeProposal(proposalId);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [assignedAt, proposalId, calculateRemainingTime, isExpired]);

  const redistributeProposal = async (id: string) => {
    try {
      const { data: proposal } = await supabase
        .from('proposals')
        .select('redistribution_count, status')
        .eq('id', id)
        .maybeSingle();

      // Only redistribute if still pending
      if (proposal?.status === 'pending_acceptance') {
        await supabase
          .from('proposals')
          .update({
            status: 'new',
            assigned_broker_id: null,
            redistribution_count: (proposal?.redistribution_count || 0) + 1,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error redistributing proposal:', error);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    remainingTime,
    remainingTimeFormatted: formatTime(remainingTime),
    isExpired,
    percentRemaining: (remainingTime / ACCEPTANCE_TIMEOUT_MS) * 100,
  };
};

// Hook to manage multiple proposal timers
export const useProposalTimers = (proposals: Array<{ id: string; assigned_at: string | null; status: string }> | undefined) => {
  const [timers, setTimers] = useState<Map<string, ProposalWithTimer>>(new Map());
  const [expiredIds, setExpiredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!proposals) return;

    const pendingProposals = proposals.filter(p => p.status === 'pending_acceptance' && p.assigned_at);

    const updateTimers = () => {
      const newTimers = new Map<string, ProposalWithTimer>();
      
      pendingProposals.forEach(proposal => {
        if (!proposal.assigned_at) return;
        
        const assignedTime = new Date(proposal.assigned_at).getTime();
        const now = Date.now();
        const elapsed = now - assignedTime;
        const remaining = Math.max(0, ACCEPTANCE_TIMEOUT_MS - elapsed);
        
        newTimers.set(proposal.id, {
          id: proposal.id,
          assigned_at: proposal.assigned_at,
          remainingTime: remaining,
          isExpired: remaining <= 0,
          percentRemaining: (remaining / ACCEPTANCE_TIMEOUT_MS) * 100,
        });

        // Auto-redistribute expired proposals only once
        if (remaining <= 0 && !expiredIds.has(proposal.id)) {
          setExpiredIds(prev => new Set(prev).add(proposal.id));
          redistributeExpiredProposal(proposal.id);
        }
      });

      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [proposals, expiredIds]);

  const redistributeExpiredProposal = async (id: string) => {
    try {
      const { data: proposal } = await supabase
        .from('proposals')
        .select('redistribution_count, status')
        .eq('id', id)
        .maybeSingle();

      if (proposal?.status === 'pending_acceptance') {
        await supabase
          .from('proposals')
          .update({
            status: 'new',
            assigned_broker_id: null,
            redistribution_count: (proposal?.redistribution_count || 0) + 1,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error redistributing proposal:', error);
    }
  };

  const getTimer = (proposalId: string) => timers.get(proposalId);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timers, getTimer, formatTime };
};
