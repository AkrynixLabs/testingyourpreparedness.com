import 'package:flutter/material.dart';

/// Colors pulled directly from the web app's real design tokens
/// (app/globals.css's `:root` / `.dark` OKLCH values), converted to sRGB hex
/// rather than invented fresh - keeps the mobile app visually consistent
/// with the existing product instead of drifting into its own palette.
class AppColors {
  AppColors._();

  // Light (app/globals.css :root)
  static const lightBackground = Color(0xFFFBFCFD);
  static const lightForeground = Color(0xFF050C13);
  static const lightCard = Color(0xFFFFFFFF);
  static const lightPrimary = Color(0xFF0072D5);
  static const lightPrimaryForeground = Color(0xFFFFFFFF);
  static const lightSecondary = Color(0xFFEDF2F8);
  static const lightMutedForeground = Color(0xFF5B646F);
  static const lightAccent = Color(0xFFD1E7FF);
  static const lightDestructive = Color(0xFFD40924);
  static const lightBorder = Color(0xFFDCE2E8);
  static const lightSuccess = Color(0xFF189A30);
  static const lightWarning = Color(0xFFD9A514);

  // Dark (app/globals.css .dark)
  static const darkBackground = Color(0xFF02060D);
  static const darkForeground = Color(0xFFEAEFF5);
  static const darkCard = Color(0xFF070E16);
  static const darkPrimary = Color(0xFF0F92F7);
  static const darkPrimaryForeground = Color(0xFF010408);
  static const darkSecondary = Color(0xFF141B24);
  static const darkMutedForeground = Color(0xFF86909B);
  static const darkAccent = Color(0xFF142F4B);
  static const darkDestructive = Color(0xFFA9000C);
  static const darkBorder = Color(0xFF212A33);
  static const darkSuccess = Color(0xFF1C882D);
  static const darkWarning = Color(0xFFC99500);
}

class AppTheme {
  AppTheme._();

  static ThemeData get light => _build(
        brightness: Brightness.light,
        background: AppColors.lightBackground,
        foreground: AppColors.lightForeground,
        card: AppColors.lightCard,
        primary: AppColors.lightPrimary,
        primaryForeground: AppColors.lightPrimaryForeground,
        secondary: AppColors.lightSecondary,
        mutedForeground: AppColors.lightMutedForeground,
        border: AppColors.lightBorder,
        destructive: AppColors.lightDestructive,
      );

  static ThemeData get dark => _build(
        brightness: Brightness.dark,
        background: AppColors.darkBackground,
        foreground: AppColors.darkForeground,
        card: AppColors.darkCard,
        primary: AppColors.darkPrimary,
        primaryForeground: AppColors.darkPrimaryForeground,
        secondary: AppColors.darkSecondary,
        mutedForeground: AppColors.darkMutedForeground,
        border: AppColors.darkBorder,
        destructive: AppColors.darkDestructive,
      );

  static ThemeData _build({
    required Brightness brightness,
    required Color background,
    required Color foreground,
    required Color card,
    required Color primary,
    required Color primaryForeground,
    required Color secondary,
    required Color mutedForeground,
    required Color border,
    required Color destructive,
  }) {
    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: primary,
      onPrimary: primaryForeground,
      secondary: secondary,
      onSecondary: foreground,
      error: destructive,
      onError: Colors.white,
      surface: card,
      onSurface: foreground,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: background,
      // 0.75rem in app/globals.css's --radius, matched here rather than
      // Material's own default corner radius.
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: secondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: primary, width: 2),
        ),
        labelStyle: TextStyle(color: mutedForeground),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: primaryForeground,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        elevation: 0,
        centerTitle: false,
      ),
      tabBarTheme: TabBarThemeData(
        labelColor: primary,
        unselectedLabelColor: mutedForeground,
        indicatorColor: primary,
      ),
      textTheme: Typography.material2021().black.apply(
            bodyColor: foreground,
            displayColor: foreground,
          ),
    );
  }
}
