/**
 * server/ai/services/aiUsageService.js — Enterprise AI Usage Metrics & Analytics Service
 *
 * Tracks, aggregates, and queries historical AI metrics from the AIAnalysis database model
 * and provides enterprise dashboard metrics.
 */

import AIAnalysis from '../../models/AIAnalysis.js';

export class AIUsageService {
  /**
   * Return comprehensive dashboard metrics for AI usage today and historically.
   *
   * @returns {Promise<object>} Dashboard metrics payload
   */
  static async getDashboardMetrics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayStats] = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          totalRequests:    { $sum: 1 },
          totalTokens:      { $sum: '$totalTokens' },
          totalCost:        { $sum: '$estimatedCost' },
          completed:        { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cached:           { $sum: { $cond: [{ $eq: ['$status', 'CACHED'] }, 1, 0] } },
          failed:           { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          retried:          { $sum: { $cond: [{ $eq: ['$status', 'RETRIED'] }, 1, 0] } },
          avgLatencyMs:     { $avg: '$latency' },
          avgConfidence:    { $avg: '$confidence' },
        },
      },
    ]);

    const todayCount = todayStats?.totalRequests || 0;
    const successCount = (todayStats?.completed || 0) + (todayStats?.cached || 0);
    const successRate = todayCount > 0 ? Number(((successCount / todayCount) * 100).toFixed(2)) : 100;
    const failureRate = todayCount > 0 ? Number((((todayStats?.failed || 0) / todayCount) * 100).toFixed(2)) : 0;

    // Provider distribution today
    const providerDist = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
    ]);

    // Language distribution today
    const langDist = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
    ]);

    // Top services & problems today
    const topProblems = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: '$parsedResponse.problemCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topServices = await AIAnalysis.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: '$parsedResponse.serviceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      todaysRequests:     todayCount,
      todaysCostUsd:      Number((todayStats?.totalCost || 0).toFixed(6)),
      todaysTokens:       todayStats?.totalTokens || 0,
      successRatePercent: successRate,
      failureRatePercent: failureRate,
      avgConfidence:      Number((todayStats?.avgConfidence || 0.85).toFixed(2)),
      avgResponseTimeMs:  Math.round(todayStats?.avgLatencyMs || 0),
      providerDistribution: providerDist.map(p => ({ provider: p._id || 'gemini', count: p.count })),
      languageDistribution: langDist.map(l => ({ language: l._id || 'English', count: l.count })),
      topServices:        topServices.map(s => ({ service: s._id || 'General', count: s.count })),
      topProblems:        topProblems.map(p => ({ problem: p._id || 'General', count: p.count })),
    };
  }

  /**
   * Query historical AI Analysis logs with filters and pagination.
   *
   * @param {object} filter
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<object>} Paginated list of AIAnalysis documents
   */
  static async getHistory({ feature, provider, bookingId, customerId, status, page = 1, limit = 20 } = {}) {
    const query = {};
    if (feature)    query.feature   = feature;
    if (provider)   query.provider  = provider;
    if (bookingId)  query.bookingId = bookingId;
    if (customerId) query.customerId = customerId;
    if (status)     query.status    = status;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      AIAnalysis.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AIAnalysis.countDocuments(query),
    ]);

    return {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      count: docs.length,
      history: docs,
    };
  }

  /**
   * Return cost breakdown over a date range.
   */
  static async getCostAnalytics({ startDate, endDate } = {}) {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(endDate);
    }

    const [stats] = await AIAnalysis.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPromptTokens:     { $sum: '$promptTokens' },
          totalCompletionTokens: { $sum: '$completionTokens' },
          totalTokens:           { $sum: '$totalTokens' },
          totalCostUsd:          { $sum: '$estimatedCost' },
          avgCostPerRequestUsd:  { $avg: '$estimatedCost' },
        },
      },
    ]);

    return {
      totalPromptTokens:     stats?.totalPromptTokens || 0,
      totalCompletionTokens: stats?.totalCompletionTokens || 0,
      totalTokens:           stats?.totalTokens || 0,
      totalCostUsd:          Number((stats?.totalCostUsd || 0).toFixed(6)),
      avgCostPerRequestUsd:  Number((stats?.avgCostPerRequestUsd || 0).toFixed(6)),
    };
  }
}
