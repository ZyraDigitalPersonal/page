<?php
/* ============================================================
   ZYRA · Plantillas de email
   · email_cliente(): confirmación para quien envía el formulario
   · email_equipo():  aviso interno con todos los datos, ordenados

   HTML de email "a la antigua" a propósito: tablas, estilos en
   línea, sin fuentes externas ni CSS moderno. Así se ve igual en
   Gmail, Outlook, Apple Mail y el móvil.
   ============================================================ */

function em_h($s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }

const EM_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/* Botón "a prueba de balas": se ve como botón también en Outlook */
function em_boton(string $url, string $texto, string $fondo, string $color = '#FFFFFF', string $borde = ''): string {
    $b = $borde !== '' ? $borde : $fondo;
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 6px 10px 0"><tr>'
        . '<td align="center" bgcolor="' . $fondo . '" style="border-radius:999px;background:' . $fondo . ';border:1px solid ' . $b . '">'
        . '<a href="' . em_h($url) . '" target="_blank" style="display:inline-block;padding:13px 26px;font-family:' . EM_FONT . ';font-size:15px;font-weight:600;line-height:20px;color:' . $color . ';text-decoration:none;border-radius:999px">'
        . em_h($texto) . '</a></td></tr></table>';
}

/* ─────────────────────────────────────────────────────────────
   EMAIL PARA EL CLIENTE
   $d = [lang, tipo, nombre, servicio_txt, resumen(array etiqueta=>valor),
         items(array), wa_url]
   ───────────────────────────────────────────────────────────── */
