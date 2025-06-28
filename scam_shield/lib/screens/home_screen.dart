import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../widgets/feature_card.dart';
import 'phishing_email_detection_screen.dart';
import 'fake_news_detection_screen.dart';
import 'scam_url_detection_screen.dart';
import 'financial_fraud_monitor_screen.dart';
import 'app_scanner_screen.dart';
import 'scam_chatbot_screen.dart';
import 'fake_profile_detector_screen.dart';
import 'image_scam_detection_screen.dart';
import 'online_job_scam_analyzer_screen.dart';
import '../widgets/footer.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({Key? key}) : super(key: key);

  final List<_Feature> features = [
    _Feature(
      'Phishing Email Detection',
      Icons.email_outlined,
      PhishingEmailDetectionScreen(),
      const LinearGradient(
        colors: [Color(0xFF0F2027), Color(0xFF2C5364)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Fake News Detection',
      Icons.article_outlined,
      FakeNewsDetectionScreen(),
      const LinearGradient(
        colors: [Color(0xFFFF512F), Color(0xFFDD2476)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Scam URL Detection',
      Icons.link_outlined,
      ScamUrlDetectionScreen(),
      const LinearGradient(
        colors: [Color(0xFF1D2671), Color(0xFFC33764)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Financial Fraud Monitor',
      Icons.account_balance_wallet_outlined,
      FinancialFraudMonitorScreen(),
      const LinearGradient(
        colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'App Scanner',
      Icons.apps_outlined,
      AppScannerScreen(),
      const LinearGradient(
        colors: [Color(0xFF8E2DE2), Color(0xFF4A00E0)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Scam Chatbot',
      Icons.chat_bubble_outline,
      ScamChatbotScreen(),
      const LinearGradient(
        colors: [Color(0xFF00ADB5), Color(0xFF00FFF5)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Fake Profile Detector',
      Icons.person_search_outlined,
      FakeProfileDetectorScreen(),
      const LinearGradient(
        colors: [Color(0xFFB24592), Color(0xFFF15F79)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Online Job Scam Analyzer',
      Icons.work_outline,
      OnlineJobScamAnalyzerScreen(),
      const LinearGradient(
        colors: [Color(0xFF0F2027), Color(0xFF203A43)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    _Feature(
      'Image Scam Detection',
      Icons.image_outlined,
      ImageScamDetectionScreen(),
      const LinearGradient(
        colors: [Color(0xFF1F4037), Color(0xFF99F2C8)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.shield, color: Colors.white),
            SizedBox(width: 8),
            Text(
              'Scam Shield',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 22,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.black,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: ListView.separated(
          itemCount: features.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final feature = features[index];
            return FeatureCard(
              title: feature.title,
              iconData: feature.icon,
              accentColor:
                  feature.gradient?.colors.first ?? const Color(0xFF00BFA5),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => feature.screen),
                );
              },
              gradient: feature.gradient,
            )
                .animate()
                .fadeIn(duration: 400.ms)
                .slideX(begin: 0.2, duration: 400.ms)
                .delay(milliseconds: 80 * index);
          },
        ),
      ),
      bottomNavigationBar: const Footer(),
    );
  }
}

class _Feature {
  final String title;
  final IconData icon;
  final Widget screen;
  final LinearGradient gradient;

  _Feature(this.title, this.icon, this.screen, this.gradient);
}
