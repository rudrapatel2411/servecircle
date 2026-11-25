import { useState, useEffect, useCallback } from 'react';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, respondToJobRequest, updateWorkerJobStatus } from './workerApi';

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
          status: incoming.status || 'pending',
        };
      });

      setJobs((prevJobs) => {
        const remainingDefaults = defaultJobs.filter(
          (dj) => !normalizedIncoming.some((ni) => ni.id === dj.id)
        );
        const combined = [...normalizedIncoming, ...remainingDefaults];
        return combined;
      });

      if (!selectedJobId || !defaultJobs.some((d) => d.id === selectedJobId)) {
        setSelectedJobId(normalizedIncoming[0]?.id);
      }
    } else {
      setJobs(defaultJobs);
    }
  }, [category, categoryAliases, defaultJobs, normalizeIncomingBooking, token, selectedJobId]);

  useEffect(() => {
    syncJobs();
    const handleNewBooking = () => syncJobs();
    window.addEventListener('servecircle:new-booking', handleNewBooking);
    window.addEventListener('servecircle:job-status-updated', handleNewBooking);
    return () => {
      window.removeEventListener('servecircle:new-booking', handleNewBooking);
      window.removeEventListener('servecircle:job-status-updated', handleNewBooking);
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
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    updateRecentStorage(jobId, newStatus);

    if (token && token !== 'demo-token-worker') {
      try {
        await respondToJobRequest(token, jobId, newStatus === 'accepted' ? 'accept' : 'reject');
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
        if (finalStatus === 'completed') {
          await updateWorkerJobStatus(token, jobId, 'completed');
        } else {
          await updateWorkerJobStatus(token, jobId, 'in-progress');
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
