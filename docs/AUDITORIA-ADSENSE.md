# Auditoría AdSense — digitalzyra.com

Fecha: 21/10/2026 · Rama: `claude/dazzling-dirac-l736hs`
Motivo del rechazo (captura de AdSense): **«Contenido de poco valor»**. Propiedad verificada.

> No hay aprobación garantizada: la decisión es de Google. Este informe separa lo **demostrado** (comprobado en los archivos) de lo **probable** (inferido) y de lo **pendiente** (requiere acceso que no tuve).

---

## 0. Alcance y limitaciones de la auditoría

| Fuente | Acceso | Uso |
|---|---|---|
| ZIP `digitalzyra.com.zip` (public_html + zyra-build) | Sí | Fuente principal: 47 páginas HTML, JS, CSS, PHP, `.htaccess`, sitemap |
| Sitio publicado `https://digitalzyra.com` | **No** — la red del entorno bloquea el dominio (curl: CONNECT 403; WebFetch: ENOTFOUND) | No he podido comprobar códigos HTTP reales, redirecciones en producción ni si el ZIP coincide al 100 % con lo publicado |
| support.google.com / developers.google.com | Solo por buscador (WebFetch bloqueado) | Contraste de políticas con los resúmenes del buscador y las URL oficiales citadas abajo |
| Search Console, AdSense, PageSpeed Insights | **No** | Pendiente: ver §D |

Para que yo pueda verificar el sitio en vivo en otra sesión, hay que añadir `digitalzyra.com` y `support.google.com` a los dominios permitidos del entorno (configuración de red del entorno cloud).

### Documentación oficial consultada
- Preparar las páginas para AdSense: https://support.google.com/adsense/answer/7299563 — contenido único, navegación clara, problemas con redirecciones, páginas en construcción.
- Motivos de no aprobación: https://support.google.com/adsense/answer/81904
- Qué hacer si el sitio no está listo: https://support.google.com/adsense/answer/12176698
- Contenido duplicado/valor: https://support.google.com/adsense/answer/10015918 — valor sustancial e información original frente a otros sitios del mismo tema; evitar páginas con poco contenido.
- Contenido útil centrado en las personas: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Contenido con IA: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content — el uso de IA no infringe por sí mismo; sí la producción masiva sin supervisión.
- Requisitos de consentimiento EEE/UK/Suiza: https://support.google.com/adsense/answer/13554116 — CMP certificada por Google e integrada con el TCF para anuncios personalizados.
- Guía de la comunidad de AdSense sobre «low value content» (no es política oficial, es orientación de expertos de producto): https://support.google.com/adsense/community-guide/241032356

**Qué es política y qué no.** Obligatorio: cumplir las Políticas del programa y para editores (contenido propio, no engañoso, sin infracciones), sitio navegable y terminado, y — para servir anuncios personalizados en el EEE — CMP certificada. **No existe** un mínimo oficial de artículos, palabras, visitas, antigüedad o backlinks. Todo lo demás de este informe son recomendaciones de calidad.

---

## A. Diagnóstico

### Inventario (47 HTML; 44 URL en el sitemap)

| Tipo | URL (ES) | Palabras | Contenido propio* | Valoración |
|---|---|---|---|---|
| Inicio | `/es-es/` | ~1.200 | 55 % | Mucho texto de agencia genérico; secciones repetidas en otras páginas |
| Servicios (índice) | `/es-es/servicios/` | ~260 | 54 % | Repite las 6 tarjetas de «puntos de partida» de la home |
| Servicio ×4 | `/es-es/servicios/*` | 360–410 | **32–34 %** | **Plantilla**: ~120 palabras propias; proceso y FAQ idénticos en las 4 |
| Cómo trabajamos | `/es-es/como-trabajamos/` | ~400 | 42 % | Repite el proceso y las listas de servicios |
| Proyectos | `/es-es/proyectos/` | ~700 | 99 % | Bueno: caso propio (ZyraBus) con problema, decisiones y límites |
| Sobre nosotros | `/es-es/sobre-nosotros/` | ~600 | 90 % | Correcto; cargos incoherentes (ver abajo) |
| Contacto | `/es-es/contacto/` | ~240 | 37 % | Correcto para su función |
| Guías ×5 + índice | `/es-es/guias/*` | 880–1.520 | 74–85 % | **Lo mejor del sitio**: fuentes oficiales, calculadora y checklist interactivos, autoría y fecha |
| Legales ×3 | `/es-es/legal/*` | 410–720 | 92–96 % | Bien redactados; faltan datos (ver §6) |
| EN / AR | `/en-en/*`, `/ar-ar/*` | similares | — | Traducciones de las páginas comerciales. **Sin guías propias** (enlazan a las españolas) |
| Raíz `/` | `index.html` | 13 | — | `noindex`; el servidor redirige 302 por cookie/idioma del navegador |

