<?php
/* ============================================================
   ZYRA · Reseñas — API pública
   GET  /api/resenas.php        → reseñas publicadas + media
   POST /api/resenas.php        → nueva reseña (v10: se publica al momento)

   v10 · Las reseñas salen en la web en cuanto se envían y llega un
   aviso al correo del equipo (AVISO_EMAIL, o CONTACTO_PARA si está
   vacío). Solo quedan en espera las que parecen spam (enlaces,
   palabras típicas de spam o texto aleatorio): esas se aprueban o
   se borran en /admin/. Para volver a revisar TODAS antes de
   publicarlas, añade en config.php:
       const RESENAS_REVISAR_ANTES = true;
   ============================================================ */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/mailer.php';

/* ¿Parece spam? Entonces no se publica sola: queda en espera. */
function zyra_parece_spam(string $texto, string $nombre, string $empresa): bool {
    $todo = $texto . ' ' . $nombre . ' ' . $empresa;
    if (preg_match('~https?://|www\.|\b[a-z0-9-]+\.(ru|xyz|top|click|link|shop|biz|info|io|co)\b~iu', $todo)) return true;
    if (preg_match('~\b(escort|casino|viagra|cialis|crypto|bitcoin|forex|porn|xxx|onlyfans|backlinks?|seo services|loan|betting)~iu', $todo)) return true;
    // Texto aleatorio tipo "qP9zSIh 4Csv": palabras con mayúsculas o números mezclados
    $pal = preg_split('/\s+/u', trim($texto)) ?: [];
    $raras = 0;
    foreach ($pal as $p) {
        if (preg_match('/[a-z][A-Z]|[A-Za-z]\d|\d[A-Za-z]/u', $p) || (zyra_largo($p) > 6 && !preg_match('/[aeiouáéíóúAEIOUÁÉÍÓÚ\p{Arabic}]/u', $p))) $raras++;
    }
    return count($pal) > 0 && $raras / count($pal) > 0.3;
}

header('Cache-Control: no-store');

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/* ── Listado ────────────────────────────────────────────────  */
if ($metodo === 'GET') {
    $lista = array_values(array_filter(zyra_leer(), fn($r) => ($r['estado'] ?? '') === 'publicada'));

    $suma = 0;
    foreach ($lista as $r) $suma += (int) ($r['estrellas'] ?? 5);
    $total = count($lista);

    zyra_json([
        'ok'      => true,
        'total'   => $total,
        'media'   => $total ? round($suma / $total, 1) : 0,
        'google'    => GOOGLE_CLIENT_ID !== '',
        'client_id' => GOOGLE_CLIENT_ID,
        'resenas' => array_map('zyra_publica', $lista),
    ]);
}

if ($metodo !== 'POST') zyra_json(['ok' => false, 'error' => 'metodo'], 405);

/* ── Nueva reseña ───────────────────────────────────────────  */

$cuerpo = file_get_contents('php://input');
$in = json_decode($cuerpo, true);
if (!is_array($in)) $in = $_POST;

/* Mismo antispam que el resto de formularios de la web:
   campo trampa relleno o formulario enviado demasiado rápido.
   No se avisa del motivo, así el robot no aprende. */
if (!empty($in['website'])) zyra_json(['ok' => true, 'estado' => 'espera']);
$tiempo = (int) ($in['t'] ?? 0);
if ($tiempo > 0 && $tiempo < 3000) zyra_json(['ok' => true, 'estado' => 'espera']);

$estrellas = (int) ($in['estrellas'] ?? 0);
$texto     = zyra_texto($in['texto'] ?? '', MAX_CARACTERES);
$servicio  = zyra_texto($in['servicio'] ?? '', 40);
$empresa   = zyra_texto($in['empresa'] ?? '', 60);
$nombre    = zyra_texto($in['nombre'] ?? '', 60);
$token     = is_string($in['google'] ?? null) ? $in['google'] : '';

if ($estrellas < 1 || $estrellas > 5) {
    zyra_json(['ok' => false, 'error' => 'estrellas'], 422);
}
if (zyra_largo($texto) < MIN_CARACTERES) {
    zyra_json(['ok' => false, 'error' => 'corto', 'min' => MIN_CARACTERES], 422);
}

$google = $token !== '' ? zyra_google_verificar($token) : null;
if ($token !== '' && $google === null) {
    zyra_json(['ok' => false, 'error' => 'google'], 401);
}

if ($google === null && $nombre === '') {
    zyra_json(['ok' => false, 'error' => 'nombre'], 422);
}

if (zyra_limite_superado()) {
    zyra_json(['ok' => false, 'error' => 'limite'], 429);
}

$id = zyra_id();
$verificada = $google !== null;
$nombreFinal = $verificada ? $google['nombre'] : $nombre;
if ($nombreFinal === '') $nombreFinal = 'Cliente';

$avatar = $verificada ? zyra_guardar_avatar($google['foto'], $id) : '';

// Todas las reseñas se revisan en el panel antes de publicarse (contenido de
// usuarios moderado: evita spam y opiniones falsas). Antes dependía de
// RESENAS_REVISAR_ANTES en config.php; ahora es siempre así.
$revisar = true;
$spam = zyra_parece_spam($texto, $nombreFinal, $empresa);
$auto = !$revisar && !$spam;

