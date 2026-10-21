<?php
/* ============================================================
   ZYRA · Reseñas — funciones compartidas
   ============================================================ */

require_once __DIR__ . '/config.php';

/* ── Almacén (archivo JSON con bloqueo, sin base de datos) ── */

function zyra_dir(): string {
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
    return DATA_DIR;
}

function zyra_archivo(): string {
    return zyra_dir() . '/resenas.json';
}

function zyra_leer(): array {
    $f = zyra_archivo();
    if (!is_file($f)) return [];
    $raw = @file_get_contents($f);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/* Escribe con bloqueo exclusivo: dos envíos a la vez no se pisan. */
function zyra_guardar(array $lista): bool {
    $f = zyra_archivo();
    $fh = @fopen($f, 'c+');
    if (!$fh) return false;
    $ok = false;
    if (flock($fh, LOCK_EX)) {
        ftruncate($fh, 0);
        rewind($fh);
        $ok = fwrite($fh, json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) !== false;
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
    return $ok;
}

/* Añade una reseña sin leer y escribir por separado (evita perder envíos). */
function zyra_anadir(array $resena): bool {
    $lista = zyra_leer();
    array_unshift($lista, $resena);
    if (count($lista) > 500) $lista = array_slice($lista, 0, 500);
    return zyra_guardar($lista);
}

/* ── Limpieza de texto ─────────────────────────────────────── */

function zyra_texto($v, int $max = 300): string {
    $v = is_string($v) ? $v : '';
    $v = str_replace(["\r\n", "\r"], "\n", strip_tags($v));
    $v = preg_replace('/\n{3,}/', "\n\n", $v);
    $v = trim(preg_replace('/[ \t]{2,}/', ' ', $v));
    if (function_exists('mb_substr')) return mb_substr($v, 0, $max, 'UTF-8');
    return substr($v, 0, $max);
}

function zyra_largo(string $v): int {
    return function_exists('mb_strlen') ? mb_strlen($v, 'UTF-8') : strlen($v);
}

/* Iniciales para el avatar de quien no entra con Google */
function zyra_iniciales(string $nombre): string {
    $partes = preg_split('/\s+/u', trim($nombre));
    $ini = '';
    foreach ($partes as $p) {
        if ($p === '') continue;
        $ini .= function_exists('mb_substr') ? mb_strtoupper(mb_substr($p, 0, 1, 'UTF-8'), 'UTF-8') : strtoupper($p[0]);
        if (zyra_largo($ini) >= 2) break;
    }
    return $ini !== '' ? $ini : 'Z';
}

/* ── Antiabuso ─────────────────────────────────────────────── */

function zyra_ip_hash(): string {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    $ip = trim(explode(',', $ip)[0]);
    // Se guarda el hash, nunca la IP: menos datos personales almacenados.
    return substr(hash('sha256', $ip . '|zyra-resenas'), 0, 24);
}

function zyra_limite_superado(): bool {
    $f = zyra_dir() . '/envios.json';
    $hoy = gmdate('Y-m-d');
    $reg = is_file($f) ? json_decode(@file_get_contents($f), true) : [];
    if (!is_array($reg)) $reg = [];
    // Se descarta lo de días anteriores
    $reg = array_filter($reg, fn($v) => ($v['dia'] ?? '') === $hoy);
    $ip = zyra_ip_hash();
    $n = isset($reg[$ip]) ? (int) $reg[$ip]['n'] : 0;
    if ($n >= MAX_POR_IP_DIA) return true;
    $reg[$ip] = ['dia' => $hoy, 'n' => $n + 1];
    @file_put_contents($f, json_encode($reg), LOCK_EX);
    return false;
}

/* ── Google: comprobar el token y quedarnos con la foto ────── */

function zyra_http_get(string $url): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT      => 'zyra-resenas/1.0',
        ]);
        $r = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($r !== false && $code === 200) ? $r : null;
    }
    if (ini_get('allow_url_fopen')) {
        $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true]]);
        $r = @file_get_contents($url, false, $ctx);
        return $r === false ? null : $r;
    }
    return null;
}

/**
 * Valida el id_token que devuelve el botón de Google.
 * Devuelve ['nombre','email','foto'] o null si no es válido.
 */
function zyra_google_verificar(string $token): ?array {
    if (GOOGLE_CLIENT_ID === '' || $token === '') return null;
    if (!preg_match('/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/', $token)) return null;

    $raw = zyra_http_get('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token));
    if ($raw === null) return null;
    $d = json_decode($raw, true);
    if (!is_array($d)) return null;

    // El token tiene que ser nuestro, estar vigente y venir de Google
    if (($d['aud'] ?? '') !== GOOGLE_CLIENT_ID) return null;
    if (!in_array($d['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)) return null;
    if ((int) ($d['exp'] ?? 0) < time()) return null;
    if (($d['email_verified'] ?? 'false') !== 'true' && ($d['email_verified'] ?? false) !== true) return null;

    return [
        'nombre' => zyra_texto($d['name'] ?? ($d['given_name'] ?? ''), 60),
        'email'  => zyra_texto($d['email'] ?? '', 120),
        'foto'   => (string) ($d['picture'] ?? ''),
    ];
}

/**
 * Se descarga la foto de Google y se guarda en el propio hosting.
 * Así la reseña no depende de un enlace externo que puede caducar
 * y la web sigue sirviendo todas las imágenes desde su dominio.
 */
function zyra_guardar_avatar(string $url, string $id): string {
    if ($url === '') return '';
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host || !preg_match('/(^|\.)googleusercontent\.com$/', $host)) return '';

    $url = preg_replace('/=s\d+(-c)?$/', '=s160-c', $url);
    $bin = zyra_http_get($url);
    if ($bin === null || strlen($bin) > 600000 || strlen($bin) < 80) return '';

    $info = @getimagesizefromstring($bin);
    if (!$info) return '';
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$info['mime']] ?? '';
    if ($ext === '') return '';

    if (!is_dir(AVATAR_DIR)) @mkdir(AVATAR_DIR, 0755, true);
    $nombre = $id . '.' . $ext;
    if (@file_put_contents(AVATAR_DIR . '/' . $nombre, $bin) === false) return '';
    return AVATAR_URL . '/' . $nombre;
}

/* ── Utilidades varias ─────────────────────────────────────── */

function zyra_id(): string {
    return date('ymd') . '-' . bin2hex(random_bytes(5));
}

function zyra_json($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/* Lo que se muestra en la web: nunca sale el email ni el hash de IP. */
function zyra_publica(array $r): array {
    return [
        'id'        => $r['id'] ?? '',
        'nombre'    => $r['nombre'] ?? '',
        'iniciales' => $r['iniciales'] ?? '',
        'avatar'    => $r['avatar'] ?? '',
        'estrellas' => (int) ($r['estrellas'] ?? 5),
        'texto'     => $r['texto'] ?? '',
        'servicio'  => $r['servicio'] ?? '',
        'empresa'   => $r['empresa'] ?? '',
        'verificada'=> !empty($r['verificada']),
        'fecha'     => $r['fecha'] ?? '',
    ];
}
