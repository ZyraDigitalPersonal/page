<?php
/* ============================================================
   ZYRA · Formulario de contacto, cita y diagnóstico
   · tipo=info         formulario "Rellenar formulario"
   · tipo=cita         formulario "Agendar cita"
   · tipo=diagnostico  cuestionario "¿No sabes qué necesitas?"

   Flujo: antispam → validación → se guarda en data/solicitudes.json
   → aviso al equipo (CONTACTO_PARA) → confirmación al cliente.
   La solicitud se guarda ANTES de enviar emails: aunque el correo
   fallara, no se pierde nada.
   ============================================================ */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/emails.php';

@date_default_timezone_set(ZYRA_ZONA);
$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function contacto_fin(bool $ok, string $err = ''): void {
    global $wantsJson, $lang;
    if ($wantsJson) zyra_json(['ok' => $ok, 'error' => $err], $ok ? 200 : 400);
    // Sin JavaScript: se vuelve a la página de contacto del idioma
    $dest = ['es' => '/es-es/contacto/', 'en' => '/en-en/contact/', 'ar' => '/ar-ar/contact/'][$lang ?? 'es'];
    header('Location: ' . $dest . ($ok ? '?enviado=1' : '?error=1') . '#formulario', true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    zyra_json(['ok' => false, 'error' => 'method'], 405);
}

$lang = in_array($_POST['lang'] ?? '', ['es', 'en', 'ar'], true) ? $_POST['lang'] : 'es';

/* ── Antispam ── */
// 1) Campo trampa: los robots lo rellenan. Se responde "ok" para no darles pistas.
if (trim((string) ($_POST['website'] ?? '')) !== '') contacto_fin(true);
// 2) Tiempo: una persona tarda más de 3 segundos en rellenar el formulario
$t = (int) ($_POST['t'] ?? 0);
if ($t > 0 && $t < 3000) contacto_fin(true);
// 3) Origen: solo desde nuestra propia web
$origen = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origen !== '' && parse_url($origen, PHP_URL_HOST) !== parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) contacto_fin(false, 'origin');
// 4) Límite de envíos por IP al día
function contacto_limite(): bool {
    $f = zyra_dir() . '/contacto-envios.json';
    $hoy = gmdate('Y-m-d');
    $reg = is_file($f) ? json_decode((string) @file_get_contents($f), true) : [];
    if (!is_array($reg)) $reg = [];
    $reg = array_filter($reg, fn($v) => ($v['dia'] ?? '') === $hoy);
    $ip = zyra_ip_hash();
    $n = isset($reg[$ip]) ? (int) $reg[$ip]['n'] : 0;
    if ($n >= CONTACTO_MAX_IP) return true;
    $reg[$ip] = ['dia' => $hoy, 'n' => $n + 1];
    @file_put_contents($f, json_encode($reg), LOCK_EX);
    return false;
}

/* ── Datos comunes ── */
$limpio = fn($k, $max = 200) => str_replace(["\r", "\n"], ' ', zyra_texto($_POST[$k] ?? '', $max));
$tipo     = in_array($_POST['tipo'] ?? '', ['info', 'cita', 'diagnostico'], true) ? $_POST['tipo'] : 'info';
$nombre   = $limpio('nombre', 80);
$email    = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL) ?: '';
$telefono = trim(preg_replace('/[^0-9+ ()-]/', '', $limpio('telefono', 30)));
$servicio = $limpio('servicio', 60);
$fecha    = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_POST['fecha'] ?? '')) ? $_POST['fecha'] : '';
$franja   = $limpio('franja', 60);
$mensaje  = zyra_texto($_POST['mensaje'] ?? '', 3000);
$privacidad = ($_POST['privacidad'] ?? '') === '1';

/* ── Diagnóstico: las respuestas llegan como códigos y aquí se
      traducen a texto legible (el equipo no ve "q2=suelto") ── */
