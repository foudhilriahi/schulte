(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-bold tracking-[0.01em] transition-[transform,background-color,border-color,box-shadow,color] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--violet-l)]", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(91,79,232,0.30)] hover:-translate-y-px hover:bg-[var(--violet-h)] hover:shadow-[0_6px_20px_rgba(91,79,232,0.38)] active:scale-[0.96]',
            destructive: 'bg-errl border-[1.5px] border-[var(--err-b)] text-err hover:bg-errl active:scale-[0.96]',
            outline: 'border-[1.5px] border-border bg-card text-ink2 hover:border-border2 hover:bg-card2 active:scale-[0.96]',
            secondary: 'border-[1.5px] border-border bg-card text-ink2 hover:border-border2 hover:bg-card2 active:scale-[0.96]',
            ghost: 'bg-transparent text-ink3 hover:bg-card2 hover:text-ink active:scale-[0.96]',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button(param) {
    let { className, variant, size, asChild = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input(param) {
    let { className, type, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-ink placeholder:text-ink4 selection:bg-primary selection:text-primary-foreground border-[1.5px] border-input h-10 w-full min-w-0 rounded-md bg-card px-3.5 py-2 text-[13px] text-ink transition-[border-color,box-shadow,color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50', 'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--violet-l)]', 'aria-invalid:ring-[var(--err-b)] aria-invalid:border-err', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Label(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Service de stockage prêt pour la production
 * Gère localStorage avec gestion d'erreurs, validation et repli
 */ __turbopack_context__.s([
    "STORAGE_KEYS",
    ()=>STORAGE_KEYS,
    "storage",
    ()=>storage
]);
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'candidate_access_token',
    LEGACY_ACCESS_TOKEN: 'accessToken',
    USER_CVS: 'user_cvs',
    LEGACY_CV_DRAFT: 'latest_cv_draft'
};
class StorageService {
    /**
   * Récupère une valeur localStorage de manière sûre
   */ getItem(key) {
        let defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            // Tente un parsing JSON
            try {
                return JSON.parse(item);
            } catch (e) {
                // Retourne en chaîne si ce n'est pas du JSON
                return item;
            }
        } catch (error) {
            console.error("Erreur de lecture localStorage (".concat(key, ") :"), error);
            return defaultValue;
        }
    }
    /**
   * Enregistre une valeur localStorage de manière sûre
   */ setItem(key, value) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            console.error("Erreur d'écriture localStorage (".concat(key, ") :"), error);
            // Vérifie si le quota est dépassé
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('Quota localStorage dépassé. Nettoyage des anciennes données...');
                this.clearOldData();
                // Réessaie après nettoyage
                try {
                    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                    localStorage.setItem(key, stringValue);
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
    }
    /**
   * Supprime une valeur localStorage
   */ removeItem(key) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Erreur de suppression localStorage (".concat(key, ") :"), error);
        }
    }
    /**
   * Efface toutes les données de l'application
   */ clear() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Erreur lors du nettoyage de localStorage :', error);
        }
    }
    /**
   * Supprime les anciennes données inutilisées pour libérer de l'espace
   */ clearOldData() {
        // Supprime les anciennes clés
        this.removeItem(STORAGE_KEYS.LEGACY_CV_DRAFT);
    // Peut accueillir d'autres règles de nettoyage
    }
    /**
   * Retourne la taille du stockage en octets
   */ getStorageSize() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        let total = 0;
        try {
            for(const key in localStorage){
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
        } catch (error) {
            console.error('Erreur lors du calcul de la taille du stockage :', error);
        }
        return total;
    }
    /**
   * Vérifie si le stockage est disponible
   */ isAvailable() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}
