<?php
/* Genera el hash de una contraseña nueva para api/config.php */
$hash = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !empty($_POST['clave'])) {
    $hash = password_hash((string) $_POST['clave'], PASSWORD_DEFAULT);
}
?>
<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Contraseña — ZYRA</title>
<link rel="stylesheet" href="../assets/css/zyra.css?v=27">
<style>
  body{padding:10vh clamp(20px,5vw,40px)}
  .wrap{max-width:560px;margin:0 auto;display:grid;gap:16px}
  h1{font-family:var(--display);font-size:1.6rem}
  p{color:var(--muted);font-size:.94rem}
  input{background:var(--input);border:1px solid var(--line);border-radius:12px;padding:13px 14px;width:100%}
  button{padding:11px 20px;border-radius:99px;border:0;background:var(--text);color:var(--void);cursor:pointer;justify-self:start}
  code{display:block;padding:16px;border:1px solid var(--line-2);border-radius:12px;font-family:var(--mono);font-size:.82rem;word-break:break-all;color:var(--violet-lit)}
</style>
</head>
<body>
<div class="wrap">
  <h1>Contraseña del panel</h1>
  <p>Escribe la contraseña que quieras usar. Copia la línea que salga y pégala en <strong>api/config.php</strong>, sustituyendo la que hay en <strong>ADMIN_PASS_HASH</strong>.</p>
  <form method="post" style="display:grid;gap:14px">
    <input type="text" name="clave" placeholder="Contraseña nueva" autofocus required>
    <button type="submit">Generar</button>
  </form>
  <?php if ($hash): ?>
    <code>const ADMIN_PASS_HASH = '<?= htmlspecialchars($hash, ENT_QUOTES, 'UTF-8') ?>';</code>
    <p>Cuando la hayas pegado, borra este archivo del hosting: ya no hace falta.</p>
  <?php endif; ?>
</div>
</body>
</html>