$DIAG = [
  'necesidad' => ['titulo' => ['¿Qué quiere resolver?', 'What they want to solve', 'ما الذي يريد حله'], 'o' => [
      'web'   => ['Tener o renovar su web', 'Get or renew my website', 'امتلاك موقع أو تجديده'],
      'auto'  => ['Dejar de repetir tareas a mano', 'Stop repeating manual tasks', 'التوقف عن تكرار المهام يدوياً'],
      'soft'  => ['Gestionar su operación con una app', 'Run my operation with an app', 'إدارة العمل عبر تطبيق'],
      'ia'    => ['Atender consultas automáticamente', 'Answer enquiries automatically', 'الرد على الاستفسارات تلقائياً'],
      'duda'  => ['Todavía no lo tiene claro', 'Not sure yet', 'لم يحدد بعد'],
  ]],
  'situacion' => ['titulo' => ['Situación actual', 'Starting point', 'نقطة البداية'], 'o' => [
      'cero'   => ['Desde cero, no tiene nada', 'From scratch', 'من الصفر'],
      'viejo'  => ['Tiene algo, pero se ha quedado antiguo', 'Has something, but it feels dated', 'لديه شيء لكنه أصبح قديماً'],
      'suelto' => ['Usa varias herramientas sin conectar', 'Several tools that do not talk to each other', 'عدة أدوات غير مترابطة'],
      'crecer' => ['Funciona, pero se le queda corto', 'It works, but falls short now', 'يعمل لكنه لم يعد كافياً'],
  ]],
  'presupuesto' => ['titulo' => ['Presupuesto aproximado', 'Budget', 'الميزانية'], 'o' => [
      'bajo'    => ['Menos de 500 €', 'Under €500', 'أقل من 500 €'],
      'medio'   => ['Entre 500 € y 1.500 €', '€500 to €1,500', 'بين 500 € و1500 €'],
      'alto'    => ['Más de 1.500 €', 'Over €1,500', 'أكثر من 1500 €'],
      'abierto' => ['Depende de lo que aporte', 'Depends on the return', 'حسب العائد'],
  ]],
  'plazo' => ['titulo' => ['Plazo', 'Timeline', 'المدة'], 'o' => [
      'ya'      => ['Cuanto antes', 'As soon as possible', 'في أقرب وقت'],
      'mes'     => ['Este mes', 'This month', 'هذا الشهر'],
      'trim'    => ['En los próximos meses', 'In the next few months', 'خلال الأشهر القادمة'],
      'mirando' => ['Está explorando opciones', 'Just exploring', 'يستكشف الخيارات'],
  ]],
];
$SERV = [
  'web'  => ['Desarrollo web', 'Web development', 'تطوير المواقع'],
  'soft' => ['Software a medida', 'Custom software', 'برمجيات مخصصة'],
  'auto' => ['Automatización', 'Automation', 'الأتمتة'],
  'ia'   => ['Agentes de IA', 'AI agents', 'وكلاء الذكاء الاصطناعي'],
];
$li = ['es' => 0, 'en' => 1, 'ar' => 2][$lang];

$resp = [];            // código => [etiqueta ES, valor ES, etiqueta cliente, valor cliente]
$recomendado = '';
if ($tipo === 'diagnostico') {
    foreach ($DIAG as $k => $def) {
        $v = (string) ($_POST['q_' . $k] ?? '');
        if (!isset($def['o'][$v])) contacto_fin(false, 'fields');
        $resp[$k] = [$def['titulo'][0], $def['o'][$v][0], $def['titulo'][$li], $def['o'][$v][$li]];
    }
    $rk = (string) ($_POST['recomendado'] ?? '');
    if (!isset($SERV[$rk])) contacto_fin(false, 'fields');
    $recomendado = $rk;
    $servicio = $SERV[$rk][0];
}

