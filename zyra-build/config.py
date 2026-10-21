# ============================================================
#  ZYRA · configuración del generador multidioma
#  Todo lo que cambia la web publicada sale de aquí.
# ============================================================

SITE = "https://digitalzyra.com"
VERSION = "32"                      # sube este número cada vez que cambies CSS o JS
UPDATED = "2026-09-16"              # fecha que sale en el sitemap

# Idiomas: carpeta de la URL, código hreflang, atributo lang, dirección y locale de Open Graph
LANGS = {
    "es": {"dir_url": "es-es", "hreflang": "es-ES", "html": "es-ES", "rtl": False, "og": "es_ES", "label": "ES", "name": "Español"},
    "en": {"dir_url": "en-en", "hreflang": "en",    "html": "en",    "rtl": False, "og": "en_GB", "label": "EN", "name": "English"},
    "ar": {"dir_url": "ar-ar", "hreflang": "ar",    "html": "ar",    "rtl": True,  "og": "ar_AR", "label": "AR", "name": "العربية"},
}
DEFAULT_LANG = "es"                 # también es el x-default

CONTACT = {
    "email": "zyradigitalpersonal@gmail.com",
    "phone": "+34643412454",
    "wa": "https://wa.me/34643412454",
}

# Perfiles externos. Se usan en el JSON-LD (sameAs) solo cuando tienen URL.
# Pega la URL real y vuelve a generar — no se inventan enlaces aquí.
SOCIAL = {
    "instagram": "",
    "tiktok": "",
    "youtube": "",
    "linkedin": "",
}
# Redes que se muestran en el footer de todas las páginas, en este orden.
# Con URL real → icono enlazado. Sin URL → icono "Próximamente", no es un
# enlace roto (no lleva href), solo dejan la estructura lista para cuando
# se añada el perfil.
FOOTER_SOCIAL = ["instagram", "tiktok", "linkedin"]
# URL de la ficha de Google Business Profile (cuando exista). Se añade a sameAs.
GOOGLE_BUSINESS_URL = ""

FOUNDERS = ["Kilian Abraham Barreto Mendoza", "Ahmednah Mohamed Saleh", "Iker Alonso Armas"]

# Páginas: clave -> (archivo fuente, slug ES, slug EN/AR)
PAGES = {
    "home":       ("index.html",                        "",                          ""),
    "servicios":  ("servicios/index.html",              "servicios/",                "services/"),
    "web":        ("servicios/desarrollo-web/index.html",   "servicios/desarrollo-web/",   "services/web-development/"),
    "soft":       ("servicios/software-a-medida/index.html","servicios/software-a-medida/","services/custom-software/"),
    "auto":       ("servicios/automatizacion/index.html",   "servicios/automatizacion/",   "services/automation/"),
    "ia":         ("servicios/agentes-de-ia/index.html",    "servicios/agentes-de-ia/",    "services/ai-agents/"),
    "como":       ("como-trabajamos/index.html",        "como-trabajamos/",          "how-we-work/"),
    "sobre":      ("sobre-nosotros/index.html",         "sobre-nosotros/",           "about-us/"),
    "contacto":   ("contacto/index.html",               "contacto/",                 "contact/"),
    "aviso":      ("legal/aviso-legal/index.html",      "legal/aviso-legal/",        "legal/legal-notice/"),
    "privacidad": ("legal/privacidad/index.html",       "legal/privacidad/",         "legal/privacy-policy/"),
    "cookies":    ("legal/cookies/index.html",          "legal/cookies/",            "legal/cookie-policy/"),
}

SITEMAP_PRIORITY = {"home": "1.0", "servicios": "0.9", "web": "0.9", "soft": "0.9", "auto": "0.9", "ia": "0.9",
                    "contacto": "0.8", "como": "0.7", "sobre": "0.7", "aviso": "0.2", "privacidad": "0.2", "cookies": "0.2"}

SERVICE_KEYS = ["web", "soft", "auto", "ia"]
# Tipo de página para Schema.org
PAGE_TYPE = {"sobre": "AboutPage", "contacto": "ContactPage", "servicios": "CollectionPage"}

