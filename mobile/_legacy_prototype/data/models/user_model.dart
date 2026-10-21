class UserModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? avatar;
  final List<String> skills;
  final String? serviceCategory;
  final String? workerIdCode;
  final bool isVerified;
  final String? workerStatus;
  final double rating;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.avatar,
    this.skills = const [],
    this.serviceCategory,
    this.workerIdCode,
    this.isVerified = false,
    this.workerStatus,
    this.rating = 4.9,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      avatar: json['avatar'],
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      serviceCategory: json['serviceCategory'],
      workerIdCode: json['workerIdCode'],
      isVerified: json['isVerified'] ?? false,
      workerStatus: json['workerStatus'],
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.9,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'avatar': avatar,
      'skills': skills,
      'serviceCategory': serviceCategory,
      'workerIdCode': workerIdCode,
      'isVerified': isVerified,
      'workerStatus': workerStatus,
      'rating': rating,
    };
  }
}