function email_cliente(array $d): array {
    $lang = $d['lang'];
    $rtl  = $lang === 'ar';
    $dir  = $rtl ? 'rtl' : 'ltr';
    $al   = $rtl ? 'right' : 'left';
    $tipo = $d['tipo'];

    $TX = [
      'es' => [
        'asunto'   => 'Hemos recibido tu solicitud · ZYRA',
        'pre'      => 'Te respondemos en menos de 24 horas laborables. Aquí tienes el resumen.',
        'kicker'   => 'SOLICITUD RECIBIDA',
        'hola'     => 'Gracias, %s.',
        'intro'    => [
            'info'        => 'Hemos recibido tu mensaje y ya está en manos del equipo. Lo revisamos con calma y te respondemos en menos de 24 horas laborables, por email o por WhatsApp.',
            'cita'        => 'Hemos recibido tu petición de llamada. Te escribimos en menos de 24 horas laborables para confirmar el día y la hora exactos.',
            'diagnostico' => 'Hemos recibido tus respuestas del diagnóstico. Revisamos tu caso y en menos de 24 horas laborables te escribimos con una propuesta concreta para empezar.',
        ],
        'resumen'  => 'Resumen de tu solicitud',
        'pasos_t'  => 'Qué pasa ahora',
        'pasos'    => ['Revisamos tu caso con la información que nos has dado.',
                       'Te escribimos en menos de 24 h laborables para aclarar lo necesario.',
                       'Te enviamos un presupuesto cerrado, sin compromiso.'],
        'lista'    => 'Si quieres ganar tiempo, puedes adelantarnos:',
        'cta'      => 'Escribirnos por WhatsApp',
        'cta2'     => 'Visitar la web',
        'dudas'    => '¿Tienes prisa o alguna duda? Responde a este email o escríbenos por WhatsApp: te contesta una persona del equipo, no un bot.',
        'saludo'   => 'Un saludo,',
        'firma'    => 'El equipo de ZYRA',
        'firma2'   => 'Ahmednah, Kilian e Iker',
        'pie'      => 'Agencia de desarrollo web, software a medida, automatización e IA.',
        'nota'     => 'Recibes este email porque has enviado un formulario en digitalzyra.com. Si no has sido tú, puedes ignorarlo.',
      ],
      'en' => [
        'asunto'   => 'We have received your request · ZYRA',
        'pre'      => 'We will reply within 24 working hours. Here is your summary.',
        'kicker'   => 'REQUEST RECEIVED',
        'hola'     => 'Thank you, %s.',
        'intro'    => [
            'info'        => 'We have received your message and it is already with the team. We will review it carefully and reply within 24 working hours, by email or WhatsApp.',
            'cita'        => 'We have received your call request. We will write to you within 24 working hours to confirm the exact day and time.',
            'diagnostico' => 'We have received your answers. We will review your case and, within 24 working hours, send you a concrete proposal to get started.',
        ],
        'resumen'  => 'Your request',
        'pasos_t'  => 'What happens next',
        'pasos'    => ['We review your case with the information you gave us.',
                       'We write to you within 24 working hours to clarify anything needed.',
                       'We send you a fixed quote, with no commitment.'],
        'lista'    => 'If you want to save time, you can send us in advance:',
        'cta'      => 'Message us on WhatsApp',
        'cta2'     => 'Visit the website',
        'dudas'    => 'In a hurry or have a question? Reply to this email or message us on WhatsApp: a real person from the team will answer, not a bot.',
        'saludo'   => 'Best regards,',
        'firma'    => 'The ZYRA team',
        'firma2'   => 'Ahmednah, Kilian and Iker',
        'pie'      => 'Web development, custom software, automation and AI agency.',
        'nota'     => 'You are receiving this email because you submitted a form on digitalzyra.com. If it was not you, you can ignore it.',
      ],
      'ar' => [
        'asunto'   => 'استلمنا طلبك · ZYRA',
        'pre'      => 'سنرد عليك خلال 24 ساعة عمل. إليك ملخص طلبك.',
        'kicker'   => 'تم استلام الطلب',
        'hola'     => 'شكراً لك، %s.',
        'intro'    => [
            'info'        => 'استلمنا رسالتك وهي الآن لدى الفريق. سنراجعها بعناية ونرد عليك خلال 24 ساعة عمل عبر البريد أو واتساب.',
            'cita'        => 'استلمنا طلب المكالمة. سنراسلك خلال 24 ساعة عمل لتأكيد اليوم والساعة.',
            'diagnostico' => 'استلمنا إجاباتك. سنراجع حالتك ونرسل لك خلال 24 ساعة عمل مقترحاً واضحاً للبدء.',
        ],
        'resumen'  => 'ملخص طلبك',
        'pasos_t'  => 'ماذا يحدث الآن',
        'pasos'    => ['نراجع حالتك بالمعلومات التي أرسلتها.',
                       'نراسلك خلال 24 ساعة عمل لتوضيح ما يلزم.',
                       'نرسل لك عرض سعر نهائياً دون أي التزام.'],
        'lista'    => 'إن أردت توفير الوقت، يمكنك أن ترسل لنا مسبقاً:',
        'cta'      => 'راسلنا عبر واتساب',
        'cta2'     => 'زيارة الموقع',
        'dudas'    => 'مستعجل أو لديك سؤال؟ رُدّ على هذا البريد أو راسلنا عبر واتساب: سيجيبك شخص من الفريق، لا روبوت.',
        'saludo'   => 'مع التحية،',
        'firma'    => 'فريق ZYRA',
        'firma2'   => 'أحمدناه وكيليان وإيكر',
        'pie'      => 'وكالة لتطوير المواقع والبرمجيات المخصصة والأتمتة والذكاء الاصطناعي.',
        'nota'     => 'تصلك هذه الرسالة لأنك أرسلت نموذجاً في digitalzyra.com. إن لم تكن أنت، يمكنك تجاهلها.',
      ],
    ][$lang];

    $intro = $TX['intro'][$tipo] ?? $TX['intro']['info'];

    /* Resumen */
    $filas = '';
    foreach ($d['resumen'] as $k => $v) {
        if ($v === '' || $v === null) continue;
        $filas .= '<tr>'
            . '<td valign="top" style="padding:9px 0;border-bottom:1px solid #222938;font-family:' . EM_FONT . ';font-size:13px;line-height:19px;color:#8B93A5;width:42%;text-align:' . $al . '">' . em_h($k) . '</td>'
            . '<td valign="top" style="padding:9px 0;border-bottom:1px solid #222938;font-family:' . EM_FONT . ';font-size:14px;line-height:20px;color:#F3F4F8;font-weight:600;text-align:' . $al . '">' . nl2br(em_h($v)) . '</td>'
            . '</tr>';
    }

    /* Pasos */
    $pasos = '';
    foreach ($TX['pasos'] as $i => $p) {
        $pasos .= '<tr>'
            . '<td valign="top" width="34" style="padding:0 0 12px;text-align:' . $al . '">'
            . '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" width="24" height="24" bgcolor="#221640" style="width:24px;height:24px;border-radius:999px;background:#221640;border:1px solid #5B3AA8;font-family:' . EM_FONT . ';font-size:12px;font-weight:700;color:#C9B3FF;line-height:24px">' . ($i + 1) . '</td></tr></table>'
            . '</td>'
            . '<td valign="top" style="padding:2px 0 12px;font-family:' . EM_FONT . ';font-size:15px;line-height:22px;color:#D5D9E2;text-align:' . $al . '">' . em_h($p) . '</td>'
            . '</tr>';
    }

    /* Lista de lo que conviene enviar */
    $items = '';
    foreach ($d['items'] as $it) {
        $items .= '<tr><td valign="top" width="18" style="padding:0 0 8px;font-family:' . EM_FONT . ';font-size:15px;line-height:22px;color:#A67CFF">&#8226;</td>'
            . '<td valign="top" style="padding:0 0 8px;font-family:' . EM_FONT . ';font-size:14px;line-height:22px;color:#B8BFCC;text-align:' . $al . '">' . em_h($it) . '</td></tr>';
    }

    /* Redes */
    $redes = [];
    foreach (ZYRA_REDES as $n => $u) {
        $redes[] = '<a href="' . em_h($u) . '" target="_blank" style="color:#B8BFCC;text-decoration:none">' . em_h($n) . '</a>';
    }
    $redes = implode('<span style="color:#3A4254">&nbsp;&nbsp;|&nbsp;&nbsp;</span>', $redes);

    $web = ZYRA_WEB . '/' . ['es' => 'es-es/', 'en' => 'en-en/', 'ar' => 'ar-ar/'][$lang];
    $pad = 'padding-left:40px;padding-right:40px';

    $html = '<!DOCTYPE html><html lang="' . $lang . '" dir="' . $dir . '" xmlns="http://www.w3.org/1999/xhtml"><head>'
      . '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      . '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
      . '<title>' . em_h($TX['asunto']) . '</title>'
      . '<style>@media only screen and (max-width:620px){.em-wrap{width:100%!important}.em-pad{padding-left:24px!important;padding-right:24px!important}.em-h1{font-size:26px!important;line-height:32px!important}}</style>'
      . '</head>'
      . '<body style="margin:0;padding:0;background:#07090D;-webkit-text-size-adjust:100%">'
      . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#07090D">' . em_h($TX['pre']) . '&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07090D" style="background:#07090D"><tr><td align="center" style="padding:32px 12px">'

      /* Tarjeta principal */
      . '<table role="presentation" class="em-wrap" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E121A" style="width:600px;max-width:600px;background:#0E121A;border:1px solid #1E2431;border-radius:20px">'

      /* Línea de acento */
      . '<tr><td height="4" bgcolor="#7C3AED" style="height:4px;line-height:4px;font-size:0;background:#7C3AED;border-radius:20px 20px 0 0">&nbsp;</td></tr>'

      /* Cabecera con logo */
      . '<tr><td class="em-pad" dir="ltr" style="' . $pad . ';padding-top:32px;padding-bottom:8px;text-align:' . $al . '">'
      . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="' . $al . '"><tr>'
      . '<td valign="middle" style="padding-right:12px"><img src="' . em_h(ZYRA_LOGO_URL) . '" width="40" height="36" alt="ZYRA" style="display:block;border:0;outline:none;width:40px;height:36px"></td>'
      . '<td valign="middle" style="font-family:' . EM_FONT . ';font-size:17px;font-weight:700;letter-spacing:4px;color:#FFFFFF">ZYRA</td>'
      . '</tr></table></td></tr>'

      /* Titular */
      . '<tr><td class="em-pad" style="' . $pad . ';padding-top:28px;text-align:' . $al . '">'
      . '<p style="margin:0 0 12px;font-family:' . EM_FONT . ';font-size:12px;font-weight:700;letter-spacing:2px;color:#B38BFF">' . em_h($TX['kicker']) . '</p>'
      . '<h1 class="em-h1" style="margin:0 0 16px;font-family:' . EM_FONT . ';font-size:30px;line-height:36px;font-weight:700;letter-spacing:-0.5px;color:#FFFFFF">' . em_h(sprintf($TX['hola'], $d['nombre'])) . '</h1>'
      . '<p style="margin:0;font-family:' . EM_FONT . ';font-size:16px;line-height:25px;color:#C4CAD6">' . em_h($intro) . '</p>'
      . '</td></tr>'

      /* Resumen */
      . ($filas !== '' ? '<tr><td class="em-pad" style="' . $pad . ';padding-top:28px">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#141A25" style="background:#141A25;border:1px solid #232A38;border-radius:14px"><tr><td style="padding:20px 22px 12px">'
        . '<p style="margin:0 0 6px;font-family:' . EM_FONT . ';font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8B93A5;text-align:' . $al . '">' . em_h($TX['resumen']) . '</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $filas . '</table>'
        . '</td></tr></table></td></tr>' : '')

      /* Próximos pasos */
      . '<tr><td class="em-pad" style="' . $pad . ';padding-top:30px;text-align:' . $al . '">'
      . '<p style="margin:0 0 16px;font-family:' . EM_FONT . ';font-size:17px;font-weight:700;color:#FFFFFF">' . em_h($TX['pasos_t']) . '</p>'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $pasos . '</table>'
      . '</td></tr>'

      /* Qué adelantar */
      . ($items !== '' ? '<tr><td class="em-pad" style="' . $pad . ';padding-top:14px;text-align:' . $al . '">'
        . '<p style="margin:0 0 12px;font-family:' . EM_FONT . ';font-size:15px;line-height:22px;color:#D5D9E2">' . em_h($TX['lista']) . '</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $items . '</table>'
        . '</td></tr>' : '')

      /* Botones */
      . '<tr><td class="em-pad" align="' . $al . '" style="' . $pad . ';padding-top:22px;text-align:' . $al . '">'
      . em_boton($d['wa_url'], $TX['cta'], '#7C3AED')
      . em_boton($web, $TX['cta2'], '#0E121A', '#E7E9EF', '#3A4254')
      . '</td></tr>'

      /* Dudas + firma */
      . '<tr><td class="em-pad" style="' . $pad . ';padding-top:14px;padding-bottom:36px;text-align:' . $al . '">'
      . '<p style="margin:0 0 22px;font-family:' . EM_FONT . ';font-size:14px;line-height:22px;color:#8B93A5">' . em_h($TX['dudas']) . '</p>'
      . '<p style="margin:0;font-family:' . EM_FONT . ';font-size:15px;line-height:23px;color:#C4CAD6">' . em_h($TX['saludo']) . '<br>'
      . '<strong style="color:#FFFFFF">' . em_h($TX['firma']) . '</strong><br>'
      . '<span style="color:#8B93A5;font-size:13px">' . em_h($TX['firma2']) . '</span></p>'
      . '</td></tr>'

      /* Pie */
      . '<tr><td class="em-pad" bgcolor="#0A0D13" style="' . $pad . ';padding-top:24px;padding-bottom:26px;background:#0A0D13;border-top:1px solid #1E2431;border-radius:0 0 20px 20px;text-align:' . $al . '">'
      . '<p style="margin:0 0 6px;font-family:' . EM_FONT . ';font-size:13px;font-weight:700;letter-spacing:3px;color:#FFFFFF">ZYRA</p>'
      . '<p style="margin:0 0 12px;font-family:' . EM_FONT . ';font-size:13px;line-height:20px;color:#8B93A5">' . em_h($TX['pie']) . '<br>'
      . '<a href="' . em_h($web) . '" target="_blank" style="color:#B38BFF;text-decoration:none">digitalzyra.com</a></p>'
      . '<p style="margin:0;font-family:' . EM_FONT . ';font-size:13px;line-height:20px">' . $redes . '</p>'
      . '</td></tr>'

      . '</table>'

      /* Nota legal fuera de la tarjeta */
      . '<table role="presentation" class="em-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px"><tr>'
      . '<td class="em-pad" style="padding:18px 40px 0;font-family:' . EM_FONT . ';font-size:12px;line-height:18px;color:#5E6678;text-align:center">' . em_h($TX['nota']) . '</td>'
      . '</tr></table>'

      . '</td></tr></table></body></html>';

    /* Versión en texto plano (la leen algunos clientes y los filtros de spam) */
    $t  = sprintf($TX['hola'], $d['nombre']) . "\n\n" . $intro . "\n\n";
    if ($d['resumen']) {
        $t .= mb_strtoupper($TX['resumen'], 'UTF-8') . "\n";
        foreach ($d['resumen'] as $k => $v) if ($v !== '' && $v !== null) $t .= '- ' . $k . ': ' . str_replace("\n", ' ', $v) . "\n";
        $t .= "\n";
    }
    $t .= mb_strtoupper($TX['pasos_t'], 'UTF-8') . "\n";
    foreach ($TX['pasos'] as $i => $p) $t .= ($i + 1) . '. ' . $p . "\n";
    if ($d['items']) {
        $t .= "\n" . $TX['lista'] . "\n";
        foreach ($d['items'] as $it) $t .= '- ' . $it . "\n";
    }
    $t .= "\n" . $TX['cta'] . ': ' . $d['wa_url'] . "\n\n" . $TX['dudas'] . "\n\n"
        . $TX['saludo'] . "\n" . $TX['firma'] . "\n" . $TX['firma2'] . "\n\n--\nZYRA · " . $web . "\n";
    foreach (ZYRA_REDES as $n => $u) $t .= $n . ': ' . $u . "\n";

    return ['asunto' => $TX['asunto'], 'html' => $html, 'texto' => $t];
}