# ── Títulos (≤ 60 caracteres) y descripciones (≈ 150) ──────────
META = {
 "home": {
  "es": ("Agencia de desarrollo web, software a medida e IA | ZYRA",
         "Diseñamos webs, desarrollamos software a medida y creamos automatizaciones y agentes de IA para empresas. Presupuesto cerrado y sin permanencia."),
  "en": ("Web Development, Custom Software & AI Agency | ZYRA",
         "We design websites, build custom software and create automations and AI agents for businesses. Fixed quotes and no lock-in contracts."),
  "ar": ("وكالة تطوير مواقع وبرمجيات مخصصة وذكاء اصطناعي | ZYRA",
         "نصمّم المواقع ونطوّر البرمجيات المخصصة ونبني حلول الأتمتة ووكلاء الذكاء الاصطناعي للشركات. عرض سعر نهائي ودون التزام إجباري."),
 },
 "servicios": {
  "es": ("Servicios: web, software, automatización e IA | ZYRA",
         "Desarrollo web, software a medida, automatización de procesos y agentes de IA para pymes. Empieza por una pieza o por todo el conjunto."),
  "en": ("Web, Software, Automation & AI Services | ZYRA",
         "Web development, custom software, process automation and AI agents for small and medium businesses. Start with one piece or the whole set."),
  "ar": ("خدماتنا: المواقع والبرمجيات والأتمتة والذكاء الاصطناعي | ZYRA",
         "تطوير المواقع والبرمجيات المخصصة وأتمتة العمليات ووكلاء الذكاء الاصطناعي للشركات الصغيرة والمتوسطة. ابدأ بخدمة واحدة أو بها جميعاً."),
 },
 "web": {
  "es": ("Desarrollo web para empresas y negocios | ZYRA",
         "Webs corporativas, páginas para negocios locales, landing pages y rediseños. Diseño a medida, responsive, SEO básico, dominio y SSL. Pide precio."),
  "en": ("Web Development for Businesses | ZYRA",
         "Corporate websites, local business pages, landing pages and redesigns. Custom design, responsive, basic SEO, domain and SSL. Ask for a quote."),
  "ar": ("تطوير مواقع الويب للشركات والأعمال | ZYRA",
         "مواقع للشركات وصفحات للأعمال المحلية وصفحات هبوط وإعادة تصميم. تصميم مخصص ومتجاوب وتحسين أساسي لمحركات البحث ونطاق وSSL. اطلب عرض سعر."),
 },
 "soft": {
  "es": ("Software a medida para pymes | ZYRA",
         "Aplicaciones de gestión, clientes, reservas e inventario construidas alrededor de tu proceso real. Desarrollo por fases, desde 4 semanas."),
  "en": ("Custom Software Development for SMEs | ZYRA",
         "Management, client, booking and inventory apps built around the way your business really works. Developed in phases, from 4 weeks."),
  "ar": ("تطوير برمجيات مخصصة للشركات | ZYRA",
         "تطبيقات للإدارة والعملاء والحجوزات والمخزون مبنية حول طريقة عملك الحقيقية. تطوير على مراحل، ابتداءً من 4 أسابيع."),
 },
 "auto": {
  "es": ("Automatización de procesos para empresas | ZYRA",
         "Conectamos tus herramientas con Make, Zapier o n8n y automatizamos las tareas repetitivas del día a día. Flujos probados con datos reales."),
  "en": ("Business Process Automation | ZYRA",
         "We connect your tools with Make, Zapier or n8n and automate the repetitive tasks in your day. Workflows tested with real data before launch."),
  "ar": ("أتمتة العمليات للشركات | ZYRA",
         "نربط أدواتك عبر Make وZapier وn8n ونؤتمت المهام المتكررة في يومك. مسارات عمل مُختبرة ببيانات حقيقية قبل التشغيل."),
 },
 "ia": {
  "es": ("Agentes de IA y chatbots para empresas | ZYRA",
         "Agentes de IA entrenados con tu información para atender consultas y reservas en tu web y WhatsApp, con derivación a una persona cuando toca."),
  "en": ("AI Agents & Chatbots for Businesses | ZYRA",
         "AI agents trained on your information to handle enquiries and bookings on your website and WhatsApp, handing off to a person when needed."),
  "ar": ("وكلاء الذكاء الاصطناعي وروبوتات المحادثة للشركات | ZYRA",
         "وكلاء ذكاء اصطناعي مدرَّبون على معلوماتك للرد على الاستفسارات والحجوزات في موقعك وواتساب، مع التحويل إلى موظف عند الحاجة."),
 },
 "como": {
  "es": ("Cómo trabajamos: proceso paso a paso | ZYRA",
         "Servicio por servicio: qué hacemos, con qué herramientas, cuánto tarda y por qué. Cuatro pasos claros, del primer mensaje a la entrega."),
  "en": ("How We Work: Our Process Step by Step | ZYRA",
         "Service by service: what we do, which tools we use, how long it takes and why. Four clear steps from the first message to delivery."),
  "ar": ("كيف نعمل: خطوات العمل بالتفصيل | ZYRA",
         "خدمة بخدمة: ماذا نفعل، وبأي أدوات، وكم يستغرق، ولماذا. أربع خطوات واضحة من أول رسالة حتى التسليم."),
 },
 "sobre": {
  "es": ("Sobre nosotros: agencia tecnológica en España | ZYRA",
         "Somos ZYRA, una agencia pequeña de desarrollo web, automatización e IA. Conoce al equipo, nuestra misión y cómo trabajamos con cada cliente."),
  "en": ("About Us: Technology Agency Based in Spain | ZYRA",
         "We are ZYRA, a small web development, automation and AI agency. Meet the team, our mission and how we work with every client."),
  "ar": ("من نحن: وكالة تقنية من إسبانيا | ZYRA",
         "نحن ZYRA، وكالة صغيرة لتطوير المواقع والأتمتة والذكاء الاصطناعي. تعرّف على الفريق ومهمتنا وطريقة عملنا مع كل عميل."),
 },
 "contacto": {
  "es": ("Contacto y presupuesto sin compromiso | ZYRA",
         "Cuéntanos tu proyecto por formulario, agenda una llamada o escríbenos por WhatsApp. Respondemos en menos de 24 horas laborables."),
  "en": ("Contact Us & Get a Free Quote | ZYRA",
         "Tell us about your project through the form, book a call or message us on WhatsApp. We reply within 24 working hours."),
  "ar": ("تواصل معنا واطلب عرض سعر مجاني | ZYRA",
         "حدّثنا عن مشروعك عبر النموذج أو احجز مكالمة أو راسلنا على واتساب. نرد خلال 24 ساعة عمل."),
 },
 "aviso": {
  "es": ("Aviso legal | ZYRA", "Datos del titular, condiciones de uso, propiedad intelectual y responsabilidad del sitio web de ZYRA."),
  "en": ("Legal Notice | ZYRA", "Owner details, terms of use, intellectual property and liability for the ZYRA website."),
  "ar": ("الإشعار القانوني | ZYRA", "بيانات صاحب الموقع وشروط الاستخدام والملكية الفكرية والمسؤولية الخاصة بموقع ZYRA."),
 },
 "privacidad": {
  "es": ("Política de privacidad | ZYRA", "Cómo trata ZYRA los datos personales que envías desde los formularios de la web y cómo ejercer tus derechos."),
  "en": ("Privacy Policy | ZYRA", "How ZYRA handles the personal data you submit through the website forms and how to exercise your rights."),
  "ar": ("سياسة الخصوصية | ZYRA", "كيف تتعامل ZYRA مع البيانات الشخصية التي ترسلها عبر نماذج الموقع وكيف تمارس حقوقك."),
 },
 "cookies": {
  "es": ("Política de cookies | ZYRA", "Qué se guarda en tu navegador al visitar la web de ZYRA, para qué sirve y cómo cambiar tus preferencias."),
  "en": ("Cookie Policy | ZYRA", "What is stored in your browser when you visit the ZYRA website, what it is for and how to change your preferences."),
  "ar": ("سياسة ملفات تعريف الارتباط | ZYRA", "ما الذي يُحفظ في متصفحك عند زيارة موقع ZYRA، ولأي غرض، وكيف تغيّر تفضيلاتك."),
 },
}