/* ── Validación ── */
if ($nombre === '' || $email === '' || !$privacidad) contacto_fin(false, 'fields');
if ($tipo === 'info' && zyra_largo($mensaje) < 5) contacto_fin(false, 'fields');
if ($tipo === 'cita' && ($fecha === '' || $fecha < date('Y-m-d'))) contacto_fin(false, 'fields');
// Mensajes con muchos enlaces = spam casi seguro
if (preg_match_all('~https?://~i', $mensaje . ' ' . $nombre) > 3) contacto_fin(true);
if (preg_match('~https?://~i', $nombre)) contacto_fin(true);
if (contacto_limite()) contacto_fin(false, 'limit');

/* ── Campos adicionales: cualquier campo nuevo que se añada a un
      formulario llega al email del equipo sin tocar este archivo ── */
$conocidos = ['t', 'lang', 'tipo', 'website', 'nombre', 'email', 'telefono', 'servicio', 'fecha', 'franja',
              'mensaje', 'privacidad', 'recomendado', 'q_necesidad', 'q_situacion', 'q_presupuesto', 'q_plazo', 'origen'];
$extra = [];
foreach ($_POST as $k => $v) {
    if (in_array($k, $conocidos, true) || !is_string($v) || !preg_match('/^[a-z0-9_\-]{1,40}$/i', $k)) continue;
    $v = zyra_texto($v, 500);
    if ($v === '') continue;
    $extra[ucfirst(str_replace(['_', '-'], ' ', $k))] = $v;
    if (count($extra) >= 20) break;
}
$pagina = $limpio('origen', 120);

/* ── Qué conviene que el cliente nos envíe, según el servicio ── */
$claves = ['Desarrollo web' => 'web', 'Software a medida' => 'soft', 'Automatización' => 'auto', 'Agentes de IA' => 'ia'];
$srv = $recomendado ?: ($claves[$servicio] ?? 'otro');
$ITEMS = [
 'es' => [
   'web'  => ['Un documento con la información de tu negocio y los textos que ya tengas', 'Tu logo y las fotos que quieras usar', 'Enlaces a 2 o 3 webs que te gusten (y qué te gusta de ellas)', 'Si ya tienes dominio o hosting, dónde está contratado'],
   'soft' => ['Una descripción del proceso que quieres gestionar, paso a paso', 'Las hojas de cálculo, formularios o documentos que usas hoy', 'Quién va a usar la aplicación y desde qué dispositivos'],
   'auto' => ['Las tareas que repetís y cuánto tiempo os llevan', 'Las herramientas que usáis (CRM, email, hojas de cálculo, WhatsApp…)', 'Un ejemplo real del proceso de principio a fin'],
   'ia'   => ['Las preguntas que más os hacen los clientes', 'Documentos con la información que debe conocer el agente (precios, horarios, servicios…)', 'Dónde quieres que atienda: web, WhatsApp o ambos'],
   'otro' => ['Qué problema quieres resolver', 'Para cuándo lo necesitas', 'Si ya tienes web, herramientas o datos en marcha'],
 ],
 'en' => [
   'web'  => ['A document with information about your business and any copy you have', 'Your logo and the photos you want to use', 'Links to 2 or 3 websites you like (and what you like about them)', 'If you already have a domain or hosting, where it is'],
   'soft' => ['A step-by-step description of the process you want to manage', 'The spreadsheets, forms or documents you use today', 'Who will use the app and on which devices'],
   'auto' => ['The tasks you repeat and how long they take', 'The tools you use (CRM, email, spreadsheets, WhatsApp…)', 'A real example of the process from start to finish'],
   'ia'   => ['The questions customers ask you most', 'Documents with the information the agent should know (prices, hours, services…)', 'Where it should answer: website, WhatsApp or both'],
   'otro' => ['What problem you want to solve', 'When you need it', 'Whether you already have a website, tools or data running'],
 ],
 'ar' => [
   'web'  => ['مستند بمعلومات نشاطك والنصوص المتوفرة لديك', 'شعارك والصور التي تريد استخدامها', 'روابط 2 أو 3 مواقع تعجبك (وما الذي يعجبك فيها)', 'إن كان لديك نطاق أو استضافة، فأين هما'],
   'soft' => ['وصف خطوة بخطوة للعملية التي تريد إدارتها', 'جداول البيانات أو النماذج أو المستندات التي تستخدمها اليوم', 'من سيستخدم التطبيق ومن أي أجهزة'],
   'auto' => ['المهام التي تكررونها وكم تستغرق', 'الأدوات التي تستخدمونها (CRM، البريد، جداول البيانات، واتساب…)', 'مثال حقيقي للعملية من البداية إلى النهاية'],
   'ia'   => ['أكثر الأسئلة التي يطرحها عملاؤكم', 'مستندات بالمعلومات التي يجب أن يعرفها الوكيل (الأسعار، المواعيد، الخدمات…)', 'أين يجب أن يرد: الموقع أو واتساب أو كلاهما'],
   'otro' => ['ما المشكلة التي تريد حلها', 'متى تحتاج الحل', 'هل لديك بالفعل موقع أو أدوات أو بيانات تعمل'],
 ],
][$lang][$srv];

