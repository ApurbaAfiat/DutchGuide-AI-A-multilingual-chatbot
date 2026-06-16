"""
Suggested Questions
===================
Returns contextually relevant follow-up questions based on the topic
detected in the current query. Supports all four languages.
"""

from typing import List

SUGGESTED_QUESTIONS: dict = {
    "en": {
        "transportation": [
            "How much does an OV-chipkaart cost?",
            "What is the difference between OV-chipkaart and OVpay?",
            "How do I get a student travel discount?",
        ],
        "housing": [
            "How much is a student room in the Netherlands?",
            "What documents do I need to rent an apartment?",
            "What is SSH Housing?",
        ],
        "immigration": [
            "How do I register at the municipality?",
            "What is a BSN number and how do I get one?",
            "How do I get a DigiD?",
        ],
        "healthcare": [
            "Do I need health insurance in the Netherlands?",
            "How do I find a general practitioner (huisarts)?",
            "What is the emergency number in the Netherlands?",
        ],
        "universities": [
            "What are the best universities in the Netherlands?",
            "How much does studying in the Netherlands cost?",
            "What is student life like in Leiden?",
        ],
        "default": [
            "What should I do immediately after arriving in the Netherlands?",
            "How much does it cost to live in the Netherlands as a student?",
            "What are the most beautiful cities in the Netherlands?",
            "How do I open a Dutch bank account?",
        ],
    },
    "nl": {
        "default": [
            "Wat moet ik direct doen na aankomst in Nederland?",
            "Hoeveel kost een OV-chipkaart?",
            "Hoe vraag ik een BSN aan?",
            "Wat zijn de beste steden voor studenten?",
        ],
    },
    "bn": {
        "default": [
            "নেদারল্যান্ডসে আসার পর প্রথমে কী করতে হবে?",
            "OV-chipkaart কী এবং কীভাবে পাবো?",
            "BSN নম্বর কীভাবে পাবো?",
            "নেদারল্যান্ডসে ছাত্র হিসেবে বসবাস করতে কত খরচ হয়?",
        ],
    },
    "hi": {
        "default": [
            "नीदरलैंड पहुंचने के बाद तुरंत क्या करें?",
            "OV-chipkaart कैसे प्राप्त करें?",
            "BSN नंबर कैसे मिलता है?",
            "नीदरलैंड में छात्र के रूप में रहने में कितना खर्च होता है?",
        ],
    },
}

CATEGORY_KEYWORDS = {
    "transportation": ["train", "bus", "tram", "metro", "ov", "chipkaart", "travel", "ns", "transport"],
    "housing": ["house", "room", "apartment", "rent", "housing", "kamernet", "ssh", "accommodation"],
    "immigration": ["bsn", "digid", "ind", "registration", "permit", "visa", "municipality"],
    "healthcare": ["health", "insurance", "doctor", "hospital", "gp", "emergency", "medicine"],
    "universities": ["university", "study", "student", "tuition", "campus", "leiden", "delft", "erasmus"],
}


def get_suggested_questions(query: str, lang_code: str) -> List[str]:
    """Return 3 relevant follow-up questions based on query topic and language."""
    query_lower = query.lower()
    lang_data = SUGGESTED_QUESTIONS.get(lang_code, SUGGESTED_QUESTIONS["en"])

    # Detect category from query keywords
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            questions = lang_data.get(category, lang_data.get("default", []))
            return questions[:3]

    return lang_data.get("default", SUGGESTED_QUESTIONS["en"]["default"])[:3]
