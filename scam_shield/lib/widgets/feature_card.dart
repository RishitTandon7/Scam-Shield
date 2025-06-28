import 'package:flutter/material.dart';

class FeatureCard extends StatelessWidget {
  final String title;
  final IconData iconData;
  final VoidCallback onTap;
  final Gradient? gradient;
  final Color accentColor;

  const FeatureCard({
    Key? key,
    required this.title,
    required this.iconData,
    required this.onTap,
    this.gradient,
    required this.accentColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      splashColor: accentColor.withOpacity(0.3),
      highlightColor: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: gradient == null ? Color(0xFF1E1E1E) : null,
          gradient: gradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: accentColor.withOpacity(0.4),
              blurRadius: 10,
              offset: Offset(0, 5),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
        child: Row(
          children: [
            Icon(iconData, size: 36, color: accentColor),
            SizedBox(width: 20),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 18,
                  color: Colors.white70,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
