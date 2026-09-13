import 'package:flutter/material.dart';
import '../../ai_chat/screens/ai_chat_screen.dart';
import '../../booking/screens/booking_history_screen.dart';
import 'customer_home_screen.dart';
import 'customer_services_screen.dart';
import 'customer_profile_screen.dart';

class CustomerMainNavigation extends StatefulWidget {
  const CustomerMainNavigation({super.key});

  @override
  State<CustomerMainNavigation> createState() => _CustomerMainNavigationState();
}

class _CustomerMainNavigationState extends State<CustomerMainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    CustomerHomeScreen(),
    CustomerServicesScreen(),
    AIChatScreen(),
    BookingHistoryScreen(),
    CustomerProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.build_outlined),
            selectedIcon: Icon(Icons.build_rounded),
            label: 'Services',
          ),
          NavigationDestination(
            icon: Icon(Icons.smart_toy_outlined, color: Color(0xFF2563EB)),
            selectedIcon: Icon(Icons.smart_toy_rounded, color: Color(0xFF2563EB)),
            label: 'AI Chat',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment_rounded),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