/* ── Textos por tipo ── */
$TIPO_TXT = ['info' => 'Solicitud de información', 'cita' => 'Solicitud de llamada', 'diagnostico' => 'Diagnóstico completado'];
$L = [ // etiquetas del resumen del cliente
  'es' => ['servicio' => 'Servicio', 'rec' => 'Te recomendamos', 'fecha' => 'Fecha deseada', 'franja' => 'Franja horaria', 'tipo' => 'Tipo de solicitud',
           'tipos' => ['info' => 'Información sobre un proyecto', 'cita' => 'Llamada', 'diagnostico' => 'Diagnóstico de tu proyecto']],
  'en' => ['servicio' => 'Service', 'rec' => 'Our recommendation', 'fecha' => 'Preferred date', 'franja' => 'Time slot', 'tipo' => 'Request type',
           'tipos' => ['info' => 'Project enquiry', 'cita' => 'Call', 'diagnostico' => 'Project assessment']],
  'ar' => ['servicio' => 'الخدمة', 'rec' => 'نوصي بـ', 'fecha' => 'التاريخ المفضل', 'franja' => 'الفترة', 'tipo' => 'نوع الطلب',
           'tipos' => ['info' => 'استفسار عن مشروع', 'cita' => 'مكالمة', 'diagnostico' => 'تقييم مشروعك']],
][$lang];

$fechaBonita = $fecha !== '' ? date('d/m/Y', strtotime($fecha)) : '';
$servCliente = isset($claves[$servicio]) ? $SERV[$claves[$servicio]][$li] : $servicio;

/* Resumen que ve el cliente */
$resCli = [$L['tipo'] => $L['tipos'][$tipo]];
if ($tipo === 'diagnostico') {
    $resCli[$L['rec']] = $SERV[$recomendado][$li];
    foreach (['presupuesto', 'plazo'] as $k) $resCli[$resp[$k][2]] = $resp[$k][3];
} else {
    $resCli[$L['servicio']] = $servCliente;
}
if ($tipo === 'cita') { $resCli[$L['fecha']] = $fechaBonita; $resCli[$L['franja']] = $franja; }

/* Secciones del email interno */
$secciones = [];
$proyecto = ['Tipo de solicitud' => $TIPO_TXT[$tipo]];
if ($tipo !== 'diagnostico') $proyecto['Servicio que busca'] = $servicio ?: 'No indicado';
if ($tipo === 'diagnostico') {
    foreach ($resp as $r) $proyecto[$r[0]] = $r[1];
    $proyecto['Recomendación que vio en la web'] = $SERV[$recomendado][0];
}
if ($tipo === 'cita') { $proyecto['Fecha deseada'] = $fechaBonita; $proyecto['Franja horaria'] = $franja ?: 'Cualquier hora'; }
$secciones['Proyecto'] = $proyecto;

