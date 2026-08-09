class AIChatResponseModel {
  final String status;
  final String message;
  final String intent;
  final bool showServiceRecommendation;
  final List<String> followUpQuestions;
  final ServiceRecommendationData? serviceRecommendation;

  AIChatResponseModel({
    required this.status,
    required this.message,
    required this.intent,
    required this.showServiceRecommendation,
    required this.followUpQuestions,
    this.serviceRecommendation,
  });

  factory AIChatResponseModel.fromJson(Map<String, dynamic> json) {
    List<String> followUps = [];
    if (json['followUpQuestions'] is List) {
      followUps = (json['followUpQuestions'] as List).map((e) => e.toString()).toList();
    }

    ServiceRecommendationData? recommendation;
    if (json['analysis'] != null && json['analysis']['recommendedService'] != null) {
      recommendation = ServiceRecommendationData.fromJson(json['analysis']['recommendedService']);
    } else if (json['recommendedService'] != null) {
      recommendation = ServiceRecommendationData.fromJson(json['recommendedService']);
    }

    return AIChatResponseModel(
      status: json['status'] ?? 'success',
      message: json['message'] ?? json['reply'] ?? 'Thank you for reaching out to ServeCircle AI.',
      intent: json['intent'] ?? 'general_inquiry',
      showServiceRecommendation: json['showServiceRecommendation'] ?? (recommendation != null),
      followUpQuestions: followUps,
      serviceRecommendation: recommendation,
    );
  }
}

class ServiceRecommendationData {
  final String? serviceId;
  final String serviceName;
  final String category;
  final double estimatedPrice;
  final String description;
  final String? urgency;

  ServiceRecommendationData({
    this.serviceId,
    required this.serviceName,
    required this.category,
    required this.estimatedPrice,
    required this.description,
    this.urgency,
  });

  factory ServiceRecommendationData.fromJson(Map<String, dynamic> json) {
    return ServiceRecommendationData(
      serviceId: json['serviceId'] ?? json['_id'],
      serviceName: json['serviceName'] ?? json['name'] ?? 'Recommended Service',
      category: json['category'] ?? 'General Repairs',
      estimatedPrice: (json['estimatedPrice'] ?? json['price'] is num)
          ? ((json['estimatedPrice'] ?? json['price']) as num).toDouble()
          : 499.0,
      description: json['description'] ?? 'Instant professional booking via ServeCircle AI.',
      urgency: json['urgency'] ?? 'Medium',
    );
  }
}