\* Porcentaje de secuencias de 6 palabras que no aparecen en ninguna otra página ES (script de comparación sobre el texto visible, excluyendo menú y pie).

### Hallazgos

| # | Hallazgo | Evidencia | Tipo | Confianza |
|---|---|---|---|---|
| 1 | **El sitio es, ante todo, un folleto comercial.** De 44 URL del sitemap, solo 5 son contenido editorial (guías, solo en ES); el resto son servicios, corporativas, legales y sus traducciones | sitemap.xml; inventario | Probable causa principal | Media |
| 2 | **Páginas de servicio de plantilla**: 4 páginas con la misma estructura, el mismo bloque de proceso y 2 de 4 FAQ idénticas; ~120 palabras propias cada una | Medición 32–34 % propio | Demostrado | Alta |
| 3 | **Texto genérico** que valdría para cualquier agencia («Visión a largo plazo», «Tecnología escalable», «Una sola agencia para toda tu tecnología», «Enfoque empresarial») | `es-es/index.html` | Demostrado | Alta |
| 4 | **Titular de reseñas que afirma clientes** («Reseñas de quienes ya trabajan con nosotros») en el HTML estático, mientras el sitio dice ser «una agencia nueva» y la sección se llena por JS (puede estar vacía) | `index.html` ES/EN/AR; `resenas.js` | Demostrado | Alta |
| 5 | **Reseñas que se publican sin moderación** («sale en esta página al momento») salvo que `RESENAS_REVISAR_ANTES` esté activado en `api/config.php` (no incluido en el ZIP). Cualquiera puede publicar una valoración | `api/resenas.php` l.104-106; `resenas.js` | Demostrado (riesgo de contenido de usuarios no moderado) | Alta; el valor real de la constante, pendiente |
| 6 | **Imagen engañosa**: `ipad-chatbot.webp` («Agente de IA respondiendo a un cliente») muestra la interfaz de ChatGPT, no un agente de ZYRA | Captura de la página de agentes | Demostrado | Alta |
| 7 | **EN/AR sin contenido editorial propio**. Si el rastreador entra por la raíz con un idioma que no es español, el servidor le manda a `/en-en/` o `/ar-ar/`, donde no hay guías | `.htaccess` §5 | Probable | Baja-media (depende de qué cabecera envíe el rastreador) |
| 8 | **La raíz `/` es una redirección 302** dependiente de cookie/idioma. La guía oficial cita las redirecciones como problema de navegación | `.htaccess` | Probable factor menor | Baja |
| 9 | **No hay código de AdSense** (`adsbygoogle.js`) ni meta `google-adsense-account` en ninguna página; solo `ads.txt` y una etiqueta de **Google Ads** (`AW-18455095579`) para campañas propias | grep en todo `public_html` | Demostrado. No impide la revisión (la propiedad está verificada) | Alta |
| 10 | **Consentimiento**: banner propio (no CMP certificada por Google ni TCF). Para anuncios personalizados en el EEE es obligatorio una CMP certificada | `cookies.js`; doc. 13554116 | Demostrado. Condición para servir anuncios, no causa del rechazo | Alta |
| 11 | **CSP sin dominios de anuncios en `frame-src`** (`googleads.g.doubleclick.net`, `tpc.googlesyndication.com`, `fundingchoicesmessages.google.com`…): si se aprueba, los iframes de anuncios y la CMP de Google quedarían bloqueados | `.htaccess` §8 | Demostrado | Alta |
| 12 | **Generador desfasado**: `zyra-build/` (v32, sin guías ni proyectos) ya no corresponde a `public_html` (v47). Ejecutar `build.py` sobrescribiría el sitio y borraría guías y cambios | `config.py`, `build.py` | Demostrado | Alta |
| 13 | Cargos incoherentes del equipo: «Owner», «Co-Owner» y «CEO» para tres fundadores que, según el aviso legal, son cotitulares a partes iguales | `sobre-nosotros`, `zyra.js` | Demostrado (confianza/transparencia) | Alta |
| 14 | Contacto con Gmail (`zyradigitalpersonal@gmail.com`) en lugar de un buzón del dominio | todas las páginas | Recomendación de confianza | — |
| 15 | Accesibilidad: `<dt>/<dd>` sin `<dl>`; botón de idioma cuyo nombre accesible no contiene el texto visible («ES») | Lighthouse | Demostrado | Alta |

