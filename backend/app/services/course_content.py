"""Service for creating and managing course content for different languages."""
from typing import Dict, List
from datetime import datetime, timezone


class CourseContentGenerator:
    """Service to generate course content structures for different languages."""
    
    @staticmethod
    def get_german_beginner_course() -> Dict:
        """Generate course structure for German beginner level."""
        return {
            "title": "German for Beginners - A1 Level",
            "slug": "german-beginner-a1",
            "description": "Complete German course for absolute beginners. Learn basic vocabulary, grammar, and conversation skills to reach A1 level.",
            "category": "language",
            "language": "german",
            "difficulty": "beginner",
            "estimated_hours": 40,
            "target_exam": "goethe",
            "modules": [
                {
                    "title": "Introduction to German",
                    "order_index": 0,
                    "module_type": "video",
                    "estimated_minutes": 120,
                    "lessons": [
                        {
                            "title": "Welcome to German",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Welcome to German!\n\nIn this lesson, you'll learn:\n- Why learn German\n- German language basics\n- How to use this course\n\nGerman is spoken by over 100 million people worldwide and is the most widely spoken native language in the European Union.",
                            "duration_seconds": 600,
                            "resources": {
                                "German Alphabet PDF": "/resources/german-alphabet.pdf"
                            }
                        },
                        {
                            "title": "The German Alphabet",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# The German Alphabet\n\nThe German alphabet has 26 letters, just like English, plus 3 special characters:\n- ä (a-umlaut)\n- ö (o-umlaut)\n- ü (u-umlaut)\n- ß (eszett or sharp s)\n\n## Pronunciation Guide\n\nA - ah\nB - bay\nC - tsay\nD - day\nE - eh\nF - eff\nG - gay\nH - hah\nI - ee\nJ - yot\nK - kah\nL - ell\nM - emm\nN - enn\nO - oh\nP - pay\nQ - koo\nR - err\nS - ess\nT - tay\nU - oo\nV - fow\nW - vay\nX - ix\nY - ipsilon\nZ - tsett",
                            "duration_seconds": 900,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Basic Greetings and Introductions",
                    "order_index": 1,
                    "module_type": "video",
                    "estimated_minutes": 180,
                    "lessons": [
                        {
                            "title": "Greetings - Hallo!",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# German Greetings\n\n## Formal Greetings\n- **Guten Morgen** - Good morning\n- **Guten Tag** - Good day / Hello\n- **Guten Abend** - Good evening\n- **Auf Wiedersehen** - Goodbye\n\n## Informal Greetings\n- **Hallo** - Hello\n- **Tschüss** - Bye\n- **Wie geht's?** - How are you?\n- **Mir geht's gut** - I'm fine\n\n## Practice\nTry using these greetings in different situations throughout the day!",
                            "duration_seconds": 720,
                            "resources": {}
                        },
                        {
                            "title": "Introducing Yourself",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Introducing Yourself in German\n\n## Basic Introductions\n- **Ich heiße...** - My name is...\n- **Ich bin...** - I am...\n- **Wie heißt du?** - What's your name? (informal)\n- **Wie heißen Sie?** - What's your name? (formal)\n\n## Personal Information\n- **Ich komme aus...** - I come from...\n- **Ich wohne in...** - I live in...\n- **Ich bin ... Jahre alt** - I am ... years old\n\n## Example Dialogue\n\n**A:** Hallo, ich heiße Anna. Wie heißt du?\n**B:** Ich heiße Michael. Woher kommst du?\n**A:** Ich komme aus Deutschland. Und du?\n**B:** Ich komme aus Österreich.",
                            "duration_seconds": 900,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Numbers and Counting",
                    "order_index": 2,
                    "module_type": "video",
                    "estimated_minutes": 120,
                    "lessons": [
                        {
                            "title": "Numbers 0-20",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# German Numbers 0-20\n\n0 - null\n1 - eins\n2 - zwei\n3 - drei\n4 - vier\n5 - fünf\n6 - sechs\n7 - sieben\n8 - acht\n9 - neun\n10 - zehn\n11 - elf\n12 - zwölf\n13 - dreizehn\n14 - vierzehn\n15 - fünfzehn\n16 - sechzehn\n17 - siebzehn\n18 - achtzehn\n19 - neunzehn\n20 - zwanzig\n\nPractice counting objects around you in German!",
                            "duration_seconds": 600,
                            "resources": {}
                        },
                        {
                            "title": "Numbers 21-100",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# German Numbers 21-100\n\nIn German, numbers are said differently than in English. For example:\n- 21 = einundzwanzig (one-and-twenty)\n- 22 = zweiundzwanzig (two-and-twenty)\n\n## Tens\n30 - dreißig\n40 - vierzig\n50 - fünfzig\n60 - sechzig\n70 - siebzig\n80 - achtzig\n90 - neunzig\n100 - einhundert",
                            "duration_seconds": 720,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Basic Grammar - Articles",
                    "order_index": 3,
                    "module_type": "video",
                    "estimated_minutes": 180,
                    "lessons": [
                        {
                            "title": "Definite Articles - Der, Die, Das",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# German Definite Articles\n\nGerman has three grammatical genders: masculine, feminine, and neuter. Each gender has its own definite article:\n\n- **Der** - Masculine (der Mann, der Tisch, der Stuhl)\n- **Die** - Feminine (die Frau, die Tür, die Lampe)\n- **Das** - Neuter (das Buch, das Haus, das Auto)\n\n## Tips for Remembering Gender\n- Colors ending in -e are usually feminine (die Farbe, die Rose)\n- Words ending in -ung are usually feminine (die Zeitung)\n- Words ending in -chen or -lein are neuter (das Mädchen, das Tischlein)",
                            "duration_seconds": 900,
                            "resources": {}
                        },
                        {
                            "title": "Indefinite Articles - Ein, Eine, Ein",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# German Indefinite Articles\n\nJust like definite articles, indefinite articles change based on gender:\n\n- **Ein** - Masculine (ein Mann, ein Tisch)\n- **Eine** - Feminine (eine Frau, eine Tür)\n- **Ein** - Neuter (ein Buch, ein Haus)\n\nNote: 'Ein' is used for both masculine and neuter nouns!",
                            "duration_seconds": 720,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Essential Vocabulary",
                    "order_index": 4,
                    "module_type": "video",
                    "estimated_minutes": 240,
                    "lessons": [
                        {
                            "title": "Family Members",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Family Vocabulary in German\n\n## Immediate Family\n- die Mutter - mother\n- der Vater - father\n- die Schwester - sister\n- der Bruder - brother\n- die Eltern - parents\n- das Kind - child\n\n## Extended Family\n- die Großmutter / Oma - grandmother\n- der Großvater / Opa - grandfather\n- die Tante - aunt\n- der Onkel - uncle\n- der Cousin - cousin (male)\n- die Cousine - cousin (female)",
                            "duration_seconds": 720,
                            "resources": {}
                        },
                        {
                            "title": "Food and Drinks",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Food and Drinks Vocabulary\n\n## Common Foods\n- das Brot - bread\n- der Käse - cheese\n- das Ei - egg\n- das Fleisch - meat\n- das Gemüse - vegetables\n- das Obst - fruit\n- der Apfel - apple\n- die Banane - banana\n\n## Drinks\n- das Wasser - water\n- der Kaffee - coffee\n- der Tee - tea\n- die Milch - milk\n- das Bier - beer\n- der Wein - wine\n\n## Useful Phrases\n- Ich hätte gerne... - I would like...\n- Was empfehlen Sie? - What do you recommend?\n- Die Rechnung, bitte. - The bill, please.",
                            "duration_seconds": 900,
                            "resources": {}
                        }
                    ]
                }
            ]
        }
    
    @staticmethod
    def get_kiswahili_beginner_course() -> Dict:
        """Generate course structure for Kiswahili beginner level."""
        return {
            "title": "Kiswahili for Beginners",
            "slug": "kiswahili-beginner",
            "description": "Complete Kiswahili course for absolute beginners. Learn basic vocabulary, grammar, and conversation skills to communicate effectively in Swahili.",
            "category": "language",
            "language": "swahili",
            "difficulty": "beginner",
            "estimated_hours": 35,
            "modules": [
                {
                    "title": "Introduction to Kiswahili",
                    "order_index": 0,
                    "module_type": "video",
                    "estimated_minutes": 90,
                    "lessons": [
                        {
                            "title": "Karibu! Welcome to Kiswahili",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Karibu! Welcome to Kiswahili\n\nIn this lesson, you'll learn:\n- About Kiswahili language\n- Where Kiswahili is spoken\n- Importance of learning Kiswahili\n\nKiswahili is a Bantu language spoken by over 100 million people in East and Central Africa, including Tanzania, Kenya, Uganda, Rwanda, Burundi, Mozambique, and the Democratic Republic of Congo.",
                            "duration_seconds": 540,
                            "resources": {
                                "Kiswahili Pronunciation Guide": "/resources/swahili-pronunciation.pdf"
                            }
                        },
                        {
                            "title": "Kiswahili Pronunciation",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Kiswahili Pronunciation\n\nKiswahili is phonetic - words are pronounced exactly as they're written!\n\n## Vowels\n- a - as in 'car'\n- e - as in 'bed'\n- i - as in 'see'\n- o - as in 'more'\n- u - as in 'too'\n\n## Consonants\nMost consonants are pronounced similarly to English. Key differences:\n- g - always hard as in 'go'\n- r - rolled or tapped\n- ng - as in 'sing'\n- ny - as in 'canyon'",
                            "duration_seconds": 720,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Greetings and Introductions",
                    "order_index": 1,
                    "module_type": "video",
                    "estimated_minutes": 150,
                    "lessons": [
                        {
                            "title": "Common Greetings",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Kiswahili Greetings\n\n## Basic Greetings\n- **Habari** - Hello / How are you?\n- **Habari za asubuhi** - Good morning\n- **Habari za mchana** - Good afternoon\n- **Habari za jioni** - Good evening\n- **Usiku mwema** - Good night\n\n## Responses\n- **Nzuri** - Good / Fine\n- **Salama** - Peaceful / Fine\n- **Poa** - Cool / Fine\n\n## Informal Greetings\n- **Jambo** - Hi (informal)\n- **Shikamoo** - Respectful greeting to elders\n- **Marahaba** - Response to Shikamoo",
                            "duration_seconds": 720,
                            "resources": {}
                        },
                        {
                            "title": "Introducing Yourself",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Introducing Yourself in Kiswahili\n\n## Basic Introductions\n- **Jina lako ni nani?** - What's your name?\n- **Jina langu ni...** - My name is...\n- **Mimi ni...** - I am...\n\n## Personal Information\n- **Unatoka wapi?** - Where are you from?\n- **Ninatoka...** - I come from...\n- **Unaishi wapi?** - Where do you live?\n- **Naishi...** - I live in...\n\n## Example Dialogue\n\n**A:** Habari! Jina lako ni nani?\n**B:** Jina langu ni John. Na wewe?\n**A:** Mimi ni Mary. Unatoka wapi?\n**B:** Ninatoka Kenya. Unaishi wapi?\n**A:** Naishi Nairobi.",
                            "duration_seconds": 900,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Numbers in Kiswahili",
                    "order_index": 2,
                    "module_type": "video",
                    "estimated_minutes": 120,
                    "lessons": [
                        {
                            "title": "Numbers 1-10",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Kiswahili Numbers 1-10\n\n1 - moja\n2 - mbili\n3 - tatu\n4 - nne\n5 - tano\n6 - sita\n7 - saba\n8 - nane\n9 - tisa\n10 - kumi\n\nPractice counting objects around you in Kiswahili!",
                            "duration_seconds": 540,
                            "resources": {}
                        },
                        {
                            "title": "Numbers 11-100",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Kiswahili Numbers 11-100\n\n11 - kumi na moja\n12 - kumi na mbili\n13 - kumi na tatu\n14 - kumi na nne\n15 - kumi na tano\n16 - kumi na sita\n17 - kumi na saba\n18 - kumi na nane\n19 - kumi na tisa\n20 - ishirini\n\n## Tens\n30 - thelathini\n40 - arobaini\n50 - hamsini\n60 - sitini\n70 - sabini\n80 - themanini\n90 - tisini\n100 - mia",
                            "duration_seconds": 720,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Noun Classes - Introduction",
                    "order_index": 3,
                    "module_type": "video",
                    "estimated_minutes": 180,
                    "lessons": [
                        {
                            "title": "Understanding Noun Classes",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Kiswahili Noun Classes\n\nKiswahili has a system of noun classes (ngeli) that determine how words change in sentences.\n\n## Common Classes\n\n**M-Wa Class** (people, animals)\n- mtu - person (singular)\n- watu - people (plural)\n\n**Ki-Vi Class** (objects, tools)\n- kitabu - book (singular)\n- vitabu - books (plural)\n\n**N Class** (many nouns)\n- nyumba - house (singular/plural same)\n\n## Prefixes\nNoun classes use prefixes for singular and plural forms. This is a key feature of Bantu languages.",
                            "duration_seconds": 900,
                            "resources": {}
                        },
                        {
                            "title": "M-Wa Class Practice",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# M-Wa Class Practice\n\n## Common M-Wa Nouns\n\nSingular - Plural\n- mtoto - watoto (child - children)\n- mwalimu - walimu (teacher - teachers)\n- mfanyakazi - wafanyakazi (worker - workers)\n- mgeni - wageni (guest - guests)\n- mdaktari - madaktari (doctor - doctors)\n\n## Agreement\nAdjectives and verbs must agree with the noun class:\n- mtoto mzuri - good child\n- watu wazuri - good people\n- mtoto mdogo - small child\n- watu wadogo - small people",
                            "duration_seconds": 720,
                            "resources": {}
                        }
                    ]
                },
                {
                    "title": "Essential Vocabulary",
                    "order_index": 4,
                    "module_type": "video",
                    "estimated_minutes": 200,
                    "lessons": [
                        {
                            "title": "Family Vocabulary",
                            "order_index": 0,
                            "video_url": "",
                            "content": "# Family Vocabulary in Kiswahili\n\n## Immediate Family\n- mama - mother\n- baba - father\n- dada - sister\n- kaka - brother\n- watoto - children\n- mtoto - child\n\n## Extended Family\n- bibi - grandmother\n- babu - grandfather\n- shangazi - aunt (father's sister)\n- mjomba - uncle (mother's brother)\n- binamu - cousin\n\n## Respectful Terms\n- mzee - elder/respected person\n- kijana - young person",
                            "duration_seconds": 720,
                            "resources": {}
                        },
                        {
                            "title": "Food and Drinks",
                            "order_index": 1,
                            "video_url": "",
                            "content": "# Food and Drinks Vocabulary\n\n## Common Foods\n- chakula - food\n- wali - rice\n- nyama - meat\n- mboga - vegetables\n- matunda - fruits\n- mkate - bread\n- mayai - eggs\n- samaki - fish\n\n## Common Fruits\n- tunda la nanasi - pineapple\n- tunda la ndizi - banana\n- tunda la chungwa - orange\n- tunda la embe - mango\n\n## Drinks\n- maji - water\n- kahawa - coffee\n- chai - tea\n- mazi - milk\n- bia - beer\n- divai - wine\n\n## Useful Phrases\n- Ninaomba... - I would like...\n- Chakula ni kitamu! - The food is delicious!\n- Naomba kile... - Can I have...",
                            "duration_seconds": 900,
                            "resources": {}
                        }
                    ]
                }
            ]
        }
    
    @staticmethod
    def get_all_beginner_courses() -> List[Dict]:
        """Get all beginner course structures."""
        return [
            CourseContentGenerator.get_german_beginner_course(),
            CourseContentGenerator.get_kiswahili_beginner_course()
        ]
