(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/network-activity.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNetworkActivityStore",
    ()=>useNetworkActivityStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useNetworkActivityStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        pendingCount: 0,
        begin: ()=>{
            set((state)=>({
                    pendingCount: state.pendingCount + 1
                }));
        },
        end: ()=>{
            set((state)=>({
                    pendingCount: Math.max(0, state.pendingCount - 1)
                }));
        },
        reset: ()=>{
            set({
                pendingCount: 0
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/global-network-loader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GlobalNetworkLoader",
    ()=>GlobalNetworkLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/network-activity.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 260;
function GlobalNetworkLoader() {
    _s();
    const pendingCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"])({
        "GlobalNetworkLoader.useNetworkActivityStore[pendingCount]": (state)=>state.pendingCount
    }["GlobalNetworkLoader.useNetworkActivityStore[pendingCount]"]);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const shownAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const showTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hideTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalNetworkLoader.useEffect": ()=>{
            const clearTimers = {
                "GlobalNetworkLoader.useEffect.clearTimers": ()=>{
                    if (showTimerRef.current) {
                        window.clearTimeout(showTimerRef.current);
                        showTimerRef.current = null;
                    }
                    if (hideTimerRef.current) {
                        window.clearTimeout(hideTimerRef.current);
                        hideTimerRef.current = null;
                    }
                }
            }["GlobalNetworkLoader.useEffect.clearTimers"];
            if (pendingCount > 0) {
                if (visible) return;
                clearTimers();
                showTimerRef.current = window.setTimeout({
                    "GlobalNetworkLoader.useEffect": ()=>{
                        shownAtRef.current = Date.now();
                        setVisible(true);
                    }
                }["GlobalNetworkLoader.useEffect"], SHOW_DELAY_MS);
                return;
            }
            clearTimers();
            if (!visible) return;
            const elapsed = Date.now() - shownAtRef.current;
            const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
            hideTimerRef.current = window.setTimeout({
                "GlobalNetworkLoader.useEffect": ()=>{
                    setVisible(false);
                }
            }["GlobalNetworkLoader.useEffect"], remaining);
            return clearTimers;
        }
    }["GlobalNetworkLoader.useEffect"], [
        pendingCount,
        visible
    ]);
    if (!visible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none fixed inset-0 z-[120] flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 shadow-lg backdrop-blur-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-4 w-4 animate-spin text-primary"
                }, void 0, false, {
                    fileName: "[project]/components/global-network-loader.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs font-medium text-foreground",
                    children: "Chargement..."
                }, void 0, false, {
                    fileName: "[project]/components/global-network-loader.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/global-network-loader.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/global-network-loader.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s(GlobalNetworkLoader, "5jolx3XH8NnniVfyEXVScULXzuA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$network$2d$activity$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNetworkActivityStore"]
    ];
});
_c = GlobalNetworkLoader;
var _c;
__turbopack_context__.k.register(_c, "GlobalNetworkLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0827c449._.js.map