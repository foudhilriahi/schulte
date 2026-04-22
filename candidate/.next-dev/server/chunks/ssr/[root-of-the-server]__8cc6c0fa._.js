module.exports = [
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
   */ getItem(key, defaultValue = null) {
        if ("TURBOPACK compile-time truthy", 1) return defaultValue;
        //TURBOPACK unreachable
        ;
    }
    /**
   * Enregistre une valeur localStorage de manière sûre
   */ setItem(key, value) {
        if ("TURBOPACK compile-time truthy", 1) return false;
        //TURBOPACK unreachable
        ;
    }
    /**
   * Supprime une valeur localStorage
   */ removeItem(key) {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    /**
   * Efface toutes les données de l'application
   */ clear() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
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
        if ("TURBOPACK compile-time truthy", 1) return 0;
        //TURBOPACK unreachable
        ;
        let total;
    }
    /**
   * Vérifie si le stockage est disponible
   */ isAvailable() {
        if ("TURBOPACK compile-time truthy", 1) return false;
        //TURBOPACK unreachable
        ;
    }
}
const storage = new StorageService();
;
}),
"[project]/lib/runtime-cache.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
const shouldClearCache = (cacheName)=>USER_RUNTIME_CACHE_NAMES.some((name)=>cacheName === name || cacheName.startsWith(`${name}-`));
async function clearUserRuntimeCaches() {
    if ("undefined" === 'undefined' || !('caches' in window)) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/lib/axios.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/runtime-cache.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/network-activity.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/route-activity.ts [app-ssr] (ecmascript)");
;
;
;
;
;
// Get base URL from env or use default fallback for local dev
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
const LOADER_SKIP_HEADER = 'x-skip-global-loader';
const startRequestLoader = (config)=>{
    const headers = config.headers ?? {};
    const rawSkipValue = headers[LOADER_SKIP_HEADER] ?? headers[LOADER_SKIP_HEADER.toUpperCase()];
    const shouldSkip = rawSkipValue === '1' || rawSkipValue === 1 || rawSkipValue === true;
    if (headers[LOADER_SKIP_HEADER] !== undefined) delete headers[LOADER_SKIP_HEADER];
    if (headers[LOADER_SKIP_HEADER.toUpperCase()] !== undefined) delete headers[LOADER_SKIP_HEADER.toUpperCase()];
    config.headers = headers;
    config.__globalLoaderTracked = !shouldSkip;
    if (!shouldSkip) {
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().begin();
    }
};
const stopRequestLoader = (config)=>{
    if (config?.__globalLoaderTracked) {
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().end();
    }
};
// Request interceptor: attach Access Token if present
api.interceptors.request.use((config)=>{
    startRequestLoader(config);
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].getItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Response interceptor: handle 401 Unauthorized by attempting to refresh token
api.interceptors.response.use((response)=>{
    stopRequestLoader(response?.config);
    return response;
}, async (error)=>{
    const originalRequest = error.config;
    const status = error.response?.status;
    stopRequestLoader(originalRequest);
    if (status === 403) {
        // Role/session mismatch: clear candidate tab token and force clean login.
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resetRouteTransitions"])();
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().reset();
        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return Promise.reject(error);
    }
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
        originalRequest._retry = true;
        try {
            // Attempt to refresh the token using httpOnly cookie via the endpoint
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`${baseURL}/auth/refresh`, {}, {
                withCredentials: true
            });
            const newAccessToken = res.data.accessToken;
            // Save the new token using storage service
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, newAccessToken);
            // Update header and retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh token failed or expired, force logout pipeline
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$route$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resetRouteTransitions"])();
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNetworkActivityStore"].getState().reset();
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});
}),
"[project]/store/notifications.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotificationStore",
    ()=>useNotificationStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-ssr] (ecmascript)");
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
const pickString = (...values)=>{
    for (const value of values){
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
};
const normalizeNotification = (raw)=>{
    const payload = asObject(raw.payload);
    const status = pickString(payload.status)?.toLowerCase();
    const offerTitle = pickString(payload.offerTitle);
    const statusTitle = status ? STATUS_LABELS[status] : null;
    const fallbackTitle = statusTitle ?? DEFAULT_TITLE_BY_TYPE[raw.type ?? 'info'] ?? 'Notification';
    const title = pickString(raw.title, payload.title, fallbackTitle) ?? fallbackTitle;
    const fallbackMessage = offerTitle ? `${statusTitle ?? 'Mise a jour'} pour le poste ${offerTitle}.` : statusTitle ? `Le statut de votre candidature est passe a: ${statusTitle}.` : 'Une nouvelle mise a jour est disponible.';
    const message = pickString(raw.message, payload.message, fallbackMessage) ?? fallbackMessage;
    const link = pickString(raw.link, payload.link) ?? undefined;
    const read = typeof raw.read === 'boolean' ? raw.read : !!raw.readAt;
    return {
        id: raw.id,
        title,
        message,
        type: pickString(raw.type, payload.type) ?? 'info',
        read,
        link,
        createdAt: raw.createdAt
    };
};
const useNotificationStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get('/notifications');
                const rawNotifications = Array.isArray(res.data) ? res.data : [];
                const notifications = rawNotifications.map(normalizeNotification);
                const unreadCount = notifications.filter((n)=>!n.read).length;
                set({
                    notifications,
                    unreadCount,
                    lastFetchedAt: now
                });
            } catch  {
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
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get('/notifications/unread-count');
                set({
                    unreadCount: res.data.count,
                    lastFetchedAt: Date.now()
                });
            } catch  {
            // fail silently
            }
        },
        markAllRead: async ()=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].patch('/notifications/mark-all-read');
                set((state)=>({
                        notifications: state.notifications.map((n)=>({
                                ...n,
                                read: true
                            })),
                        unreadCount: 0
                    }));
            } catch  {
            // fail silently
            }
        },
        markOneRead: async (id)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].patch(`/notifications/${id}/read`);
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
            } catch  {
            // fail silently
            }
        },
        deleteNotification: async (id)=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].delete(`/notifications/${id}`);
                set((state)=>{
                    const target = state.notifications.find((n)=>n.id === id);
                    const unreadCount = target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount;
                    return {
                        notifications: state.notifications.filter((n)=>n.id !== id),
                        unreadCount
                    };
                });
            } catch  {
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
}),
"[project]/store/auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notifications.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/runtime-cache.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
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
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, token);
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
            set({
                user: userData,
                isAuthenticated: true,
                error: null,
                isLoading: false
            });
        },
        logout: async ()=>{
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].post('/auth/logout');
            } catch (err) {
                console.error('Logout error:', err);
            } finally{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
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
                const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].getItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                if (!token) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
                    // If no token at all, probably not logged in
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    // Attempt a silent refresh just in case we have a cookie but no local token
                    try {
                        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].post('/auth/refresh');
                        const newToken = res.data.accessToken;
                        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].setItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN, newToken);
                        // Try fetching user again
                        const meRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get('/auth/me');
                        // Validate role
                        if (meRes.data.role !== 'CANDIDATE') {
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
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
                    } catch  {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        });
                    }
                    return;
                }
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get('/auth/me');
                // Validate role - only CANDIDATE allowed
                if (res.data.role !== 'CANDIDATE') {
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storage"].removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].LEGACY_ACCESS_TOKEN);
                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().reset();
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$runtime$2d$cache$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearUserRuntimeCaches"])();
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
}),
"[project]/components/bottom-nav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomNav",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notifications.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const navItems = [
    {
        href: "/",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
        label: "Accueil"
    },
    {
        href: "/applications",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        label: "Candidatures"
    },
    {
        href: "/notifications",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
        label: "Notifications"
    },
    {
        href: "/profile",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
        label: "Profil"
    }
];
function BottomNav() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const unreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])((s)=>s.unreadCount);
    const isAuthenticated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((s)=>s.isAuthenticated);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isAuthenticated) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"].getState().fetchUnreadCount();
    }, [
        isAuthenticated
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "sticky bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-around h-[58px] max-w-lg mx-auto",
            children: navItems.map((item)=>{
                const isActive = pathname === item.href || item.href !== "/" && pathname.startsWith(item.href);
                const Icon = item.icon;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: item.href,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 transition-colors touch-manipulation", isActive ? "text-violet" : "text-ink4"),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "h-5 w-5",
                                    strokeWidth: isActive ? 2.5 : 2
                                }, void 0, false, {
                                    fileName: "[project]/components/bottom-nav.tsx",
                                    lineNumber: 47,
                                    columnNumber: 17
                                }, this),
                                item.label === "Notifications" && unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute -top-1 -right-1 h-2 w-2 rounded-full bg-coral border-2 border-card"
                                }, void 0, false, {
                                    fileName: "[project]/components/bottom-nav.tsx",
                                    lineNumber: 49,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/bottom-nav.tsx",
                            lineNumber: 46,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-[10px] font-semibold", isActive ? "text-violet" : "text-ink4"),
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/components/bottom-nav.tsx",
                            lineNumber: 52,
                            columnNumber: 15
                        }, this)
                    ]
                }, item.href, true, {
                    fileName: "[project]/components/bottom-nav.tsx",
                    lineNumber: 38,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/bottom-nav.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/bottom-nav.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function Providers({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 30 * 1000,
                    gcTime: 5 * 60 * 1000,
                    retry: 1,
                    refetchOnWindowFocus: false
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/providers.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/realtime-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RealtimeProvider",
    ()=>RealtimeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth.ts [app-ssr] (ecmascript)");
;
"use client";
;
;
;
const SocketListener = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/components/SocketListener.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
function RealtimeProvider() {
    const isAuthenticated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.isAuthenticated);
    if (!isAuthenticated) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SocketListener, {}, void 0, false, {
        fileName: "[project]/components/realtime-provider.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
}),
"[project]/components/toast-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
function ToastProvider() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
        position: "top-center",
        toastOptions: {
            className: 'text-sm',
            duration: 3000
        }
    }, void 0, false, {
        fileName: "[project]/components/toast-provider.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8cc6c0fa._.js.map