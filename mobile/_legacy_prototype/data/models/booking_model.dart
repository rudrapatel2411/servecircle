import 'user_model.dart';
import 'service_model.dart';

class BookingModel {
  final String id;
  final String bookingId;
  final dynamic service;
  final dynamic customer;
  final dynamic worker;
  final String status;
  final String scheduledDate;
  final String? timeSlot;
  final String address;
  final String? notes;
  final double amount;
  final String paymentMethod;
  final String? startOtp;
  final bool isVerified;
  final String createdAt;

  BookingModel({
    required this.id,
    required this.bookingId,
    this.service,
    this.customer,
    this.worker,
    required this.status,
    required this.scheduledDate,
    this.timeSlot,
    required this.address,
    this.notes,
    required this.amount,
    this.paymentMethod = 'Cash on Delivery',
    this.startOtp,
    this.isVerified = false,
    required this.createdAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['_id'] ?? json['id'] ?? '',
      bookingId: json['bookingId'] ?? 'SC-1000',
      service: json['service'] is Map<String, dynamic>
          ? ServiceModel.fromJson(json['service'])
          : json['service'],
      customer: json['customer'] is Map<String, dynamic>
          ? UserModel.fromJson(json['customer'])
          : json['customer'],
      worker: json['worker'] is Map<String, dynamic>
          ? UserModel.fromJson(json['worker'])
          : json['worker'],
      status: json['status'] ?? 'pending',
      scheduledDate: json['scheduledDate'] ?? DateTime.now().toIso8601String(),
      timeSlot: json['timeSlot'] ?? '10:00 AM - 12:00 PM',
      address: json['address'] ?? '',
      notes: json['notes'],
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      paymentMethod: json['paymentMethod'] ?? 'Cash on Delivery',
      startOtp: json['startOtp'],
      isVerified: json['isVerified'] ?? false,
      createdAt: json['createdAt'] ?? DateTime.now().toIso8601String(),
    );
  }

  String get serviceName {
    if (service is ServiceModel) return (service as ServiceModel).name;
    if (service is Map && service['name'] != null) return service['name'];
    return 'ServeCircle Service';
  }

  String get customerName {
    if (customer is UserModel) return (customer as UserModel).name;
    if (customer is Map && customer['name'] != null) return customer['name'];
    return 'Customer';
  }

  String get workerName {
    if (worker is UserModel) return (worker as UserModel).name;
    if (worker is Map && worker['name'] != null) return worker['name'];
    return 'Assigned Worker';
  }
}
