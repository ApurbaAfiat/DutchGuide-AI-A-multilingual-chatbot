"""
Language Detection Utility
==========================
Detects the language of the user's input and maps it to a
supported language code. Falls back to English if detection fails.
"""

from langdetect import detect, LangDetectException
from loguru import logger
from typing import Tuple

# Languages we actively support
SUPPORTED_LANGUAGES = {
    "en": "English",
    "nl": "Dutch",
    "bn": "Bengali",
    "hi": "Hindi",
}

# langdetect sometimes returns region-specific codes — normalise them
LANGUAGE_ALIASES = {
    "en-us": "en",
    "en-gb": "en",
    "nl-nl": "nl",
    "bn-bd": "bn",
    "bn-in": "bn",
    "hi-in": "hi",
}


def detect_language(text: str) -> Tuple[str, str]:
    """
    Detect the language of the given text.

    Returns:
        Tuple of (language_code, language_name).
        Defaults to ("en", "English") on failure.
    """
    try:
        raw = detect(text).lower()
        # Normalise aliases
        lang_code = LANGUAGE_ALIASES.get(raw, raw)
        # Only return if we support the language
        if lang_code in SUPPORTED_LANGUAGES:
            return lang_code, SUPPORTED_LANGUAGES[lang_code]
        # For unsupported languages, default to English
        logger.debug(f"Unsupported language '{lang_code}' detected — defaulting to English")
        return "en", "English"
    except LangDetectException as e:
        logger.warning(f"Language detection failed: {e} — defaulting to English")
        return "en", "English"


def get_language_instruction(lang_code: str) -> str:
    """
    Returns a system instruction string telling the LLM which language to use.
    """
    instructions = {
        "en": "Always respond in English.",
        "nl": "Antwoord altijd in het Nederlands.",
        "bn": "সর্বদা বাংলায় উত্তর দিন।",
        "hi": "हमेशा हिंदी में जवाब दें।",
    }
    return instructions.get(lang_code, "Always respond in English.")