/* ─────────────────────────────────────────────────────────────
   EMAIL PARA EL EQUIPO
   $d = [tipo_txt, nombre, email, telefono, wa, idioma,
         secciones => [titulo => [etiqueta => valor]],
         mensaje, extra => [etiqueta => valor], recibida, id, origen]
   ───────────────────────────────────────────────────────────── */
function email_equipo(array $d): array {
    $f = EM_FONT;
    $seccion = function (string $titulo, array $filas) use ($f): string {
        $r = '';
        foreach ($filas as $k => $v) {
            if ($v === '' || $v === null) $v = '—';
            $r .= '<tr>'
                . '<td valign="top" style="padding:9px 14px 9px 0;border-bottom:1px solid #EEF0F4;font-family:' . $f . ';font-size:13px;line-height:19px;color:#6B7280;width:38%">' . em_h($k) . '</td>'
                . '<td valign="top" style="padding:9px 0;border-bottom:1px solid #EEF0F4;font-family:' . $f . ';font-size:14px;line-height:20px;color:#111827;font-weight:600">' . (is_array($v) ? $v[0] : nl2br(em_h($v))) . '</td>'
                . '</tr>';
        }
        return '<tr><td style="padding:22px 28px 0">'
            . '<p style="margin:0 0 4px;font-family:' . $f . ';font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#7C3AED">' . em_h($titulo) . '</p>'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $r . '</table>'
            . '</td></tr>';
    };

    $mailto = 'mailto:' . $d['email'] . '?subject=' . rawurlencode('Tu solicitud en ZYRA');
    $cliente = [
        'Nombre'   => $d['nombre'],
        'Email'    => ['<a href="' . em_h($mailto) . '" style="color:#6D28D9;text-decoration:none">' . em_h($d['email']) . '</a>'],
        'Teléfono' => $d['telefono'] !== '' ? $d['telefono'] : 'No indicado',
        'Idioma de la web' => $d['idioma'],
    ];

    $cuerpo = $seccion('Datos del cliente', $cliente);
    foreach ($d['secciones'] as $titulo => $filas) $cuerpo .= $seccion($titulo, $filas);

    $cuerpo .= '<tr><td style="padding:22px 28px 0">'
        . '<p style="margin:0 0 8px;font-family:' . $f . ';font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#7C3AED">Información adicional</p>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#F6F4FE" style="background:#F6F4FE;border-left:3px solid #7C3AED;padding:14px 16px;font-family:' . $f . ';font-size:14px;line-height:22px;color:#1F2937">'
        . ($d['mensaje'] !== '' ? nl2br(em_h($d['mensaje'])) : '<span style="color:#6B7280">El cliente no ha añadido comentarios.</span>')
        . '</td></tr></table></td></tr>';

    if ($d['extra']) $cuerpo .= $seccion('Otros datos del formulario', $d['extra']);

    /* Botones de contacto */
    $botones = em_boton($mailto, 'Responder por email', '#111827');
    if ($d['wa'] !== '') {
        $waTxt = 'Hola ' . $d['nombre'] . ', soy del equipo de ZYRA. Hemos recibido tu solicitud y queríamos comentarte';
        $botones .= em_boton('https://wa.me/' . $d['wa'] . '?text=' . rawurlencode($waTxt), 'Abrir WhatsApp', '#1FAF5A');
        $botones .= em_boton('tel:+' . $d['wa'], 'Llamar', '#FFFFFF', '#111827', '#D1D5DB');
    }

    $html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nueva solicitud</title>'
      . '<style>@media only screen and (max-width:660px){.t-wrap{width:100%!important}}</style></head>'
      . '<body style="margin:0;padding:0;background:#F3F4F6">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F3F4F6" style="background:#F3F4F6"><tr><td align="center" style="padding:24px 10px">'
      . '<table role="presentation" class="t-wrap" width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:640px;max-width:640px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:14px">'
      . '<tr><td bgcolor="#0E121A" style="background:#0E121A;padding:22px 28px;border-radius:14px 14px 0 0">'
      . '<p style="margin:0 0 4px;font-family:' . $f . ';font-size:11px;font-weight:700;letter-spacing:2px;color:#B38BFF">NUEVA SOLICITUD — ZYRA</p>'
      . '<p style="margin:0;font-family:' . $f . ';font-size:21px;line-height:28px;font-weight:700;color:#FFFFFF">' . em_h($d['nombre']) . '</p>'
      . '<p style="margin:4px 0 0;font-family:' . $f . ';font-size:14px;color:#C4CAD6">' . em_h($d['tipo_txt']) . ($d['servicio'] !== '' ? ' · ' . em_h($d['servicio']) : '') . '</p>'
      . '</td></tr>'
      . '<tr><td style="padding:20px 28px 0">' . $botones . '</td></tr>'
      . $cuerpo
      . '<tr><td style="padding:24px 28px 26px;font-family:' . $f . ';font-size:12px;line-height:18px;color:#9CA3AF">'
      . 'Recibida el ' . em_h($d['recibida']) . ' · Ref. ' . em_h($d['id']) . ($d['origen'] !== '' ? ' · Enviada desde ' . em_h($d['origen']) : '') . '<br>'
      . 'Si respondes a este email, la respuesta le llega directamente al cliente.'
      . '</td></tr>'
      . '</table></td></tr></table></body></html>';

    /* Texto plano */
    $linea = str_repeat('-', 40);
    $t = $linea . "\nNUEVA SOLICITUD — ZYRA\n" . $d['tipo_txt'] . ($d['servicio'] !== '' ? ' · ' . $d['servicio'] : '') . "\n" . $linea . "\n\nDATOS DEL CLIENTE\n";
    $t .= 'Nombre: ' . $d['nombre'] . "\nEmail: " . $d['email'] . "\nTeléfono: " . ($d['telefono'] ?: 'No indicado') . "\nIdioma: " . $d['idioma'] . "\n";
    foreach ($d['secciones'] as $titulo => $filas) {
        $t .= "\n" . mb_strtoupper($titulo, 'UTF-8') . "\n";
        foreach ($filas as $k => $v) $t .= $k . ': ' . ($v === '' ? '—' : $v) . "\n";
    }
    $t .= "\nINFORMACIÓN ADICIONAL\n" . ($d['mensaje'] !== '' ? $d['mensaje'] : 'Sin comentarios.') . "\n";
    if ($d['extra']) {
        $t .= "\nOTROS DATOS\n";
        foreach ($d['extra'] as $k => $v) $t .= $k . ': ' . $v . "\n";
    }
    $t .= "\n" . $linea . "\nCONTACTO\n" . $linea . "\nEmail: " . $d['email'] . "\n";
    if ($d['wa'] !== '') $t .= 'WhatsApp: https://wa.me/' . $d['wa'] . "\n";
    $t .= "\nRecibida el " . $d['recibida'] . ' · Ref. ' . $d['id'] . "\n";

    return ['html' => $html, 'texto' => $t];
}