/* ── Envío: funciones en mailer.php (compartidas con las reseñas) ── */
require_once __DIR__ . '/mailer.php';

/* Copia de seguridad: aunque falle el email, la solicitud no se pierde.
   Se guarda en data/solicitudes.json (carpeta bloqueada desde la web). */
function contacto_guardar(array $datos): void {
    $f = zyra_dir() . '/solicitudes.json';
    $fh = @fopen($f, 'c+');
    if (!$fh) return;
    if (flock($fh, LOCK_EX)) {
        $raw = stream_get_contents($fh);
        $lista = json_decode($raw ?: '[]', true);
        if (!is_array($lista)) $lista = [];
        array_unshift($lista, $datos);
        $lista = array_slice($lista, 0, 300);
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
}

$id = zyra_id();
$idiomas = ['es' => 'Español', 'en' => 'Inglés', 'ar' => 'Árabe'];

/* 1) Guardar */
$registro = ['Tipo' => $TIPO_TXT[$tipo], 'Idioma' => strtoupper($lang), 'Nombre' => $nombre, 'Email' => $email,
             'Teléfono' => $telefono, 'Servicio' => $servicio];
if ($tipo === 'cita') { $registro['Fecha'] = $fecha; $registro['Franja'] = $franja; }
foreach ($resp as $r) $registro[$r[0]] = $r[1];
$registro += $extra;
contacto_guardar($registro + ['Mensaje' => $mensaje, 'Recibida' => date('c'), 'id' => $id]);

/* 2) Aviso al equipo */
$wa = preg_replace('/\D/', '', $telefono);
if (strlen($wa) === 9) $wa = '34' . $wa;           // número español sin prefijo
if (strlen($wa) < 9) $wa = '';
$equipo = email_equipo([
    'tipo_txt' => $TIPO_TXT[$tipo], 'servicio' => $servicio, 'nombre' => $nombre, 'email' => $email,
    'telefono' => $telefono, 'wa' => $wa, 'idioma' => $idiomas[$lang], 'secciones' => $secciones,
    'mensaje' => $mensaje, 'extra' => $extra, 'recibida' => date('d/m/Y \a \l\a\s H:i') . ' (hora de Canarias)',
    'id' => $id, 'origen' => $pagina,
]);
$asuntoEquipo = 'Nueva solicitud · ' . $TIPO_TXT[$tipo] . ' — ' . $nombre . ($servicio !== '' ? ' (' . $servicio . ')' : '');
$okEquipo = contacto_mail(CONTACTO_PARA, $asuntoEquipo, $equipo, $email, 'ZYRA · Web');
if (!$okEquipo) error_log('ZYRA contacto: no se pudo enviar el aviso de ' . $id . ' a ' . CONTACTO_PARA);

/* 3) Confirmación al cliente */
$waTxt = [
  'es' => 'Hola ZYRA, soy %s. Acabo de enviar una solicitud desde la web (%s).',
  'en' => 'Hi ZYRA, this is %s. I have just sent a request from your website (%s).',
  'ar' => 'مرحباً ZYRA، أنا %s. أرسلت للتو طلباً من موقعكم (%s).',
][$lang];
$cliente = email_cliente([
    'lang' => $lang, 'tipo' => $tipo, 'nombre' => $nombre, 'resumen' => $resCli, 'items' => $ITEMS,
    'wa_url' => 'https://wa.me/' . CONTACTO_WA . '?text=' . rawurlencode(sprintf($waTxt, $nombre, $servCliente ?: '-')),
]);
contacto_mail($email, $cliente['asunto'], $cliente, CONTACTO_PARA, 'ZYRA');

contacto_fin(true);