# Nombre corto de cada página para las migas de pan del Schema
CRUMB = {
 "servicios": {"es": "Servicios", "en": "Services", "ar": "الخدمات"},
 "web": {"es": "Desarrollo web", "en": "Web development", "ar": "تطوير المواقع"},
 "soft": {"es": "Software a medida", "en": "Custom software", "ar": "برمجيات مخصصة"},
 "auto": {"es": "Automatización", "en": "Automation", "ar": "الأتمتة"},
 "ia": {"es": "Agentes de IA", "en": "AI agents", "ar": "وكلاء الذكاء الاصطناعي"},
 "como": {"es": "Cómo trabajamos", "en": "How we work", "ar": "كيف نعمل"},
 "sobre": {"es": "Sobre nosotros", "en": "About us", "ar": "من نحن"},
 "contacto": {"es": "Contacto", "en": "Contact", "ar": "تواصل معنا"},
 "aviso": {"es": "Aviso legal", "en": "Legal notice", "ar": "الإشعار القانوني"},
 "privacidad": {"es": "Política de privacidad", "en": "Privacy policy", "ar": "سياسة الخصوصية"},
 "cookies": {"es": "Política de cookies", "en": "Cookie policy", "ar": "سياسة ملفات تعريف الارتباط"},
 "home": {"es": "Inicio", "en": "Home", "ar": "الرئيسية"},
}

