import 'package:flutter/cupertino.dart' show CupertinoPageTransitionsBuilder;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

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

  // Same 2 fonts as app/layout.tsx's Inter/Space Grotesk pairing (Geist
  // Mono is web-only - no monospace UI surface exists in this app) so the
  // mobile app reads as the same product, not a separately-designed one.
  static TextStyle get _display => GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600);
  static TextStyle get _body => GoogleFonts.inter();

  static ThemeData get light => _build(
        brightness: Brightness.light,
        background: AppColors.lightBackground,
        foreground: AppColors.lightForeground,
        card: AppColors.lightCard,
        primary: AppColors.lightPrimary,
        primaryForeground: AppColors.lightPrimaryForeground,
        secondary: AppColors.lightSecondary,
        mutedForeground: AppColors.lightMutedForeground,
        accent: AppColors.lightAccent,
        border: AppColors.lightBorder,
        destructive: AppColors.lightDestructive,
        success: AppColors.lightSuccess,
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
        accent: AppColors.darkAccent,
        border: AppColors.darkBorder,
        destructive: AppColors.darkDestructive,
        success: AppColors.darkSuccess,
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
    required Color accent,
    required Color border,
    required Color destructive,
    required Color success,
  }) {
    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: primary,
      onPrimary: primaryForeground,
      secondary: secondary,
      onSecondary: foreground,
      tertiary: accent,
      onTertiary: foreground,
      error: destructive,
      onError: Colors.white,
      surface: card,
      onSurface: foreground,
      surfaceContainerHighest: secondary,
      outline: border,
    );

    final baseText = Typography.material2021().black.apply(
          bodyColor: foreground,
          displayColor: foreground,
        );
    final textTheme = GoogleFonts.interTextTheme(baseText).copyWith(
      displayLarge: _display.copyWith(fontSize: 40, letterSpacing: -0.5, color: foreground),
      displayMedium: _display.copyWith(fontSize: 32, letterSpacing: -0.5, color: foreground),
      displaySmall: _display.copyWith(fontSize: 26, letterSpacing: -0.3, color: foreground),
      headlineLarge: _display.copyWith(fontSize: 24, color: foreground),
      headlineMedium: _display.copyWith(fontSize: 20, color: foreground),
      headlineSmall: _display.copyWith(fontSize: 18, color: foreground),
      titleLarge: _body.copyWith(fontSize: 17, fontWeight: FontWeight.w700, color: foreground),
      titleMedium: _body.copyWith(fontSize: 15, fontWeight: FontWeight.w600, color: foreground),
      titleSmall: _body.copyWith(fontSize: 13, fontWeight: FontWeight.w600, color: foreground),
      bodyLarge: _body.copyWith(fontSize: 16, height: 1.4, color: foreground),
      bodyMedium: _body.copyWith(fontSize: 14, height: 1.4, color: foreground),
      bodySmall: _body.copyWith(fontSize: 12.5, height: 1.35, color: mutedForeground),
      labelLarge: _body.copyWith(fontSize: 14, fontWeight: FontWeight.w600, color: foreground),
    );

    // 0.75rem in app/globals.css's --radius, matched here rather than
    // Material's own default corner radius.
    const radius = 14.0;
    const inputRadius = 12.0;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: background,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: ZoomPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      visualDensity: VisualDensity.standard,
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: secondary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(inputRadius),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(inputRadius),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(inputRadius),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(inputRadius),
          borderSide: BorderSide(color: destructive, width: 1.5),
        ),
        labelStyle: TextStyle(color: mutedForeground),
        hintStyle: TextStyle(color: mutedForeground.withValues(alpha: 0.7)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: primaryForeground,
          disabledBackgroundColor: mutedForeground.withValues(alpha: 0.25),
          padding: const EdgeInsets.symmetric(vertical: 16),
          elevation: 0,
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(inputRadius)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: foreground,
          side: BorderSide(color: border),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(inputRadius)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: _display.copyWith(fontSize: 20, color: foreground),
      ),
      tabBarTheme: TabBarThemeData(
        labelColor: primary,
        unselectedLabelColor: mutedForeground,
        indicatorColor: primary,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        dividerColor: border,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: card,
        surfaceTintColor: Colors.transparent,
        indicatorColor: primary.withValues(alpha: 0.14),
        elevation: 0,
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? primary : mutedForeground,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(color: selected ? primary : mutedForeground);
        }),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: secondary,
        labelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: foreground),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      dividerTheme: DividerThemeData(color: border, thickness: 1, space: 1),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: primary,
        linearTrackColor: secondary,
        circularTrackColor: secondary,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: foreground,
        contentTextStyle: TextStyle(color: background, fontSize: 14),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(inputRadius)),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: card,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius)),
        titleTextStyle: _display.copyWith(fontSize: 18, color: foreground),
        contentTextStyle: TextStyle(fontSize: 14, color: foreground, height: 1.4),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: mutedForeground,
        textColor: foreground,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(inputRadius)),
      ),
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        side: BorderSide(color: border, width: 1.5),
      ),
      iconTheme: IconThemeData(color: foreground),
    );
  }
}

/// Semantic accent colors that don't belong on ColorScheme (only two "extra"
/// slots - tertiary - are used above for the web app's own `accent` token,
/// so success/warning live here instead, same pattern star-rating and
/// difficulty chips already reach for via `Theme.of(context)`).
extension AppThemeColors on ThemeData {
  Color get success => brightness == Brightness.dark ? AppColors.darkSuccess : AppColors.lightSuccess;
  Color get warning => brightness == Brightness.dark ? AppColors.darkWarning : AppColors.lightWarning;
}
