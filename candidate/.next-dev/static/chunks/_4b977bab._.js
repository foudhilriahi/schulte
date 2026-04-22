(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/socket.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ✅ PRODUCTION-READY SOCKET.IO CLIENT
__turbopack_context__.s([
    "socketService",
    ()=>socketService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
;
;
// Use correct backend URL with fallback
const URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
class SocketService {
    connect(token) {
        var _this_socket;
        // Don't reconnect if already connected or connecting
        if (((_this_socket = this.socket) === null || _this_socket === void 0 ? void 0 : _this_socket.connected) || this.isConnecting) {
            console.log('✅ Socket already connected or connecting');
            return;
        }
        if (this.socket && !this.socket.connected) {
            this.socket.auth = {
                token
            };
            this.socket.connect();
            return;
        }
        this.isConnecting = true;
        console.log('🔄 Connecting to WebSocket...', URL);
        this.socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(URL, {
            auth: {
                token
            },
            withCredentials: true,
            transports: [
                'polling',
                'websocket'
            ],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 20000
        });
        this.socket.on('connect', ()=>{
            var _this_socket;
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            console.log('✅ WebSocket Connected:', (_this_socket = this.socket) === null || _this_socket === void 0 ? void 0 : _this_socket.id);
        });
        this.socket.on('disconnect', (reason)=>{
            this.isConnecting = false;
            console.log('🔴 WebSocket Disconnected:', reason);
            // Auto-reconnect for certain disconnect reasons
            if (reason === 'io server disconnect' || reason === 'transport close') {
                setTimeout(()=>{
                    var _this_socket;
                    if (token && !((_this_socket = this.socket) === null || _this_socket === void 0 ? void 0 : _this_socket.connected)) {
                        console.log('🔄 Auto-reconnecting...');
                        this.connect(token);
                    }
                }, 3000);
            }
        });
        this.socket.on('connect_error', (error)=>{
            this.reconnectAttempts++;
            this.isConnecting = false;
            console.error('❌ WebSocket Connection Error:', error.message);
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ Max reconnection attempts reached. Will retry in 30 seconds...');
                setTimeout(()=>{
                    this.reconnectAttempts = 0;
                    if (token) this.connect(token);
                }, 30000);
            }
        });
        this.socket.on('error', (error)=>{
            console.error('❌ WebSocket Error:', error);
        });
        // Add authentication error handler
        this.socket.on('auth_error', (error)=>{
            console.error('❌ WebSocket Auth Error:', error);
            this.disconnect();
        });
    }
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting WebSocket...');
            this.socket.disconnect();
            this.socket = null;
            this.reconnectAttempts = 0;
            this.isConnecting = false;
        }
    }
    getSocket() {
        return this.socket;
    }
    isConnected() {
        var _this_socket;
        return ((_this_socket = this.socket) === null || _this_socket === void 0 ? void 0 : _this_socket.connected) || false;
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "socket", null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "reconnectAttempts", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "maxReconnectAttempts", 10);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isConnecting", false);
    }
}
const socketService = new SocketService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useSocket.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSocket",
    ()=>useSocket,
    "useSocketEvent",
    ()=>useSocketEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/socket.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function useSocket() {
    _s();
    const { isAuthenticated, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const connectionAttempted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSocket.useEffect": ()=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storage"].getItem(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORAGE_KEYS"].ACCESS_TOKEN);
            if (isAuthenticated && token && user) {
                // Only connect if we haven't attempted yet or if user changed
                if (!connectionAttempted.current || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].isConnected()) {
                    console.log('🔄 Connecting WebSocket for user:', user.id);
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].connect(token);
                    connectionAttempted.current = true;
                }
            } else {
                // Disconnect if not authenticated
                if (connectionAttempted.current) {
                    console.log('🔌 Disconnecting WebSocket - not authenticated');
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].disconnect();
                    connectionAttempted.current = false;
                }
            }
            // Cleanup on unmount - keep connection alive
            return ({
                "useSocket.useEffect": ()=>{
                // Don't disconnect on unmount, only when user logs out
                }
            })["useSocket.useEffect"];
        }
    }["useSocket.useEffect"], [
        isAuthenticated,
        user === null || user === void 0 ? void 0 : user.id
    ]); // Reconnect if user changes
    return {
        socket: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].getSocket(),
        isConnected: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].isConnected()
    };
}
_s(useSocket, "ppF3XuzXnfagxpqRe2kq0iw9AEU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
function useSocketEvent(event, callback) {
    _s1();
    const { isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const callbackRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(callback);
    // Update callback ref when it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSocketEvent.useEffect": ()=>{
            callbackRef.current = callback;
        }
    }["useSocketEvent.useEffect"], [
        callback
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSocketEvent.useEffect": ()=>{
            if (!isAuthenticated) return;
            const socket = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["socketService"].getSocket();
            if (!socket) return;
            // Wrapper to use latest callback
            const handler = {
                "useSocketEvent.useEffect.handler": (data)=>{
                    callbackRef.current(data);
                }
            }["useSocketEvent.useEffect.handler"];
            // Attach listener
            socket.on(event, handler);
            // Cleanup
            return ({
                "useSocketEvent.useEffect": ()=>{
                    socket.off(event, handler);
                }
            })["useSocketEvent.useEffect"];
        }
    }["useSocketEvent.useEffect"], [
        event,
        isAuthenticated
    ]);
}
_s1(useSocketEvent, "as4EyWOhwflQRnM3xtTtE8LL0IU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/queryKeys.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "candidateQueryKeys",
    ()=>candidateQueryKeys
]);
const candidateQueryKeys = {
    offers: [
        'candidate',
        'offers'
    ],
    offer: (id)=>[
            'candidate',
            'offers',
            id
        ],
    applicationsMine: [
        'candidate',
        'applications',
        'mine'
    ],
    application: (id)=>[
            'candidate',
            'applications',
            id
        ],
    notifications: [
        'candidate',
        'notifications'
    ],
    cvsMine: [
        'candidate',
        'cvs',
        'mine'
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SocketListener.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SocketListener
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useSocket.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notifications.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryKeys.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const STATUS_TOASTS = {
    reviewing: "Votre candidature est en cours d'examen",
    interview: "Entretien planifié pour votre candidature",
    accepted: "Votre candidature a été acceptée",
    rejected: "Votre candidature n'a pas été retenue pour ce poste."
};
function SocketListener() {
    _s();
    const { isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const fetchNotifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])({
        "SocketListener.useNotificationStore[fetchNotifications]": (s)=>s.fetchNotifications
    }["SocketListener.useNotificationStore[fetchNotifications]"]);
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Only render on client
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SocketListener.useEffect": ()=>{
            setIsMounted(true);
        }
    }["SocketListener.useEffect"], []);
    // Maintain socket connection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocket"])();
    // status:changed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('status:changed', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].applicationsMine
            });
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].application(data.applicationId)
            });
            const msg = STATUS_TOASTS[data.status];
            if (msg) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(msg);
            fetchNotifications();
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient,
        fetchNotifications
    ]));
    // interview:scheduled
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('interview:scheduled', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (_data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].applicationsMine
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Un entretien a été planifié pour vous");
            fetchNotifications();
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient,
        fetchNotifications
    ]));
    // offer:new
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('offer:new', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (_data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].offers
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Nouvelle offre d'emploi disponible");
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient
    ]));
    // offer:closed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('offer:closed', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (_data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].offers
            });
        // No toast for closed offers to avoid spam
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient
    ]));
    // interview:reminder
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('interview:reminder', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (_data)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].warning("Rappel : vous avez un entretien demain");
            fetchNotifications();
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        fetchNotifications
    ]));
    // ai:analysis_complete - New AI analysis results
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('ai:analysis_complete', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].applicationsMine
            });
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].application(data.applicationId)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Analyse IA terminée pour ".concat(data.jobTitle));
            fetchNotifications();
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient,
        fetchNotifications
    ]));
    // ai:analysis_updated - Updated AI analysis results
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"])('ai:analysis_updated', (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocketListener.useSocketEvent.useCallback": (data)=>{
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].applicationsMine
            });
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryKeys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["candidateQueryKeys"].application(data.applicationId)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Analyse IA mise à jour pour ".concat(data.jobTitle));
            fetchNotifications();
        }
    }["SocketListener.useSocketEvent.useCallback"], [
        queryClient,
        fetchNotifications
    ]));
    if (!isMounted || !isAuthenticated) return null;
    return null;
}
_s(SocketListener, "xpB2R7FkSPRmaw7gJIFujP3WAXI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocket"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSocketEvent"]
    ];
});
_c = SocketListener;
var _c;
__turbopack_context__.k.register(_c, "SocketListener");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SocketListener.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/SocketListener.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=_4b977bab._.js.map