const storage = new StorageService();
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/runtime-cache.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearUserRuntimeCaches",
    ()=>clearUserRuntimeCaches
]);
const USER_RUNTIME_CACHE_NAMES = [
    'apis',
    'pages',
    'pages-rsc',
    'pages-rsc-prefetch',
    'start-url',
    'cross-origin',
    'candidate-upload-assets'
];
const shouldClearCache = (cacheName)=>USER_RUNTIME_CACHE_NAMES.some((name)=>cacheName === name || cacheName.startsWith("".concat(name, "-")));
async function clearUserRuntimeCaches() {
    if ("object" === 'undefined' || !('caches' in window)) return;
    try {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.filter(shouldClearCache).map((cacheName)=>window.caches.delete(cacheName)));
    } catch (error) {
        console.warn('Unable to clear user runtime caches:', error);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/axios.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/runtime-cache.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/network-activity.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/route-activity.ts [app-client] (ecmascript)");
;
;
;
;
;
// Get base URL from env or use default fallback for local dev
const baseURL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
const LOADER_SKIP_HEADER = 'x-skip-global-loader';
const startRequestLoader = (config)=>{
    var _config_headers;
    const headers = (_config_headers = config.headers) !== null && _config_headers !== void 0 ? _config_headers : {};
    var _headers_LOADER_SKIP_HEADER;
    const rawSkipValue = (_headers_LOADER_SKIP_HEADER = headers[LOADER_SKIP_HEADER]) !== null && _headers_LOADER_SKIP_HEADER !== void 0 ? _headers_LOADER_SKIP_HEADER : headers[LOADER_SKIP_HEADER.toUpperCase()];
    const shouldSkip = rawSkipValue === '1' || rawSkipValue === 1 || rawSkipValue === true;
    if (headers[LOADER_SKIP_HEADER] !== undefined) delete headers[LOADER_SKIP_HEADER];
    if (headers[LOADER_SKIP_HEADER.toUpperCase()] !== undefined) delete headers[LOADER_SKIP_HEADER.toUpperCase()];
    config.headers = headers;
    config.__globalLoaderTracked = !shouldSkip;
    if (!shouldSkip) {
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().begin();
    }
};
const stopRequestLoader = (config)=>{
    if (config === null || config === void 0 ? void 0 : config.__globalLoaderTracked) {
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().end();
    }
};
// Request interceptor: attach Access Token if present
api.interceptors.request.use((config)=>{
    startRequestLoader(config);
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
    if (token && config.headers) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
});
// Response interceptor: handle 401 Unauthorized by attempting to refresh token
api.interceptors.response.use((response)=>{
    var _this;
    stopRequestLoader((_this = response) === null || _this === void 0 ? void 0 : _this.config);
    return response;
}, async (error)=>{
    var _error_response;
    const originalRequest = error.config;
    const status = (_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.status;
    stopRequestLoader(originalRequest);
    if (status === 403) {
        // Role/session mismatch: clear candidate tab token and force clean login.
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetRouteTransitions"])();
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().reset();
        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
        originalRequest._retry = true;
        try {
            // Attempt to refresh the token using httpOnly cookie via the endpoint
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(baseURL, "/auth/refresh"), {}, {
                withCredentials: true
            });
            const newAccessToken = res.data.accessToken;
            // Save the new token using storage service
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, newAccessToken);
            // Update header and retry original request
            originalRequest.headers.Authorization = "Bearer ".concat(newAccessToken);
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh token failed or expired, force logout pipeline
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetRouteTransitions"])();
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().reset();
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = '/login'; // Redirect to login
            }
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/notifications.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotificationStore",
    ()=>useNotificationStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
;
;
const STATUS_LABELS = {
    reviewing: "Candidature en cours d'examen",
    interview: 'Entretien planifie',
    accepted: 'Candidature acceptee',
    rejected: 'Candidature non retenue'
};
const DEFAULT_TITLE_BY_TYPE = {
    success: 'Mise a jour positive',
    warning: 'Mise a jour importante',
    info: 'Notification'
};
const asObject = (value)=>value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const pickString = function() {
    for(var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++){
        values[_key] = arguments[_key];
    }
    for (const value of values){
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
};
const normalizeNotification = (raw)=>{
    var _pickString;
    const payload = asObject(raw.payload);
    const status = (_pickString = pickString(payload.status)) === null || _pickString === void 0 ? void 0 : _pickString.toLowerCase();
    const offerTitle = pickString(payload.offerTitle);
    const statusTitle = status ? STATUS_LABELS[status] : null;
    var _raw_type, _ref;
    const fallbackTitle = (_ref = statusTitle !== null && statusTitle !== void 0 ? statusTitle : DEFAULT_TITLE_BY_TYPE[(_raw_type = raw.type) !== null && _raw_type !== void 0 ? _raw_type : 'info']) !== null && _ref !== void 0 ? _ref : 'Notification';
    var _pickString1;
    const title = (_pickString1 = pickString(raw.title, payload.title, fallbackTitle)) !== null && _pickString1 !== void 0 ? _pickString1 : fallbackTitle;
    const fallbackMessage = offerTitle ? "".concat(statusTitle !== null && statusTitle !== void 0 ? statusTitle : 'Mise a jour', " pour le poste ").concat(offerTitle, ".") : statusTitle ? "Le statut de votre candidature est passe a: ".concat(statusTitle, ".") : 'Une nouvelle mise a jour est disponible.';
    var _pickString2;
    const message = (_pickString2 = pickString(raw.message, payload.message, fallbackMessage)) !== null && _pickString2 !== void 0 ? _pickString2 : fallbackMessage;
    var _pickString3;
    const link = (_pickString3 = pickString(raw.link, payload.link)) !== null && _pickString3 !== void 0 ? _pickString3 : undefined;
    const read = typeof raw.read === 'boolean' ? raw.read : !!raw.readAt;
    var _pickString4;
    return {
        id: raw.id,
        title,
        message,
        type: (_pickString4 = pickString(raw.type, payload.type)) !== null && _pickString4 !== void 0 ? _pickString4 : 'info',
        read,
        link,
        createdAt: raw.createdAt
    };
};
const useNotificationStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        lastFetchedAt: null,
        fetchNotifications: async ()=>{
            const { lastFetchedAt, notifications } = get();
            const now = Date.now();
            if (lastFetchedAt && now - lastFetchedAt < 15 * 1000 && notifications.length > 0) {
                return;
            }
            set({
                isLoading: true
            });
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get('/notifications');
                const rawNotifications = Array.isArray(res.data) ? res.data : [];
                const notifications = rawNotifications.map(normalizeNotification);
                const unreadCount = notifications.filter((n)=>!n.read).length;
                set({
                    notifications,
                    unreadCount,
                    lastFetchedAt: now
                });
            } catch (e) {
            // fail silently
            } finally{
                set({
                    isLoading: false
                });
            }
        },
        fetchUnreadCount: async ()=>{
            const { lastFetchedAt } = get();
            if (lastFetchedAt && Date.now() - lastFetchedAt < 15 * 1000) {
                return;
            }
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get('/notifications/unread-count');
                set({
                    unreadCount: res.data.count,
                    lastFetchedAt: Date.now()
                });
            } catch (e) {
            // fail silently
            }
        },
        markAllRead: async ()=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].patch('/notifications/mark-all-read');
                set((state)=>({
                        notifications: state.notifications.map((n)=>({
                                ...n,
                                read: true
                            })),
                        unreadCount: 0
                    }));
            } catch (e) {
            // fail silently
            }
        },
        markOneRead: async (id)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].patch("/notifications/".concat(id, "/read"));
                set((state)=>{
                    const notifications = state.notifications.map((n)=>n.id === id ? {
                            ...n,
                            read: true
                        } : n);
                    const wasUnread = state.notifications.find((n)=>n.id === id && !n.read);
                    const unreadCount = wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount;
                    return {
                        notifications,
                        unreadCount
                    };
                });
            } catch (e) {
            // fail silently
            }
        },
        deleteNotification: async (id)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].delete("/notifications/".concat(id));
                set((state)=>{
                    const target = state.notifications.find((n)=>n.id === id);
                    const unreadCount = target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount;
                    return {
                        notifications: state.notifications.filter((n)=>n.id !== id),
                        unreadCount
                    };
                });
            } catch (e) {
            // fail silently
            }
        },
        addNotification: (n)=>{
            const normalized = normalizeNotification(n);
            set((state)=>({
                    notifications: [
                        normalized,
                        ...state.notifications
                    ],
                    unreadCount: normalized.read ? state.unreadCount : state.unreadCount + 1
                }));
        },
        incrementUnread: ()=>{
            set((state)=>({
                    unreadCount: state.unreadCount + 1
                }));
        },
        reset: ()=>{
            set({
                notifications: [],
                unreadCount: 0,
                isLoading: false,
                lastFetchedAt: null
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notifications.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/runtime-cache.ts [app-client] (ecmascript)");
;
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        login: (userData, token)=>{
            // Validate role - only CANDIDATE allowed in candidate app
            if (userData.role !== 'CANDIDATE') {
                set({
                    user: null,
                    isAuthenticated: false,
                    error: 'Access denied. This app is for candidates only.',
                    isLoading: false
                });
                return;
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, token);
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
            set({
                user: userData,
                isAuthenticated: true,
                error: null,
                isLoading: false
            });
        },
        logout: async ()=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].post('/auth/logout');
            } catch (err) {
                console.error('Logout error:', err);
            } finally{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            }
        },
        fetchUser: async ()=>{
            set({
                isLoading: true,
                error: null
            });
            try {
                // The interceptor automatically handles tokens
                const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                if (!token) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
                    // If no token at all, probably not logged in
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    // Attempt a silent refresh just in case we have a cookie but no local token
                    try {
                        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].post('/auth/refresh');
                        const newToken = res.data.accessToken;
                        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, newToken);
                        // Try fetching user again
                        const meRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get('/auth/me');
                        // Validate role
                        if (meRes.data.role !== 'CANDIDATE') {
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
                            set({
                                user: null,
                                isAuthenticated: false,
                                error: 'Access denied. This app is for candidates only.',
                                isLoading: false
                            });
                            return;
                        }
                        set({
                            user: meRes.data,
                            isAuthenticated: true,
                            isLoading: false
                        });
                    } catch (e) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        });
                    }
                    return;
                }
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get('/auth/me');
                // Validate role - only CANDIDATE allowed
                if (res.data.role !== 'CANDIDATE') {
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: 'Access denied. This app is for candidates only.',
                        isLoading: false
                    });
                    return;
                }
                set({
                    user: res.data,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (err) {
                console.error('Fetch user error:', err);
                // Let the axios interceptor handle 401s
                set({
                    isLoading: false
                });
            }
        },
        setError: (error)=>set({
                error
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/use-router-with-loader.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRouterWithLoader",
    ()=>useRouterWithLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/route-activity.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const shouldTrackPathChange = (href)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const nextUrl = new URL(href, window.location.href);
        return nextUrl.origin === window.location.origin && nextUrl.pathname !== window.location.pathname;
    } catch (e) {
        return true;
    }
};
function useRouterWithLoader() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useRouterWithLoader.useMemo": ()=>{
            const push = {
                "useRouterWithLoader.useMemo.push": function() {
                    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                        args[_key] = arguments[_key];
                    }
                    if (shouldTrackPathChange(String(args[0]))) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["beginRouteTransition"])();
                    }
                    router.push(...args);
                }
            }["useRouterWithLoader.useMemo.push"];
            const replace = {
                "useRouterWithLoader.useMemo.replace": function() {
                    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                        args[_key] = arguments[_key];
                    }
                    if (shouldTrackPathChange(String(args[0]))) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["beginRouteTransition"])();
                    }
                    router.replace(...args);
                }
            }["useRouterWithLoader.useMemo.replace"];
            return {
                ...router,
                push,
                replace
            };
        }
    }["useRouterWithLoader.useMemo"], [
        router
    ]);
}
_s(useRouterWithLoader, "7vHaTZM1HcRMxSMZsXdA+0ARpxU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(auth)/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$router$2d$with$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-router-with-loader.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialValues = {
    email: '',
    password: ''
};
function validate(values) {
    const errors = {};
    if (!EMAIL_REGEX.test(values.email.trim())) {
        errors.email = 'Adresse email invalide';
    }
    if (values.password.length < 6) {
        errors.password = 'Mot de passe requis';
    }
    return errors;
}
function LoginPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$router$2d$with$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouterWithLoader"])();
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialValues);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [submitError, setSubmitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const onSubmit = async (event)=>{
        event.preventDefault();
        const nextErrors = validate(values);
        setErrors(nextErrors);
        setSubmitError('');
        if (Object.keys(nextErrors).length > 0) return;
        try {
            setIsLoading(true);
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].post('/auth/login', {
                email: values.email.trim(),
                password: values.password
            });
            const { user, accessToken } = res.data;
            if (user.role !== 'CANDIDATE') {
                setSubmitError('Acces refuse. Cette application est reservee aux candidats.');
                return;
            }
            login(user, accessToken);
            router.push('/');
        } catch (err) {
            var _err_response_data, _err_response;
            setSubmitError(((_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.error) || 'Erreur de connexion');
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6 w-full animate-in fade-in duration-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold tracking-tight",
                        children: "Bon retour"
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground mt-2",
                        children: "Entrez vos identifiants pour acceder a votre espace candidat"
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(auth)/login/page.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: onSubmit,
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "email",
                                children: "Email"
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "email",
                                placeholder: "nom@exemple.com",
                                type: "email",
                                autoCapitalize: "none",
                                autoComplete: "email",
                                autoCorrect: "off",
                                value: values.email,
                                onChange: (event)=>setValues((prev)=>({
                                            ...prev,
                                            email: event.target.value
                                        })),
                                className: "bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ".concat(errors.email ? 'border-err focus-visible:ring-destructive/50' : '')
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-err absolute -bottom-5 left-0",
                                children: errors.email
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 relative pt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "password",
                                        children: "Mot de passe"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/forgot-password",
                                        className: "text-xs font-medium text-primary hover:underline",
                                        children: "Mot de passe oublie ?"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 110,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "password",
                                type: "password",
                                autoComplete: "current-password",
                                value: values.password,
                                onChange: (event)=>setValues((prev)=>({
                                            ...prev,
                                            password: event.target.value
                                        })),
                                className: "bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ".concat(errors.password ? 'border-err focus-visible:ring-destructive/50' : '')
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            errors.password && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-err absolute -bottom-5 left-0",
                                children: errors.password
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    submitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-md border border-[var(--err-b)] bg-errl px-3 py-2 text-sm text-err",
                        children: submitError
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        className: "w-full mt-6",
                        disabled: isLoading,
                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin h-4 w-4 text-primary-foreground",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            className: "opacity-25",
                                            cx: "12",
                                            cy: "12",
                                            r: "10",
                                            stroke: "currentColor",
                                            strokeWidth: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(auth)/login/page.tsx",
                                            lineNumber: 136,
                                            columnNumber: 144
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            className: "opacity-75",
                                            fill: "currentColor",
                                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(auth)/login/page.tsx",
                                            lineNumber: 136,
                                            columnNumber: 245
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Connexion..."
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 137,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 135,
                            columnNumber: 13
                        }, this) : 'Se connecter'
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(auth)/login/page.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-sm text-muted-foreground",
                children: [
                    "Pas encore de compte ?",
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/register",
                        className: "font-medium text-primary hover:underline",
                        children: "Inscrivez-vous"
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(auth)/login/page.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(auth)/login/page.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "Uraj+4yKFCdMFmHejX6Q+d+LPn4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$router$2d$with$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouterWithLoader"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_2289dcb9._.js.map