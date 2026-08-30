import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

// Sound notification for new proposals - using base64 encoded notification sound
const NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGkmBO2NzuPSyZdnNP/c4ebky7J3Sf/P1+LezLyGWv/F0N3bysKQZf++y9jYx8GYcP+5yNTUxsCdem79tcTRz8O9g3n5ssHNzMG8hnX1r77KysC6iXLxrLvHx764jG/tqrnExLy2j2zqp7bBwLq0kWnnpLO+vri0k2bloa+7u7aykmTjna27uLWxkWLgmp27trOvj2Ddl5u4tLGsjl/blpm1sq+qi1zbk5ezr6ypilrakJSwrKeniFnYjZKtqqWlh1fVipCqp6OjhVXSh46no6GhhFPPg4ukn5+fglHMgImhnZ2dglDJfoeemZqcgE/GeoSblpibfk7DdoKYlJaZfE3AcoCWkpOXektAdH6UkJGVeUnBb32Sjo+Te0i/a3qQjI2ReUe9aHiOiouPd0a7ZXaMiImNdUS5Y3OKhoeLc0O3YHGIhIWJcUG1XW+GgoOHb0CzWm2EgIGFbT6xWGuCfn+DazywVWmAfX2BaT2uU2d/e3t/Zz2sUGV9eXl9ZTyqTmN7d3d7YzuoS2F5dXV5YTmlSF93c3N3Xjijxl11cXFzXDelRFpzcG9zWzaiQlhxbm1xWTSfP1ZvbGtvVzKdPFRta2ltVjGaOlJraGhsVDCYN1BpZmZqUi6VMU5nZGRoUC2TL0xlYmJmTiyRLEpjYGBkTCuOKkhgXl5iSiqLJkZeXFxgSCmJJERcWlpeRiiGIUJaWFhcRCaEHj9YVlZaQiWBI0BXVFRYQCSBHz5VUlJWPiJ+HDxTUFBUPCF8GTpRTk5SMB95FjhPTExQMB12EzZNSkpOMR1zEDRLSEhMLxtwDS9HREZKKB1uCy1FQkJIJhtsByxDQEBGJBmMASpBPj5EIhiJACo/PDxCIBeHACs9Ojs/HxWEACo7ODg9HhOBACk5Njc7HBJ/ACc3NDQ5GhB9ACY1MjI3GA57ACQzMDA1Fw16ACIxLi4zFQt4ACEvLCwxFQp2AB4tKisv'; 

const playNotificationSound = () => {
  try {
    // Try HTML5 Audio first (more reliable)
    const audio = new Audio(NOTIFICATION_SOUND_BASE64);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback to AudioContext
      tryAudioContext();
    });
  } catch {
    tryAudioContext();
  }
};

const tryAudioContext = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create a pleasant notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
};

interface UseProposalNotificationsProps {
  onNewProposal?: () => void;
  onProposalAccepted?: (proposalId: string, brokerName: string) => void;
}

export const useProposalNotifications = ({ 
  onNewProposal, 
  onProposalAccepted 
}: UseProposalNotificationsProps = {}) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isBroker = profile?.role === 'broker';
  const processedIds = useRef<Set<string>>(new Set());

  const handleProposalChange = useCallback(async (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Prevent duplicate notifications
    const eventKey = `${eventType}-${newRecord?.id || oldRecord?.id}-${newRecord?.status}`;
    if (processedIds.current.has(eventKey)) return;
    processedIds.current.add(eventKey);
    
    // Clear old keys after some time to prevent memory leak
    setTimeout(() => processedIds.current.delete(eventKey), 5000);

    // BROKER: New proposal assigned to me (via INSERT - when proposal is created with assignment)
    if (isBroker && eventType === 'INSERT' && newRecord) {
      if (newRecord.assigned_broker_id === user?.id && 
          newRecord.status === 'pending_acceptance') {
        
        playNotificationSound();
        
        // Fetch property name for the notification
        const { data: property } = await supabase
          .from('properties')
          .select('name')
          .eq('id', newRecord.property_id)
          .maybeSingle();
        
        toast.info(
          <div className="flex flex-col gap-1">
            <span className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              🔔 Nova Proposta Recebida!
            </span>
            <span className="text-sm">
              {property?.name || 'Empreendimento'} - {newRecord.client_name}
            </span>
            <span className="text-xs text-muted-foreground">
              Você tem 5 minutos para aceitar
            </span>
          </div>,
          {
            duration: 30000,
            action: {
              label: 'Ver Proposta',
              onClick: () => window.location.href = '/dashboard/corretor',
            },
          }
        );
        
        onNewProposal?.();
      }
    }

    // BROKER: Proposal assigned to me via UPDATE (redistribution or manual assignment)
    if (isBroker && eventType === 'UPDATE' && newRecord) {
      if (newRecord.assigned_broker_id === user?.id && 
          newRecord.status === 'pending_acceptance' &&
          oldRecord?.assigned_broker_id !== user?.id) {
        
        playNotificationSound();
        
        // Fetch property name for the notification
        const { data: property } = await supabase
          .from('properties')
          .select('name')
          .eq('id', newRecord.property_id)
          .maybeSingle();
        
        toast.info(
          <div className="flex flex-col gap-1">
            <span className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              🔔 Nova Proposta Recebida!
            </span>
            <span className="text-sm">
              {property?.name || 'Empreendimento'} - {newRecord.client_name}
            </span>
            <span className="text-xs text-muted-foreground">
              Você tem 5 minutos para aceitar
            </span>
          </div>,
          {
            duration: 30000,
            action: {
              label: 'Ver Proposta',
              onClick: () => window.location.href = '/dashboard/corretor',
            },
          }
        );
        
        onNewProposal?.();
      }
    }

    // ADMIN: Broker accepted a proposal
    if (isAdmin && eventType === 'UPDATE' && newRecord) {
      if (newRecord.status === 'in_progress' && oldRecord?.status === 'pending_acceptance') {
        
        // Fetch broker name
        const { data: broker } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', newRecord.assigned_broker_id)
          .maybeSingle();
        
        const brokerName = broker?.name || 'Corretor';
        
        playNotificationSound();
        
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Proposta Aceita!</span>
            <span className="text-sm">
              {brokerName} iniciou o atendimento da proposta de {newRecord.client_name}
            </span>
          </div>,
          { duration: 10000 }
        );
        
        onProposalAccepted?.(newRecord.id, brokerName);
      }
    }

    // ADMIN: Proposal was redistributed (timeout)
    if (isAdmin && eventType === 'UPDATE' && newRecord) {
      if (newRecord.status === 'new' && oldRecord?.status === 'pending_acceptance') {
        
        toast.warning(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Proposta Retornou</span>
            <span className="text-sm">
              Proposta de {newRecord.client_name} não foi aceita a tempo e retornou para distribuição
            </span>
          </div>,
          { duration: 10000 }
        );
      }
    }
  }, [user?.id, isAdmin, isBroker, onNewProposal, onProposalAccepted]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('proposal-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals',
        },
        handleProposalChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, handleProposalChange]);

  return null;
};
