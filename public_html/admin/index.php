<?php
/* ============================================================
   ZYRA · Panel de reseñas
   Sin JavaScript: todo funciona con formularios normales.
   ============================================================ */

require_once __DIR__ . '/../api/lib.php';

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'cookie_secure'   => !empty($_SERVER['HTTPS']),
]);

$error = '';
$aviso = '';

/* ── Salir ──────────────────────────────────────────────────  */
if (isset($_GET['salir'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

/* ── Entrar ─────────────────────────────────────────────────  */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['clave'])) {
    // Una espera corta frena los intentos automáticos por fuerza bruta
    usleep(400000);
    if (password_verify((string) $_POST['clave'], ADMIN_PASS_HASH)) {
        session_regenerate_id(true);
        $_SESSION['zyra_admin'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        header('Location: index.php');
        exit;
    }
    $error = 'Contraseña incorrecta.';
}

$dentro = !empty($_SESSION['zyra_admin']);

/* ── Acciones sobre una reseña ──────────────────────────────  */
if ($dentro && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['accion'])) {
    if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
        $error = 'Sesión caducada, vuelve a intentarlo.';
    } else {
        $id = (string) ($_POST['id'] ?? '');
        $lista = zyra_leer();
        foreach ($lista as $i => $r) {
            if (($r['id'] ?? '') !== $id) continue;
            if ($_POST['accion'] === 'publicar')   { $lista[$i]['estado'] = 'publicada'; $aviso = 'Reseña publicada.'; }
            if ($_POST['accion'] === 'retirar')    { $lista[$i]['estado'] = 'espera';     $aviso = 'Reseña retirada de la web.'; }
            if ($_POST['accion'] === 'borrar') {
                $av = $r['avatar'] ?? '';
                if ($av !== '') @unlink(__DIR__ . '/../' . $av);
                array_splice($lista, $i, 1);
                $aviso = 'Reseña borrada.';
            }
            break;
        }
        zyra_guardar($lista);
    }
}

$todas = $dentro ? zyra_leer() : [];
$espera = array_values(array_filter($todas, fn($r) => ($r['estado'] ?? '') !== 'publicada'));
$publicadas = array_values(array_filter($todas, fn($r) => ($r['estado'] ?? '') === 'publicada'));
$claveDefecto = $dentro && password_verify('zyra-admin', ADMIN_PASS_HASH);