### Causas del rechazo
- **Demostradas** (defectos de calidad que existen y casan con «contenido de poco valor»): #2, #3, #4, #6.
- **Probables**: #1 (dominio comercial del sitio frente a contenido editorial), #7, #8.
- **No son causa** pero bloquearían la monetización: #9, #10, #11.

**Conclusión honesta.** El sitio no es un sitio vacío ni de baja calidad técnica: las guías y el caso ZyraBus son buen contenido. Pero su propósito principal es captar clientes para la agencia, y la mayoría de sus URL son páginas comerciales. Es una situación en la que AdSense rechaza con frecuencia, y ningún retoque técnico la cambia por sí solo.

---

## B. Plan de acción

### Críticos (antes de volver a solicitar revisión)
1. **Decidir la estrategia** (ver §F). Si se mantiene AdSense, el contenido editorial tiene que pesar mucho más.
2. **Moderar las reseñas**: `define('RESENAS_REVISAR_ANTES', true);` en `api/config.php` y cambiar el texto «sale al momento» de `resenas.js`.
3. **Sustituir `ipad-chatbot.webp`** por una captura real de un agente de ZYRA (el asistente «Pregúntame» del propio sitio sirve) o retirarla.
4. **Desplegar los cambios de esta rama** (lista en §C).

### Importantes
5. Reescribir las 4 páginas de servicio en **árabe** (las ES y EN ya están hechas) o decidir si la versión árabe debe seguir indexándose.
6. Reducir duplicados restantes: las 6 tarjetas «Elige un punto de partida» (home y `/servicios/`) y el proceso genérico en home y `/como-trabajamos/`.
7. Unificar cargos del equipo y añadir **NIF** de los titulares al aviso legal (art. 10 LSSI).
8. Buzón con dominio propio (ej. `hola@digitalzyra.com`).
9. No volver a ejecutar `zyra-build/build.py` sin actualizar antes `src/` desde `public_html`.

### Si se aprueba AdSense (antes de poner anuncios)
10. Activar una **CMP certificada** (la de AdSense en «Privacidad y mensajes» es gratuita) y retirar o adaptar el banner propio para no tener dos banners.
11. Añadir a la CSP (`frame-src`, `script-src`, `img-src`, `connect-src`) los dominios que necesitan AdSense y la CMP; probar en staging.
12. No colocar anuncios en páginas de servicio, contacto ni legales; solo en guías.

### Opcionales
13. Botón de idioma: incluir el texto visible en el `aria-label` (p. ej. «ES — Cambiar idioma»).
14. Página de autor para las guías (quién del equipo escribe cada una y su experiencia).

---

## C. Cambios realizados

Commits en la rama `claude/dazzling-dirac-l736hs`:
1. `Importar el sitio publicado…` — copia sin tocar del ZIP (copia de seguridad y base del diff).
2. `Ampliar páginas de servicio y quitar texto genérico…` — los cambios siguientes.

| Archivo(s) | Cambio | Motivo |
|---|---|---|
| `es-es/servicios/{desarrollo-web,software-a-medida,automatizacion,agentes-de-ia}/index.html` | Nueva sección de detalle: problema que resuelve, tipos/criterios (tabla), alcance «qué entra y qué no», qué aporta el cliente, cómo se mide, límites, ejemplo comprobable (esta web, ZyraBus). Pasos del proceso propios de cada servicio. FAQ específicas (sin las 2 genéricas repetidas). JSON-LD FAQPage regenerado con el texto visible; `dateModified` | Hallazgo #2. Contenido propio: 32–34 % → 85–91 %; ~400 → ~1.050–1.200 palabras |
| `en-en/services/{web-development,custom-software,automation,ai-agents}/index.html` | Lo mismo en inglés; los enlaces a guías indican «(in Spanish)» | #2 y coherencia entre idiomas |
| `es-es/index.html`, `en-en/index.html` | «Por qué nosotros»: 4 afirmaciones comprobables (trabajo publicado, guías, cuentas a nombre del cliente, sin promesas imposibles) | #3 |
| `es-es/index.html`, `en-en/index.html`, `ar-ar/index.html` | Titular estático de reseñas neutro («Reseñas»). `resenas.js` sigue mostrando el titular completo solo si hay reseñas | #4 |
| 15 páginas con ficha `.facts` (servicios y sobre nosotros, 3 idiomas) | `<dt>/<dd>` dentro de `<dl>` con el mismo espaciado | #15 |
| `sitemap.xml` | `lastmod` 2026-10-21 en las 11 URL modificadas | Señal de actualización real |