# Texto alternativo por imagen (se aplica en los tres idiomas)
ALT = {
 "mockup-portatil-movil.webp": {"es": "Web de ZYRA en un portátil y un móvil", "en": "ZYRA website on a laptop and a phone", "ar": "موقع ZYRA على حاسوب محمول وهاتف"},
 "iphone-software-medida.webp": {"es": "Aplicación a medida abierta en un iPhone", "en": "Custom app open on an iPhone", "ar": "تطبيق مخصص مفتوح على هاتف iPhone"},
 "automtizacion.webp": {"es": "Panel de flujos automatizados en un ordenador de escritorio", "en": "Automated workflow dashboard on a desktop computer", "ar": "لوحة مسارات عمل مؤتمتة على حاسوب مكتبي"},
 "ipad-chatbot.webp": {"es": "Agente de IA respondiendo a un cliente en una tableta", "en": "AI agent answering a customer on a tablet", "ar": "وكيل ذكاء اصطناعي يرد على عميل عبر جهاز لوحي"},
 "mockup-escritorio.webp": {"es": "Web de ZYRA en un ordenador de escritorio", "en": "ZYRA website on a desktop computer", "ar": "موقع ZYRA على حاسوب مكتبي"},
 "mockup-portatil.webp": {"es": "Web de ZYRA en un portátil", "en": "ZYRA website on a laptop", "ar": "موقع ZYRA على حاسوب محمول"},
 "mockup-movil.webp": {"es": "Web de ZYRA en un móvil", "en": "ZYRA website on a phone", "ar": "موقع ZYRA على الهاتف"},
 "equipo-kilian.webp": {"es": "Kilian Abraham Barreto Mendoza", "en": "Kilian Abraham Barreto Mendoza", "ar": "Kilian Abraham Barreto Mendoza"},
 "equipo-ahmednah.webp": {"es": "Ahmednah Mohamed Saleh", "en": "Ahmednah Mohamed Saleh", "ar": "Ahmednah Mohamed Saleh"},
 "equipo-iker.webp": {"es": "Iker Alonso Armas", "en": "Iker Alonso Armas", "ar": "Iker Alonso Armas"},
}

