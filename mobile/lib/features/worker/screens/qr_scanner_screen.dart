import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/repositories/worker_repository.dart';

class QRScannerScreen extends ConsumerStatefulWidget {
  const QRScannerScreen({super.key});

  @override
  ConsumerState<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends ConsumerState<QRScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;
  Map<String, dynamic>? _scannedResult;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawValue = barcodes.first.rawValue;
    if (rawValue == null || rawValue.isEmpty) return;

    setState(() {
      _isProcessing = true;
      _error = null;
    });

    // Extract workerIdCode from URL or raw value (e.g. SC-W-1001)
    String code = rawValue;
    if (rawValue.contains('/worker/')) {
      code = rawValue.split('/worker/').last;
    } else if (rawValue.contains('code=')) {
      code = rawValue.split('code=').last.split('&').first;
    }

    try {
      final res = await WorkerRepository().getWorkerVerification(code);
      if (mounted) {
        setState(() {
          _scannedResult = res;
          _isProcessing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Worker code "$code" is NOT authorized by ServeCircle.';
          _isProcessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Verification QR Scanner'),
      ),
      body: Column(
        children: [
          Expanded(
            flex: 2,
            child: Stack(
              children: [
                MobileScanner(
                  controller: _controller,
                  onDetect: _onDetect,
                ),
                Center(
                  child: Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.accentBlue, width: 3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: Colors.white,
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    if (_isProcessing)
                      const CircularProgressIndicator()
                    else if (_scannedResult != null) ...[
                      const Icon(Icons.check_circle_rounded, color: AppTheme.emeraldGreen, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        _scannedResult!['name'] ?? 'Verified ServeCircle Pro',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppTheme.darkNavy),
                      ),
                      Text(
                        'Worker ID: ${_scannedResult!['workerIdCode'] ?? "SC-W-1001"}',
                        style: const TextStyle(color: AppTheme.accentBlue, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Authorization: ${_scannedResult!['isAuthorized'] == true ? "AUTHORIZED VERIFIED PRO ✅" : "SUSPENDED ❌"}',
                        style: TextStyle(
                          color: _scannedResult!['isAuthorized'] == true ? AppTheme.emeraldGreen : AppTheme.roseDanger,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ] else if (_error != null) ...[
                      const Icon(Icons.cancel_rounded, color: AppTheme.roseDanger, size: 48),
                      const SizedBox(height: 8),
                      Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.roseDanger, fontWeight: FontWeight.bold)),
                    ] else ...[
                      const Icon(Icons.qr_code_scanner_rounded, size: 40, color: Colors.grey),
                      const SizedBox(height: 8),
                      const Text(
                        'Scan Worker ID Card QR Code to verify live background clearance',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