**No he añadido, eliminado ni fusionado páginas.** No he inventado precios, clientes, métricas, testimonios ni autores. No he tocado secretos, `api/`, `.htaccess` ni scripts de terceros.

**Afirmaciones nuevas que el propietario debe confirmar** (describen cómo trabajáis; si alguna no es cierta, hay que cambiarla antes de publicar):
- Web: que se repasa la checklist de 25 puntos y PageSpeed Insights antes de publicar; alta en Search Console; que preparáis las páginas legales con los datos del cliente; criterio WordPress vs. web programada.
- Software: que servidor y servicios de terceros los paga el cliente; que la migración de datos se presupuesta aparte; mantenimiento como plan aparte sin permanencia.
- Automatización: que las cuentas de Zapier/Make/n8n se crean a nombre del cliente; prueba en paralelo 1–2 semanas.
- Agentes: que el agente se identifica como IA al inicio; revisión periódica de conversaciones; que ofrecéis agentes de voz (la página ya lo decía, pero no hay ejemplo).

---

## D. Validación

| Prueba | Tipo | Resultado |
|---|---|---|
| Enlaces internos (`href`/`src`) en 47 páginas | Ejecutada (script) | 0 rotos |
| Estructura HTML (etiquetas sin cerrar o sobrantes) | Ejecutada (script) | 0 errores |
| JSON-LD (parseo de todos los bloques) | Ejecutada | Todos válidos |
| `sitemap.xml` | Ejecutada (parser XML) | Válido |
| Lighthouse móvil, servidor local — home | Ejecutada | Accesibilidad 95 · Buenas prácticas 96 · SEO 100 |
| Lighthouse — `/servicios/agentes-de-ia/` tras cambios | Ejecutada | Accesibilidad 100 · SEO 100 |
| Lighthouse — guía de automatización | Ejecutada | Accesibilidad 100 · SEO 100 |
| Capturas escritorio (1366 px) y móvil (390 px) | Ejecutada (Chromium) | Sin desbordamiento horizontal; tablas con scroll horizontal en móvil, igual que en las guías |
| Compilación | No aplica | Sitio estático; no hay build activo (ver hallazgo #12) |

**Errores que permanecen**
- `errors-in-console` en Lighthouse: en este entorno no cargan GSAP/Lenis (jsDelivr bloqueado). Hay que comprobarlo en producción.
- Contraste en la home: lo detecta sobre texto a mitad de animación (por faltar GSAP); probablemente transitorio. Revisar en producción.
- `label-content-name-mismatch` del botón de idioma (opcional #13). `aria-allowed-role` y `heading-order` en la home (preexistentes, menores).
- Rendimiento / Core Web Vitals: **no medidos** (sin acceso a PageSpeed Insights ni al sitio real).

**Requieren acceso a cuentas externas**
- Search Console: páginas indexadas, cobertura, sitemap leído, problemas de experiencia en la página.
- AdSense: estado real y fecha del último rechazo.
- PageSpeed Insights sobre producción.
- Hostinger: valor de `RESENAS_REVISAR_ANTES`, reseñas publicadas, despliegue de los archivos.

---

## E. Lista final de revisión

| Criterio | Estado | Evidencia |
|---|---|---|
| Contenido original y útil | ⚠️ Mejorado, no suficiente por sí solo | Guías y proyecto buenos; servicios ES/EN reescritos; sitio mayoritariamente comercial |
| Navegación | ✅ Menú claro y completo | Inspección del HTML |
| Información corporativa | ⚠️ | Equipo con nombres y portfolios; cargos incoherentes; Gmail |
| Páginas legales | ⚠️ | Completas y coherentes con lo implementado; falta NIF; revisión jurídica recomendada |
| Consentimiento | ❌ para anuncios | Banner propio con Consent Mode v2; sin CMP certificada |
| Enlaces y formularios | ✅ enlaces · ⏳ formularios | Enlaces comprobados; envío de formularios no probado (PHP en servidor) |
| Accesibilidad | ✅ (95–100) | Lighthouse local |
| Rendimiento | ⏳ | Sin medir |
| Rastreo e indexación | ⏳ | `robots.txt` y sitemap correctos; indexación real sin comprobar |
| Estado de AdSense | ❌ Rechazado («contenido de poco valor») | Captura del propietario |

---

## F. Decisión recomendada

**No solicitar la revisión todavía.** Y, sobre todo, **reconsiderar si AdSense tiene sentido en este sitio**:

1. **El modelo de negocio no genera suficiente contenido editorial.** El sitio existe para que una empresa contrate a ZYRA. AdSense busca sitios cuyo valor principal sea el contenido para el lector. Con 5 guías frente a ~40 páginas comerciales, el sitio sigue pareciendo lo que es: la web de una agencia.
2. **Los anuncios perjudicarían al negocio principal.** Ya pagáis Google Ads para atraer clientes; en la misma web, AdSense mostraría anuncios de otras agencias y plataformas a esos clientes. Con el tráfico de una agencia nueva, los ingresos serían muy bajos frente al coste en credibilidad.

**Alternativa recomendada:** retirar la solicitud de AdSense en `digitalzyra.com` y usar las guías como lo que ya son: el mejor argumento comercial del sitio. Medir contactos que llegan desde las guías.

**Si aun así queréis monetizar contenido**, la vía viable es un proyecto editorial propiamente dicho, por ejemplo uno construido alrededor de ZyraBus (movilidad en Tenerife), que tiene usuarios, datos y un público distinto al de la agencia, o una sección de guías con publicación sostenida durante meses y aportaciones que solo vosotros podéis hacer (pruebas, capturas, cálculos y código reales). Solo entonces, con CMP certificada y CSP ajustada, tendría sentido volver a solicitar.

### Preguntas para el propietario
1. ¿El objetivo principal es captar clientes o generar ingresos por publicidad? (Cambia toda la estrategia.)
2. ¿ZYRA está constituida o se constituirá como sociedad? NIF/razón social para el aviso legal.
3. ¿Cargos reales de cada fundador?
4. ¿Hay clientes reales (aunque sea uno) que acepten aparecer como caso de estudio, con capturas y resultados verificables?
5. ¿Habéis implantado ya algún agente de IA o de voz para un negocio? Si es así, ¿qué se puede contar? Si no, conviene matizar «incluidos agentes de voz».
6. ¿Quién es el propietario del código en software a medida?
7. ¿Hay rangos de precio orientativos que queráis publicar?
8. ¿Valor actual de `RESENAS_REVISAR_ANTES` y cuántas reseñas hay publicadas?
9. ¿Hay que mantener la versión árabe? ¿Quién la revisa?
10. ¿Confirmáis las afirmaciones nuevas listadas en §C?

### Despliegue
Los cambios están solo en el repositorio. Para publicarlos, hay que subir a Hostinger los 19 archivos modificados de `public_html/` (`git diff --name-only c83169c HEAD`). No he desplegado nada ni he solicitado ninguna revisión en AdSense.

---

## Segunda ronda — implementación completa (21/10/2026)

A petición del propietario se ha aplicado todo el plan de acción posible sin datos externos. Resumen:

### Contenido (lo principal)
- **5 guías nuevas** en `es-es/guias/` (10 en total), escritas con información verificable y enlaces a la documentación oficial de cada herramienta:
  - *Make, Zapier o n8n: cómo elegir herramienta para automatizar* (comparativa con criterios y un caso resuelto en las tres).
  - *Tutorial: del formulario de tu web a Google Sheets y un aviso al equipo, con Make* (paso a paso, con código PHP para reenviar el formulario desde el servidor y gestión de errores).
  - *Llamadas perdidas en un negocio local: qué puede atender un agente de voz y qué no* (cómo funciona, ejemplo de clínica dental, RGPD y Reglamento de IA).
  - *WhatsApp Business para negocios: app, API y qué necesitas para un chatbot* (ventana de 24 h, plantillas, normas de Meta sobre IA de 2026).
  - *Una web que funciona sin conexión: lo que aprendimos haciendo ZyraBus* (PWA, service worker, iPhone, datos abiertos).
- Índice de guías, «Sigue leyendo» de todas las guías, portada (6 guías destacadas) y páginas de servicio enlazadas con las guías nuevas.
- **Páginas de servicio en árabe reescritas** (ya estaban ES y EN).
- **Bloque «Herramientas que usamos»** en las 12 páginas de servicio, con enlaces oficiales: Make, Zapier, n8n, OpenAI, Anthropic, WhatsApp Business Platform, Twilio, Google Sheets, Slack, Figma, React, Next.js, WordPress, Search Console, PageSpeed, Node.js, PHP, Python, MySQL, PostgreSQL. Sin afiliación.
- Pilares genéricos de la portada sustituidos por compromisos concretos («Primero el problema», «Pruebas con datos reales», «Documentado para que no dependas»).
- Eliminado de la portada el bloque «Elige un punto de partida», que repetía `/servicios/`.
- Corrección factual: n8n no es «código abierto» en sentido estricto, sino *fair-code* (lo dice su propia documentación).

### Diseño
- Páginas de servicio con **índice lateral** («En esta página»), igual que las guías.
- Estilos nuevos para bloques de código y para la lista de herramientas externas (↗).
- Corregido un desbordamiento horizontal en móvil de tablas y código dentro de las guías.
- **Imagen con la interfaz de ChatGPT sustituida** por capturas reales del asistente del propio sitio (ES/EN/AR).
- **Maqueta de «Automator» (macOS) sustituida** por un diagrama del flujo real del tutorial (ES/EN/AR).
- Título «Todas las guías» en el índice de guías.

### Confianza y transparencia
- Cargos unificados como **cofundadores** (página Sobre nosotros y asistente, 3 idiomas), coherente con el aviso legal.
- **Reseñas siempre moderadas**: `api/resenas.php` fuerza la revisión previa; textos del formulario actualizados (ES/EN/AR).

### AdSense y técnica
- Meta `google-adsense-account` (ca-pub-9293246097390358) en las 52 páginas públicas.
- `assets/js/gtag.js`: AdSense se carga **solo en las guías y solo tras aceptar marketing**, igual que la etiqueta de Google Ads. Servicios, contacto y legales nunca cargan anuncios.
- CSP del `.htaccess` ampliada con los dominios de AdSense y del mensaje de consentimiento de Google (Funding Choices).
- Política de privacidad (3 idiomas): indica que los anuncios solo aparecen en las guías.
- Accesibilidad: nombre accesible del botón de idioma, orden de encabezados en portada e índice, rol incorrecto en formularios, cabeceras de tabla vacías.
- Versión de caché `?v=48` en todas las páginas; `lastmod` del sitemap actualizado (50 URL en el sitemap).
- `zyra-build/LEEME-NO-EJECUTAR.md`: aviso de que el generador está desfasado.

### Validación (segunda ronda)
- 52 páginas: 0 enlaces internos rotos, 0 anclas rotas, 0 ids duplicados, 0 errores de estructura HTML, 50 bloques JSON-LD válidos, sitemap XML válido.
- Lighthouse móvil (local): accesibilidad 98–100 en guías, servicios y sobre nosotros; 95 en portada (queda el contraste del texto animado del manifiesto, que Lighthouse mide a mitad de animación). SEO 100 en todas.
- Capturas en 1366 px y 390 px sin desbordamiento horizontal.
- Sin errores de JavaScript propios (solo fallan los CDN, bloqueados en este entorno).
- Enlaces externos: no se pueden abrir desde el entorno; los más específicos se han comprobado por búsqueda (Make webhooks y reintentos, Zapier tareas, n8n licencia, OpenAI Realtime, precios de Meta).

### Lo que sigue dependiendo del propietario (no se puede hacer desde el código)
1. **Mensaje de consentimiento certificado**: en AdSense → *Privacidad y mensajes* → crear el mensaje de normativa europea (CMP de Google). Sin él, en el EEE solo se servirán anuncios limitados/no personalizados. Si se activa, revisar `cookies.js` para no mostrar dos banners.
2. **Anuncios automáticos**: si se activan, excluir en AdSense las URL que no son `/es-es/guias/` (el código ya solo se carga en guías).
3. NIF y razón social en el aviso legal; buzón con dominio propio.
4. Confirmar las afirmaciones sobre la forma de trabajar listadas en §C y la mención a Twilio como proveedor de telefonía.
5. Revisión por un hablante nativo del árabe de las páginas reescritas.
6. Seguir publicando guías con regularidad (no hay mínimo oficial, pero el peso del contenido editorial frente al comercial sigue siendo la clave).

**Decisión recomendada, actualizada:** con 10 guías propias, servicios sin plantilla y los problemas de confianza corregidos, el sitio está en condiciones razonables para **solicitar la revisión** una vez desplegado y con el mensaje de consentimiento creado en AdSense. La aprobación no está garantizada: si vuelve a rechazarse por «contenido de poco valor», la causa restante sería el peso comercial del sitio, y la alternativa sigue siendo un proyecto editorial separado.
