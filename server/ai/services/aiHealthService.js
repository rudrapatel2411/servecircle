/**
 * server/ai/services/aiHealthService.js — Enterprise AI Health & Reliability Monitor
 *
 * Monitors real-time AI Provider status, latency averages, quota alerts,
 * error rates, retry counts, and health snapshots.
 */

import { AIProviderManager } from '../providers/AIProviderManager.js';
import AIAnalysis from '../../models/AIAnalysis.js';

export class AIHealthService {
  /**
   * Return real-time health snapshot of AI infrastructure.
   *
   * @returns {Promise<object>} Health Status payload
   */
  static async getHealthStatus() {
    const providerSnapshot = AIProviderManager.getHealthSnapshot();
    const activeProvider = AIProviderManager.getActiveProviderName() || 'gemini';

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const [recentStats] = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: tenMinutesAgo } } },
      {
        $group: {
          _id: null,
          total:        { $sum: 1 },
          failures:     { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          retries:      { $sum: { $cond: [{ $eq: ['$status', 'RETRIED'] }, 1, 0] } },
          avgLatency:   { $avg: '$latency' },
        },
      },
    ]);

    const totalRecent = recentStats?.total || 0;
    const failureCount = recentStats?.failures || 0;
    const retryCount = recentStats?.retries || 0;
    const errorRatePercent = totalRecent > 0 ? Number(((failureCount / totalRecent) * 100).toFixed(2)) : 0;

    const [lastSuccessDoc] = await AIAnalysis.find({ status: { $in: ['COMPLETED', 'CACHED'] } })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    const [lastFailureDoc] = await AIAnalysis.find({ status: 'FAILED' })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    return {
      status:           providerSnapshot?.ready ? 'HEALTHY' : 'DEGRADED',
      provider:         activeProvider,
      ready:            providerSnapshot?.ready || false,
      responseTimeMs:   providerSnapshot?.responseTimeMs || 0,
      lastSuccess:      lastSuccessDoc?.createdAt || providerSnapshot?.lastCheck || new Date().toISOString(),
      lastFailure:      lastFailureDoc?.createdAt || null,
      averageLatencyMs: Math.round(recentStats?.avgLatency || providerSnapshot?.responseTimeMs || 0),
      quotaStatus:      providerSnapshot?.note?.includes('Quota') ? 'QUOTA_WARNING' : 'NORMAL',
      retryCount:       retryCount,
      errorRatePercent,
      note:             providerSnapshot?.note || 'OK',
    };
  }
}
