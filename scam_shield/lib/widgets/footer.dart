import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher_string.dart';

class Footer extends StatelessWidget {
  const Footer({Key? key}) : super(key: key);

  Future<void> _launchURL() async {
    const url = 'https://www.instagram.com/kingrishit2.0/';
    if (await canLaunchUrlString(url)) {
      await launchUrlString(url);
    } else {
      throw 'Could not launch \$url';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.all(12),
      child: Center(
        child: GestureDetector(
          onTap: _launchURL,
          child: RichText(
            text: TextSpan(
              text: 'Made with ❤️ by ',
              style: const TextStyle(color: Colors.white70, fontSize: 14),
              children: const [
                TextSpan(
                  text: 'Rishit Tandon',
                  style: TextStyle(
                    color: Colors.tealAccent,
                    decoration: TextDecoration.underline,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
