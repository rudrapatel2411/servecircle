import { useState, useEffect, useCallback } from 'react';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, respondToJobRequest, updateWorkerJobStatus } from './workerApi';
import {
  getWorkflowBookings,
  acceptWorkflowBooking,
  declineWorkflowBooking,
  subscribeWorkflowUpdates,
} from '../../utils/serviceWorkflowEngine';

export function useSpecializedJobs({
  category,
  categoryAliases = [],
  defaultJobs = [],
  normalizeIncomingBooking = (b) => b,
}) {
  const { token } = useWorkerAuth();
  const [jobs, setJobs] = useState(defaultJobs);
  const [selectedJobId, setSelectedJobId] = useState(() => defaultJobs[0]?.id || null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const syncJobs = useCallback(async () => {
    const allAliases = [category, ...categoryAliases].map((c) =>
      c.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    let customerBookings = [];
    try {
      const raw = localStorage.getItem('servecircle_customer_recent_bookings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          customerBookings = parsed.filter((b) => {
            const bCat = (b.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const bSvc = (b.service || '').toLowerCase();
            return allAliases.some((alias) => bCat.includes(alias) || alias.includes(bCat) || bSvc.includes(alias));
          });
        }
      }
    } catch (_) {}

    try {
      const allWf = getWorkflowBookings();
      if (Array.isArray(allWf)) {
        allWf.forEach((wf) => {
          const bCat = (wf.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const bSvc = (wf.service || '').toLowerCase();
          const match = allAliases.some((alias) => bCat.includes(alias) || alias.includes(bCat) || bSvc.includes(alias));
          if (match && !customerBookings.some((cb) => cb.id === wf.id || cb._id === wf.id)) {
            customerBookings.unshift(wf);
          }
        });
      }
    } catch (_) {}

    let apiJobs = [];
    if (token && token !== 'demo-token-worker') {
      try {
        const res = await fetchWorkerJobs(token);
        if (Array.isArray(res)) {
          apiJobs = res.filter((b) => {
            const bCat = (b.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return allAliases.some((alias) => bCat.includes(alias) || alias.includes(bCat));
          });
        }
      } catch (_) {}
    }

    const mergedIncoming = [...customerBookings];
    apiJobs.forEach((aj) => {
      const exists = mergedIncoming.some((m) => m._id === aj._id || m.bookingId === aj.bookingId);
      if (!exists) mergedIncoming.push(aj);
    });

    if (mergedIncoming.length > 0) {
      const normalizedIncoming = mergedIncoming.map((incoming, idx) => {
        const baseNormalized = normalizeIncomingBooking(incoming);
        return {
          id: incoming.bookingId || incoming._id || incoming.id || `JOB-INC-${idx + 1}`,
          ...baseNormalized,
          isLiveOrder: true,
          status: String(incoming.status || 'pending').toLowerCase(),
        };
      });

      setJobs((prevJobs) => {
        const remainingDefaults = defaultJobs.filter(
          (dj) => !normalizedIncoming.some((ni) => ni.id === dj.id)
        );
        const combined = [...normalizedIncoming, ...remainingDefaults];
        return combined;
      });

      // Prioritize selecting live incoming pending order so the worker immediately sees the Accept button!
      const pendingIncoming = normalizedIncoming.find((ni) =>
        ['pending', 'assigned', 'broadcast'].includes(String(ni.status || '').toLowerCase())
      );
      setSelectedJobId((cur) => {
        if (pendingIncoming && cur !== pendingIncoming.id) return pendingIncoming.id;
        if (!cur || !defaultJobs.some((d) => d.id === cur)) return normalizedIncoming[0]?.id;
        return cur;
      });
    } else {
      setJobs(defaultJobs);
    }
  }, [category, categoryAliases, defaultJobs, normalizeIncomingBooking, token]);

  useEffect(() => {
    syncJobs();
    const handleNewBooking = () => syncJobs();
    window.addEventListener('servecircle:new-booking', handleNewBooking);
    window.addEventListener('servecircle:job-status-updated', handleNewBooking);
    const unsubWorkflow = subscribeWorkflowUpdates(() => syncJobs());
    return () => {
      window.removeEventListener('servecircle:new-booking', handleNewBooking);
      window.removeEventListener('servecircle:job-status-updated', handleNewBooking);
      unsubWorkflow();
    };
  }, [syncJobs]);

  const updateRecentStorage = (jobId, newStatus) => {
    try {
      const raw = localStorage.getItem('servecircle_customer_recent_bookings');
      if (raw) {
        const list = JSON.parse(raw);
        const updated = list.map((b) =>
          b.id === jobId || b.bookingId === jobId || b._id === jobId ? { ...b, status: newStatus } : b
        );
        localStorage.setItem('servecircle_customer_recent_bookings', JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent('servecircle:job-status-updated', { detail: { jobId, status: newStatus } })
        );
      }
    } catch (_) {}
  };

  const handleJobAction = async (jobId, newStatus) => {
    const cleanId = String(jobId || '').trim();
    setJobs((prev) =>
      prev.map((j) => (j.id === cleanId || j._id === cleanId || String(j.id).replace(/^#/, '') === cleanId.replace(/^#/, '') ? { ...j, status: newStatus } : j))
    );
    updateRecentStorage(cleanId, newStatus);

    if (newStatus === 'accepted') {
      try {
        acceptWorkflowBooking(cleanId, {
          id: 'worker-specialist-01',
          name: 'Verified Specialist',
          phone: '+91 98250 12345',
          rating: 4.9,
          jobsCompleted: 342,
        });
      } catch (e) {
        console.warn('acceptWorkflowBooking note:', e);
      }
    } else if (newStatus === 'rejected') {
      try {
        declineWorkflowBooking(cleanId, 'worker-specialist-01');
      } catch (e) {
        console.warn('declineWorkflowBooking note:', e);
      }
    }

    if (token && token !== 'demo-token-worker') {
      try {
        await respondToJobRequest(token, cleanId.replace(/^#/, ''), newStatus === 'accepted' ? 'accept' : 'reject');
      } catch (err) {
        console.warn('Backend job respond notice:', err.message);
      }
    }

    showToast(
      newStatus === 'accepted'
        ? 'Job request accepted! Live dispatch & stage protocols activated.'
        : 'Job request declined.'
    );
  };

  const advanceStage = async (jobId) => {
    let finalStage = 1;
    let finalStatus = 'accepted';

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const curStage = j.currentStage || 1;
        let nextStage = curStage;
        let nextStatus = j.status || 'accepted';

        if (curStage === 1) {
          nextStage = 2;
          nextStatus = 'in-progress';
        } else if (curStage === 2) {
          nextStage = 3;
          nextStatus = 'in-progress';
        } else if (curStage === 3) {
          nextStage = 3;
          nextStatus = 'completed';
        }

        finalStage = nextStage;
        finalStatus = nextStatus;
        return { ...j, currentStage: nextStage, status: nextStatus };
      })
    );

    updateRecentStorage(jobId, finalStatus);

    if (token && token !== 'demo-token-worker') {
      try {
        const apiId = String(jobId || '').replace(/^#/, '');
        if (finalStatus === 'completed') {
          await updateWorkerJobStatus(token, apiId, 'completed');
        } else {
          await updateWorkerJobStatus(token, apiId, 'in-progress');
        }
      } catch (err) {
        console.warn('Backend advance stage notice:', err.message);
      }
    }

    showToast(
      finalStatus === 'completed'
        ? 'Service successfully completed! Final payout credited to Worker Wallet.'
        : `Advanced to Stage ${finalStage}! Operational protocols updated.`
    );
  };

  const toggleChecklist = (jobId, section, keyOrIdx) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        if (Array.isArray(j[section])) {
          const list = [...j[section]];
          if (typeof list[keyOrIdx] === 'object') {
            const currentItem = list[keyOrIdx];
            const updatedItem = { ...currentItem };

            if (updatedItem.done !== undefined) {
              updatedItem.done = !updatedItem.done;
            }
            if (updatedItem.packed !== undefined) {
              updatedItem.packed = !updatedItem.packed;
            }
            if (updatedItem.washed !== undefined) {
              updatedItem.washed = !updatedItem.washed;
            }
            if (typeof updatedItem.status === 'string') {
              if (updatedItem.status === 'Pending') {
                updatedItem.status = 'Boarded';
              } else if (updatedItem.status === 'Boarded') {
                updatedItem.status = 'Dropped / Safe';
              } else if (updatedItem.status === 'In Progress') {
                updatedItem.status = 'Completed';
              } else if (updatedItem.status === 'Completed') {
                updatedItem.status = 'Pending';
              } else if (updatedItem.status.includes('Dropped')) {
                updatedItem.status = 'Pending';
              } else {
                updatedItem.status = 'Completed';
              }
            }
            list[keyOrIdx] = updatedItem;
          }
          return { ...j, [section]: list };
        } else if (j[section] && typeof j[section] === 'object') {
          return {
            ...j,
            [section]: {
              ...j[section],
              [keyOrIdx]: !j[section][keyOrIdx],
            },
          };
        }
        return j;
      })
    );
    showToast('Checklist protocol verified.');
  };

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  return {
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
    currentJob,
    handleJobAction,
    advanceStage,
    toggleChecklist,
    toastMsg,
    showToast,
  };
}
