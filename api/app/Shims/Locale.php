<?php

/**
 * Minimal Locale shim for environments where PHP intl extension is unavailable.
 * Provides the static methods CI4 needs: setDefault() and getDefault().
 */
if (! class_exists('Locale', false)) {
    class Locale
    {
        private static string $locale = 'en';

        public static function setDefault(string $locale): bool
        {
            self::$locale = $locale;
            return true;
        }

        public static function getDefault(): string
        {
            return self::$locale;
        }

        public static function acceptFromHttp(string $header): string|false
        {
            return self::$locale;
        }
    }
}