$resena = [
    'id'         => $id,
    'nombre'     => $nombreFinal,
    'iniciales'  => zyra_iniciales($nombreFinal),
    'avatar'     => $avatar,
    'email'      => $verificada ? $google['email'] : '',   // solo lo ve el panel
    'estrellas'  => $estrellas,
    'texto'      => $texto,
    'servicio'   => $servicio,
    'empresa'    => $empresa,
    'verificada' => $verificada,
    'estado'     => $auto ? 'publicada' : 'espera',
    'fecha'      => gmdate('c'),
    'ip'         => zyra_ip_hash(),
];

if (!zyra_anadir($resena)) {
    zyra_json(['ok' => false, 'error' => 'guardar'], 500);
}

/* Aviso al equipo por email (mismo envío que el formulario de contacto).
   Se manda DESPUÉS de responder al navegador: quien escribe la reseña
   no espera a que el correo salga. */
$para = AVISO_EMAIL !== '' ? AVISO_EMAIL : (defined('CONTACTO_PARA') ? CONTACTO_PARA : '');
if ($para !== '') {
    register_shutdown_function(function () use ($para, $estrellas, $nombreFinal, $empresa, $servicio, $verificada, $texto, $auto, $spam, $id) {
        if (function_exists('fastcgi_finish_request')) @fastcgi_finish_request();
        elseif (function_exists('litespeed_finish_request')) @litespeed_finish_request();

        $h = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
        $estrellasTxt = str_repeat('★', $estrellas) . str_repeat('☆', 5 - $estrellas);
        $panel = rtrim(defined('ZYRA_WEB') ? ZYRA_WEB : 'https://digitalzyra.com', '/') . '/admin/';
        $web = rtrim(defined('ZYRA_WEB') ? ZYRA_WEB : 'https://digitalzyra.com', '/') . '/es-es/#opiniones';
        $estadoTxt = $auto ? 'Ya está publicada en la web.' : ($spam ? 'Parece spam: está EN ESPERA. Apruébala o bórrala en el panel.' : 'Está en espera: apruébala en el panel.');
        $asunto = 'Nueva reseña ' . $estrellas . '/5 — ' . $nombreFinal;
        $texto_plano = "Nueva reseña en digitalzyra.com\n\n"
            . "Nombre: $nombreFinal" . ($empresa !== '' ? " ($empresa)" : '') . "\n"
            . "Valoración: $estrellas/5\n"
            . ($servicio !== '' ? "Servicio: $servicio\n" : '')
            . "Verificada con Google: " . ($verificada ? 'sí' : 'no') . "\n\n"
            . "$texto\n\n$estadoTxt\nVer en la web: $web\nPanel: $panel\n";
        $html = '<!doctype html><html><body style="margin:0;background:#07090D;font-family:Arial,Helvetica,sans-serif;color:#F5F7FA">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090D;padding:28px 12px"><tr><td align="center">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121722;border:1px solid #2a2f3d;border-radius:18px;padding:28px">'
            . '<tr><td style="font-size:12px;letter-spacing:2px;color:#A855F7;text-transform:uppercase">Nueva reseña · ZYRA</td></tr>'
            . '<tr><td style="padding-top:10px;font-size:24px;color:#FACC15">' . $estrellasTxt . '</td></tr>'
            . '<tr><td style="padding-top:8px;font-size:18px;font-weight:bold">' . $h($nombreFinal) . ($empresa !== '' ? ' <span style="color:#A6ADBA;font-weight:normal">· ' . $h($empresa) . '</span>' : '') . '</td></tr>'
            . ($servicio !== '' ? '<tr><td style="padding-top:4px;color:#A6ADBA;font-size:14px">' . $h($servicio) . '</td></tr>' : '')
            . '<tr><td style="padding-top:18px;font-size:16px;line-height:1.6;color:#E6E8EE">' . nl2br($h($texto)) . '</td></tr>'
            . '<tr><td style="padding-top:20px;font-size:14px;color:' . ($auto ? '#22C55E' : '#FACC15') . '">' . $h($estadoTxt) . '</td></tr>'
            . '<tr><td style="padding-top:22px"><a href="' . $h($web) . '" style="display:inline-block;background:#F5F7FA;color:#07090D;text-decoration:none;padding:12px 20px;border-radius:99px;font-size:14px;margin-right:8px">Ver en la web</a>'
            . '<a href="' . $h($panel) . '" style="display:inline-block;border:1px solid #7C3AED;color:#F5F7FA;text-decoration:none;padding:11px 20px;border-radius:99px;font-size:14px">Abrir el panel</a></td></tr>'
            . '</table></td></tr></table></body></html>';
        if (!contacto_mail($para, $asunto, ['html' => $html, 'texto' => $texto_plano], '', 'ZYRA · Reseñas')) {
            error_log('ZYRA reseñas: no se pudo enviar el aviso de ' . $id);
        }

    });
}

zyra_json(['ok' => true, 'estado' => $resena['estado']]);
