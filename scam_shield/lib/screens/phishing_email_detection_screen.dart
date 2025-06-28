import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class PhishingEmailDetectionScreen extends StatefulWidget {
  const PhishingEmailDetectionScreen({Key? key}) : super(key: key);

  @override
  _PhishingEmailDetectionScreenState createState() =>
      _PhishingEmailDetectionScreenState();
}

class _PhishingEmailDetectionScreenState
    extends State<PhishingEmailDetectionScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _scanned = false;
  bool _isPhishing = false;
  String _resultExplanation = '';

  void _scanEmail() {
    final text = _controller.text.toLowerCase();
    final phishingKeywords = [
      'password',
      'account',
      'verify',
      'login',
      'urgent',
      'click',
      'bank',
    ];
    bool detected = phishingKeywords.any((keyword) => text.contains(keyword));

    setState(() {
      _scanned = true;
      _isPhishing = detected;
      _resultExplanation = detected
          ? 'The email contains suspicious keywords indicating a possible phishing attempt.'
          : 'No suspicious content detected. The email appears safe.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D1117),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1117),
        elevation: 0,
        title: Text(
          'Phishing Email Detection',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: Colors.tealAccent,
          ),
        ),
        leading: BackButton(color: Colors.tealAccent),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: const Color(0xFF161B22),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 6,
              shadowColor: Colors.tealAccent.withOpacity(0.3),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  'Paste any suspicious email content below to check if it might be a phishing attempt.',
                  style: GoogleFonts.poppins(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _controller,
              maxLines: null,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Paste email content here...',
                hintStyle: GoogleFonts.poppins(color: Colors.white54),
                filled: true,
                fillColor: const Color(0xFF1C222A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 18,
                  horizontal: 24,
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _scanEmail,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.tealAccent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  elevation: 8,
                  shadowColor: Colors.tealAccent.withOpacity(0.6),
                ),
                child: Text(
                  'Scan for Phishing',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 600),
              child: _scanned
                  ? Card(
                          key: ValueKey(_isPhishing),
                          color: _isPhishing
                              ? Colors.red[900]
                              : Colors.green[900],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                          shadowColor: _isPhishing
                              ? Colors.redAccent.withOpacity(0.6)
                              : Colors.greenAccent.withOpacity(0.6),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _isPhishing
                                      ? 'Result: ⚠️ Likely Phishing'
                                      : 'Result: ✅ Safe',
                                  style: GoogleFonts.poppins(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    shadows: [
                                      Shadow(
                                        color: Colors.black.withOpacity(0.7),
                                        offset: const Offset(1, 1),
                                        blurRadius: 3,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _resultExplanation,
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                        .animate()
                        .fadeIn(duration: 600.ms)
                        .slideY(begin: 0.2, duration: 600.ms)
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}
