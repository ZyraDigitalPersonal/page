<?php
/* ============================================================
   ZYRA · Envío de emails (compartido)
   Lo usan el formulario de contacto (contacto.php) y las
   reseñas (resenas.php). Primero SMTP con el buzón de Hostinger
   (SMTP_PASS en config.php); si no hay contraseña o falla, mail().
   ============================================================ */

require_once __DIR__ . '/lib.php';

function contacto_dominio(): string {
    return substr(strrchr(SMTP_USER, '@'), 1) ?: 'digitalzyra.com';
}

/* Construye el mensaje: texto plano + HTML (llega mejor y con menos spam) */
function contacto_mensaje(string $para, string $asunto, string $html, string $texto, string $replyTo, string $deNombre): array {
    $b = 'zyra_' . bin2hex(random_bytes(8));
    $cab = [
        'Date: ' . date('r'),
        'From: =?UTF-8?B?' . base64_encode($deNombre) . '?= <' . SMTP_USER . '>',
        'To: <' . $para . '>',
        'Subject: =?UTF-8?B?' . base64_encode($asunto) . '?=',
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . contacto_dominio() . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $b . '"',
    ];
    if ($replyTo !== '') $cab[] = 'Reply-To: <' . $replyTo . '>';
    $cuerpo = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($texto))
        . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--$b--\r\n";
    return [$cab, $cuerpo];
}

/* SMTP con el buzón de Hostinger (SSL, puerto 465) */
function contacto_smtp(string $para, array $cab, string $cuerpo): bool {
    if (SMTP_PASS === '') return false;
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $fp = @stream_socket_client('ssl://' . SMTP_HOST . ':' . SMTP_PORT, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { error_log("ZYRA SMTP: sin conexión ($errno) $errstr"); return false; }
    stream_set_timeout($fp, 20);

    $leer = function () use ($fp): string {
        $r = '';
        while (($linea = fgets($fp, 1024)) !== false) {
            $r .= $linea;
            if (strlen($linea) < 4 || $linea[3] === ' ') break;   // última línea de la respuesta
        }
        return $r;
    };
    $paso = function (?string $orden, int $espera) use ($fp, $leer): bool {
        if ($orden !== null) fwrite($fp, $orden . "\r\n");
        $r = $leer();
        if ((int) substr($r, 0, 3) !== $espera) {
            error_log('ZYRA SMTP: ' . ($orden === null ? 'saludo' : strtok($orden, ' ')) . ' → ' . trim($r));
            return false;
        }
        return true;
    };
    // Una línea que empiece por "." se duplica (norma SMTP)
    $datos = preg_replace('/^\./m', '..', implode("\r\n", $cab) . "\r\n\r\n" . $cuerpo);
    $ok = $paso(null, 220)
        && $paso('EHLO ' . contacto_dominio(), 250)
        && $paso('AUTH LOGIN', 334)
        && $paso(base64_encode(SMTP_USER), 334)
        && $paso(base64_encode(SMTP_PASS), 235)
        && $paso('MAIL FROM:<' . SMTP_USER . '>', 250)
        && $paso('RCPT TO:<' . $para . '>', 250)
        && $paso('DATA', 354)
        && $paso($datos . "\r\n.", 250);
    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
    return $ok;
}

/* Primero SMTP (si hay contraseña); si falla, mail() del hosting */
function contacto_mail(string $para, string $asunto, array $cuerpo, string $replyTo = '', string $deNombre = 'ZYRA'): bool {
    [$cab, $mime] = contacto_mensaje($para, $asunto, $cuerpo['html'], $cuerpo['texto'], $replyTo, $deNombre);
    if (contacto_smtp($para, $cab, $mime)) return true;
    $cab = array_values(array_filter($cab, fn($c) => !preg_match('/^(To|Subject):/', $c)));
    $ok = @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $mime, implode("\r\n", $cab), '-f' . SMTP_USER);
    if (!$ok) error_log('ZYRA contacto: mail() no pudo enviar a ' . $para);
    return $ok;
}
