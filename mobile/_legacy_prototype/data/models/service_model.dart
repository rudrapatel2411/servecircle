class ServiceModel {
  final String id;
  final String name;
  final String category;
  final String? subCategory;
  final String description;
  final double price;
  final String? image;
  final String? icon;
  final double rating;
  final int reviewsCount;
  final String? duration;

  ServiceModel({
    required this.id,
    required this.name,
    required this.category,
    this.subCategory,
    required this.description,
    required this.price,
    this.image,
    this.icon,
    this.rating = 4.8,
    this.reviewsCount = 120,
    this.duration,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    final priceVal = json['price'] ?? json['basePrice'];
    final durationVal = json['duration'] ?? (json['estimatedDuration'] != null ? '${json['estimatedDuration']} min' : '45-60 min');

    return ServiceModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? 'Service',
      category: json['category'] ?? 'General',
      subCategory: json['subCategory'],
      description: json['description'] ?? '',
      price: (priceVal is num) ? priceVal.toDouble() : 499.0,
      image: json['image'],
      icon: json['icon'],
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.8,
      reviewsCount: json['reviewsCount'] ?? 120,
      duration: durationVal,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'category': category,
      'subCategory': subCategory,
      'description': description,
      'price': price,
      'image': image,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'duration': duration,
    };
  }
}
