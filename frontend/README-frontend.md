# PocketPal — Frontend

Interfaz web de PocketPal Finance. SPA vanilla (HTML + CSS + JS) con soporte PWA para instalación en móvil.

---

## Stack

| Tecnología                         | Uso                    |
|------------------------------------|------------------------|
| HTML5 + CSS3 + JavaScript (ES2020) | Interfaz               |
| Chart.js (CDN)                     | Gráficas del dashboard |
| Service Worker + Web App Manifest  | PWA (instalable)       |
| Google Fonts — Sora                | Tipografía             |

Sin frameworks ni bundlers. Se puede servir con cualquier servidor estático.

---

## Páginas

| Archivo           | Descripción          |
|-------------------|----------------------|
| `index.html`      | Login / Registro     |
| `dashboard.html`  | Panel principal      |
| `ai.html`         | Chat con agente POKI |

---

## Estructura de JavaScript

```
js/
├── api.js                  # Cliente HTTP + helpers de auth + fmt + toast
├── dashboard.js            # Orquestador del dashboard
├── script.js               # Sidebar móvil
├── pwa.js                  # Registro del Service Worker + banner de instalación
├── modules/
│   ├── ui.js               # Helpers de DOM compartidos (modales, botones, selects)
│   ├── charts.js           # Gráficas con Chart.js
│   ├── txModule.js         # CRUD de transacciones + paginación
│   ├── goalsModule.js      # CRUD de metas + aportes
│   └── categoriesModule.js # CRUD de categorías personalizadas
└── pages/
    ├── login.js            # Lógica de login/registro/OAuth
    └── ai.js               # Lógica del chat con POKI
```

### Carga de scripts en cada página

El orden importa. `api.js` se carga primero porque expone las funciones globales que usan los módulos:

**dashboard.html:**
```
api.js → ui.js → charts.js → txModule.js → goalsModule.js → categoriesModule.js → dashboard.js → script.js → pwa.js
```

**index.html:** `api.js → login.js → pwa.js`

**ai.html:** `api.js → ai.js → pwa.js`

---

## Módulo api.js

Expone como variables globales:

| Variable                | Descripción                                   |
|-------------------------|-----------------------------------------------|
| `auth`                  | register, login, logout, me                   |
| `transactions`          | list, get, create, update, delete             |
| `categories`            | list, create, update, delete                  |
| `goals`                 | list, get, create, update, delete, contribute |
| `summary`               | get, goals                                    |
| `ai`                    | chat, history, clearHistory                   |
| `fmt`                   | currency, date, datetime, truncate            |
| `toast`                 | success, error, info                          |  
| `saveAuth(token, user)` | Persiste en localStorage                      |
| `clearAuth()`           | Limpia localStorage                           |
| `getToken()`            | Token JWT guardado                            |
| `getUser()`             | Objeto usuario guardado                       |
| `isLoggedIn()`          | true si hay token                             |
| `requireAuth()`         | Redirige al login si no hay sesión            |

---

## Autenticación

El token JWT se guarda en `localStorage`. En cada petición `apiFetch()` lo incluye automáticamente en el header `Authorization: Bearer <token>`. Si el servidor responde 401, `apiFetch()` limpia la sesión y redirige a `index.html`.

Para el flujo OAuth de Google, el backend redirige a `dashboard.html?token=...&name=...&email=...&avatar=...`. El script en `dashboard.js` captura estos parámetros, los persiste y limpia la URL con `history.replaceState()`.

---

## PWA

El `manifest.json` y `sw.js` permiten instalar PocketPal como app nativa en Android/iOS.

El Service Worker usa dos estrategias de caché:
- **Network First** para `/api/*` — siempre datos frescos, caché como fallback offline.
- **Cache First** para assets estáticos — carga instantánea.

---

## Configuración de la API

La URL del backend se configura en `js/api.js`:

```javascript
const API_BASE = "https://pocketpal-6ydq.onrender.com/api";
```

Para desarrollo local, cambiar por `http://localhost:3000/api`.

---

## Gráficas (charts.js)

El dashboard renderiza tres gráficas con Chart.js:

1. **Barras** — Ingresos vs. Gastos por mes.
2. **Dona** — Distribución de gastos por categoría.
3. **Línea** — Balance acumulado mes a mes.

Cada re-render destruye la instancia anterior para evitar memory leaks.

---

## Paginación de transacciones

El módulo `txModule.js` implementa paginación server-side (10 registros por página por defecto). Los filtros activos (tipo, categoría, rango de fechas) se envían como query params en cada cambio de página.