function e($v) { return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8'); }

function ficha(array $r, string $csrf): void { ?>
  <article class="r">
    <div class="r__top">
      <?php if (!empty($r['avatar'])): ?>
        <img class="r__ava" src="<?= e('../' . $r['avatar']) ?>" alt="" width="46" height="46">
      <?php else: ?>
        <span class="r__ava r__ava--ini"><?= e($r['iniciales'] ?? 'Z') ?></span>
      <?php endif; ?>
      <div>
        <p class="r__name"><?= e($r['nombre'] ?? '') ?>
          <?php if (!empty($r['verificada'])): ?><span class="tag">Google</span><?php endif; ?>
        </p>
        <p class="r__meta">
          <?= e(str_repeat('★', (int) ($r['estrellas'] ?? 0)) . str_repeat('☆', 5 - (int) ($r['estrellas'] ?? 0))) ?>
          · <?= e(substr((string) ($r['fecha'] ?? ''), 0, 10)) ?>
          <?php if (!empty($r['servicio'])): ?> · <?= e($r['servicio']) ?><?php endif; ?>
          <?php if (!empty($r['empresa'])): ?> · <?= e($r['empresa']) ?><?php endif; ?>
          <?php if (!empty($r['email'])): ?> · <?= e($r['email']) ?><?php endif; ?>
        </p>
      </div>
    </div>
    <p class="r__text"><?= nl2br(e($r['texto'] ?? '')) ?></p>
    <form method="post" class="r__acts">
      <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
      <input type="hidden" name="id" value="<?= e($r['id'] ?? '') ?>">
      <?php if (($r['estado'] ?? '') === 'publicada'): ?>
        <button name="accion" value="retirar" class="b">Retirar de la web</button>
      <?php else: ?>
        <button name="accion" value="publicar" class="b b--ok">Publicar</button>
      <?php endif; ?>
      <button name="accion" value="borrar" class="b b--no">Borrar</button>
    </form>
  </article>
<?php }
?>
<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Reseñas — ZYRA</title>
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="stylesheet" href="../assets/css/zyra.css?v=27">
<style>
  body{padding:clamp(24px,5vw,60px);background:var(--void)}
  .wrap{max-width:820px;margin:0 auto}
  .head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:34px}
  .head h1{font-family:var(--display);font-size:clamp(1.8rem,4vw,2.6rem)}
  .head a{color:var(--muted);font-size:.9rem;border-bottom:1px solid var(--line-2)}
  h2{font-size:1.1rem;margin:38px 0 16px;color:var(--muted);font-family:var(--sans);font-weight:500;letter-spacing:.04em}
  .r{border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:14px;background:linear-gradient(160deg,var(--panel-a),var(--panel-b))}
  .r__top{display:flex;gap:14px;align-items:center;margin-bottom:14px}
  .r__ava{width:46px;height:46px;border-radius:99px;object-fit:cover;border:1px solid var(--line-2);flex:0 0 auto}
  .r__ava--ini{display:grid;place-items:center;background:var(--soft-2);font-family:var(--display);font-size:1rem}
  .r__name{font-weight:500}
  .r__meta{color:var(--muted);font-size:.82rem;margin-top:2px}
  .tag{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:99px;border:1px solid var(--line-2);font-size:.68rem;color:var(--violet-lit);vertical-align:middle}
  .r__text{color:var(--muted);font-size:.96rem;margin-bottom:16px}
  .r__acts{display:flex;gap:10px;flex-wrap:wrap}
  .b{padding:9px 16px;border-radius:99px;border:1px solid var(--line-2);background:transparent;color:var(--text);cursor:pointer;font-size:.88rem}
  .b:hover{border-color:var(--violet-lit)}
  .b--ok{background:var(--text);color:var(--void);border-color:transparent}
  .b--no{color:#F87171}
  .empty{color:var(--muted);font-size:.95rem;padding:18px 0}
  .login{max-width:360px;margin:12vh auto;display:grid;gap:14px}
  .login input{background:var(--input);border:1px solid var(--line);border-radius:12px;padding:13px 14px;width:100%}
  .msg{padding:12px 16px;border-radius:12px;margin-bottom:20px;font-size:.92rem}
  .msg--err{border:1px solid rgba(248,113,113,.4);color:#F87171}
  .msg--ok{border:1px solid rgba(34,197,94,.4);color:var(--green)}
  .msg--warn{border:1px solid rgba(250,204,21,.4);color:var(--amber)}
</style>
</head>
<body>
<div class="wrap">

<?php if (!$dentro): ?>
  <form class="login" method="post">
    <h1 style="font-family:var(--display);font-size:1.6rem">Reseñas de ZYRA</h1>
    <?php if ($error): ?><p class="msg msg--err"><?= e($error) ?></p><?php endif; ?>
    <input type="password" name="clave" placeholder="Contraseña" autofocus required autocomplete="current-password">
    <button class="b b--ok" type="submit">Entrar</button>
  </form>

<?php else: ?>
  <div class="head">
    <h1>Reseñas</h1>
    <a href="?salir=1">Salir</a>
  </div>

  <?php if ($claveDefecto): ?>
    <p class="msg msg--warn">Sigues con la contraseña de fábrica. Abre <strong>hash.php</strong>, genera una nueva y pégala en <strong>api/config.php</strong>.</p>
  <?php endif; ?>
  <?php if ($error): ?><p class="msg msg--err"><?= e($error) ?></p><?php endif; ?>
  <?php if ($aviso): ?><p class="msg msg--ok"><?= e($aviso) ?></p><?php endif; ?>

  <h2>En espera (<?= count($espera) ?>)</h2>
  <?php if (!$espera): ?>
    <p class="empty">Nada pendiente de revisar.</p>
  <?php else: foreach ($espera as $r) ficha($r, $_SESSION['csrf']); endif; ?>

  <h2>Publicadas (<?= count($publicadas) ?>)</h2>
  <?php if (!$publicadas): ?>
    <p class="empty">Todavía no hay ninguna reseña en la web.</p>
  <?php else: foreach ($publicadas as $r) ficha($r, $_SESSION['csrf']); endif; ?>
<?php endif; ?>

</div>
</body>
</html>
