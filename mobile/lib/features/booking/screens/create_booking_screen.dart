import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../controllers/booking_controller.dart';

class CreateBookingScreen extends ConsumerStatefulWidget {
  final String serviceId;
  final String serviceName;
  final String category;
  final double amount;

  const CreateBookingScreen({
    super.key,
    required this.serviceId,
    required this.serviceName,
    required this.category,
    required this.amount,
  });

  @override
  ConsumerState<CreateBookingScreen> createState() => _CreateBookingScreenState();
}

class _CreateBookingScreenState extends ConsumerState<CreateBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedSlot = '10:00 AM - 12:00 PM';
  String _paymentMethod = 'Cash on Delivery';

  final List<String> _timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  @override
  void dispose() {
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submitBooking() async {
    if (_formKey.currentState!.validate()) {
      final booking = await ref.read(bookingControllerProvider.notifier).createBooking(
            serviceId: widget.serviceId,
            serviceName: widget.serviceName,
            category: widget.category,
            scheduledDate: DateFormat('yyyy-MM-dd').format(_selectedDate),
            timeSlot: _selectedSlot,
            address: _addressController.text.trim(),
            notes: _notesController.text.trim(),
            amount: widget.amount,
            paymentMethod: _paymentMethod,
          );

      if (booking != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Booking ${booking.bookingId} created successfully! ✅')),
        );
        context.go('/customer');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm Service Booking'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  color: AppTheme.lightBlueBg,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.serviceName,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.darkNavy),
                        ),
                        const SizedBox(height: 4),
                        Text('Category: ${widget.category}', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Service Charge', style: TextStyle(fontWeight: FontWeight.w600)),
                            Text('₹${widget.amount.toInt()}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.accentBlue)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                const Text('Scheduled Date & Time', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.calendar_today_rounded),
                        label: Text(DateFormat('EEE, dd MMM yyyy').format(_selectedDate)),
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 30)),
                          );
                          if (date != null) setState(() => _selectedDate = date);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                DropdownButtonFormField<String>(
                  value: _selectedSlot,
                  decoration: const InputDecoration(
                    labelText: 'Time Slot',
                    prefixIcon: Icon(Icons.access_time_rounded),
                  ),
                  items: _timeSlots.map((slot) => DropdownMenuItem(value: slot, child: Text(slot))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedSlot = val);
                  },
                ),
                const SizedBox(height: 20),

                const Text('Service Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                TextFormField(
                  controller: _addressController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Complete Address',
                    hintText: 'House/Flat No, Building, Area, City',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Enter service address' : null,
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Problem Notes (Optional)',
                    hintText: 'e.g. AC leaking water on floor',
                    prefixIcon: Icon(Icons.note_alt_outlined),
                  ),
                ),
                const SizedBox(height: 20),

                const Text('Payment Method', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                RadioListTile<String>(
                  title: const Text('Cash on Delivery (Pay after service)'),
                  value: 'Cash on Delivery',
                  groupValue: _paymentMethod,
                  onChanged: (val) => setState(() => _paymentMethod = val!),
                ),
                RadioListTile<String>(
                  title: const Text('Online Wallet / UPI'),
                  value: 'UPI Online',
                  groupValue: _paymentMethod,
                  onChanged: (val) => setState(() => _paymentMethod = val!),
                ),

                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: bookingState.isLoading ? null : _submitBooking,
                  child: bookingState.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Confirm & Submit Booking'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