# Textos que no estaban en el diccionario (clave = texto español exacto)
EXTRA = {
 "Desarrollo<br>web": {"en": "Web<br>development", "ar": "تطوير<br>المواقع"},
 "Software<br>a medida": {"en": "Custom<br>software", "ar": "برمجيات<br>مخصصة"},
 "Automa-<br>tización": {"en": "Auto-<br>mation", "ar": "الأتمتة"},
 "Agentes<br>de IA": {"en": "AI<br>agents", "ar": "وكلاء<br>الذكاء الاصطناعي"},
 "Desarrollo web": {"en": "Web development", "ar": "تطوير المواقع"},
 "Software a medida": {"en": "Custom software", "ar": "برمجيات مخصصة"},
 "Automatización": {"en": "Automation", "ar": "الأتمتة"},
 "Agentes de IA": {"en": "AI agents", "ar": "وكلاء الذكاء الاصطناعي"},
 "Hablar de mi proyecto": {"en": "Talk about my project", "ar": "تحدّث معنا عن مشروعك"},
 "No rellenar este campo": {"en": "Leave this field empty", "ar": "اترك هذا الحقل فارغاً"},
 "Última actualización: 10/09/2026": {"es": "Última actualización: 16/09/2026", "en": "Last updated: 16/09/2026", "ar": "آخر تحديث: 16/09/2026"},
 "zyra.tech": {"es": "digitalzyra.com", "en": "digitalzyra.com", "ar": "digitalzyra.com"},
}

HERO_LINES = {"ar": ["نحوّل", "الأعمال", "بالتكنولوجيا."]}

ATTR = {
 "Cambiar idioma": {"en": "Change language", "ar": "تغيير اللغة"},
 "Cambiar tema": {"en": "Toggle theme", "ar": "تبديل السمة"},
 "Enlaces": {"en": "Links", "ar": "روابط"},
 "Menú completo": {"en": "Full menu", "ar": "القائمة الكاملة"},
 "Menú": {"en": "Menu", "ar": "القائمة"},
 "Ruta": {"en": "Breadcrumb", "ar": "مسار التنقل"},
}

UI = {
 "wa_fab": {"es": "Escríbenos por WhatsApp", "en": "Message us on WhatsApp", "ar": "راسلنا على واتساب"},
 "privacy_link": {"es": "política de privacidad", "en": "privacy policy", "ar": "سياسة الخصوصية"},
 "privacy_pre": {"es": "He leído y acepto la ", "en": "I have read and accept the ", "ar": "قرأت "},
 "privacy_post": {"es": ".", "en": ".", "ar": " وأوافق عليها."},
 "unsure": {"es": "Aún no lo tengo claro", "en": "Not sure yet", "ar": "لم أحدد بعد"},
 "footer_zone": {"es": "Agencia digital con sede en España · Trabajamos en remoto", "en": "Digital agency based in Spain · We work remotely", "ar": "وكالة رقمية مقرها إسبانيا · نعمل عن بُعد"},
 "social_soon": {"es": "Próximamente", "en": "Coming soon", "ar": "قريباً"},
 "cookie_lang_title": {"es": "Cookie de idioma", "en": "Language cookie", "ar": "ملف تعريف ارتباط اللغة"},
 "cookie_lang_body": {
   "es": "Cuando eliges un idioma con el selector, guardamos la cookie técnica <code>zyra_lang</code> durante un año para llevarte a esa versión la próxima vez que entres en digitalzyra.com. Es una preferencia que tú pides expresamente, no identifica a nadie y no se comparte con terceros.",
   "en": "When you pick a language with the selector, we store the technical cookie <code>zyra_lang</code> for one year so we can take you to that version next time you visit digitalzyra.com. It is a preference you expressly ask for, it identifies no one and it is not shared with third parties.",
   "ar": "عندما تختار لغة من المحدد، نحفظ ملف تعريف الارتباط التقني <code>zyra_lang</code> لمدة عام لنوجّهك إلى تلك النسخة في زيارتك القادمة إلى digitalzyra.com. إنه تفضيل تطلبه صراحةً، ولا يحدد هوية أحد ولا يُشارَك مع أطراف ثالثة."},
}
