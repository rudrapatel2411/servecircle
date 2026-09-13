import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/service_model.dart';
import '../../../data/repositories/service_repository.dart';

final serviceRepositoryProvider = Provider((ref) => ServiceRepository());

final serviceCategoryProvider = StateProvider<String>((ref) => 'All');
final searchQueryProvider = StateProvider<String>((ref) => '');

final servicesListProvider = FutureProvider<List<ServiceModel>>((ref) async {
  final repository = ref.watch(serviceRepositoryProvider);
  final category = ref.watch(serviceCategoryProvider);
  final search = ref.watch(searchQueryProvider);
  return repository.getServices(category: category, search: search);
});

final serviceDetailProvider = FutureProvider.family<ServiceModel, String>((ref, id) async {
  final repository = ref.watch(serviceRepositoryProvider);
  return repository.getServiceById(id);
});
