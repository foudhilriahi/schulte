(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/cv-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCV",
    ()=>generateCV
]);
const generateCV = async (data, template)=>{
    const { jsPDF } = await __turbopack_context__.A("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript, async loader)");
    const doc = new jsPDF();
    // Basic properties
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Modern Template
    if (template === 'modern') {
        var _data_personal, _data_personal1, _data_personal2, _data_personal3;
        // Header background
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 0, pageWidth, 40, 'F');
        // Header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(((_data_personal = data.personal) === null || _data_personal === void 0 ? void 0 : _data_personal.name) || 'Votre nom', 20, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("".concat(((_data_personal1 = data.personal) === null || _data_personal1 === void 0 ? void 0 : _data_personal1.email) || '', "  |  ").concat(((_data_personal2 = data.personal) === null || _data_personal2 === void 0 ? void 0 : _data_personal2.phone) || '', "  |  ").concat(((_data_personal3 = data.personal) === null || _data_personal3 === void 0 ? void 0 : _data_personal3.city) || ''), 20, 30);
        y = 55;
        doc.setTextColor(0, 0, 0);
        const addSectionTitle = (title)=>{
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(37, 99, 235);
            doc.text(title.toUpperCase(), 20, y);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y + 2, pageWidth - 20, y + 2);
            doc.setTextColor(0, 0, 0);
            y += 10;
        };
        // Experience
        if (data.experience && data.experience.length > 0) {
            addSectionTitle('Experience professionnelle');
            data.experience.forEach((exp)=>{
                if (!exp.title) return;
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(exp.title, 20, y);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("".concat(exp.company || '', " | ").concat(exp.duration || ''), pageWidth - 20, y, {
                    align: 'right'
                });
                doc.setTextColor(0, 0, 0);
                y += 8;
            });
            y += 5;
        }
        // Education
        if (data.education && data.education.length > 0) {
            addSectionTitle('Formation');
            data.education.forEach((edu)=>{
                if (!edu.degree) return;
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(edu.degree, 20, y);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("".concat(edu.institution || '', " | ").concat(edu.year || ''), pageWidth - 20, y, {
                    align: 'right'
                });
                doc.setTextColor(0, 0, 0);
                y += 8;
            });
            y += 5;
        }
        // Skills
        if (data.skills && data.skills.length > 0) {
            addSectionTitle('Competences');
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(data.skills.join('  •  '), 20, y, {
                maxWidth: pageWidth - 40
            });
            y += 15;
        }
    } else {
        var _data_personal4, _data_personal5, _data_personal6, _data_personal7;
        // Classic Template
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.setFont("times", "bold");
        doc.text(((_data_personal4 = data.personal) === null || _data_personal4 === void 0 ? void 0 : _data_personal4.name) || 'Votre nom', pageWidth / 2, y, {
            align: 'center'
        });
        y += 8;
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("".concat(((_data_personal5 = data.personal) === null || _data_personal5 === void 0 ? void 0 : _data_personal5.email) || '', " | ").concat(((_data_personal6 = data.personal) === null || _data_personal6 === void 0 ? void 0 : _data_personal6.phone) || '', " | ").concat(((_data_personal7 = data.personal) === null || _data_personal7 === void 0 ? void 0 : _data_personal7.city) || ''), pageWidth / 2, y, {
            align: 'center'
        });
        y += 15;
        const addClassicSection = (title)=>{
            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.text(title.toUpperCase(), 20, y);
            doc.setDrawColor(0, 0, 0);
            doc.line(20, y + 2, pageWidth - 20, y + 2);
            y += 8;
        };
        // Experience
        if (data.experience && data.experience.length > 0) {
            addClassicSection('Experience professionnelle');
            data.experience.forEach((exp)=>{
                if (!exp.title) return;
                doc.setFontSize(12);
                doc.setFont("times", "bold");
                doc.text(exp.title, 20, y);
                doc.setFontSize(11);
                doc.setFont("times", "italic");
                doc.text("".concat(exp.company || '', ", ").concat(exp.duration || ''), 20, y + 5);
                y += 12;
            });
            y += 5;
        }
        // Education
        if (data.education && data.education.length > 0) {
            addClassicSection('Formation');
            data.education.forEach((edu)=>{
                if (!edu.degree) return;
                doc.setFontSize(12);
                doc.setFont("times", "bold");
                doc.text(edu.degree, 20, y);
                doc.setFontSize(11);
                doc.setFont("times", "italic");
                doc.text("".concat(edu.institution || '', ", ").concat(edu.year || ''), 20, y + 5);
                y += 12;
            });
            y += 5;
        }
        // Skills
        if (data.skills && data.skills.length > 0) {
            addClassicSection('Competences techniques');
            doc.setFontSize(11);
            doc.setFont("times", "normal");
            doc.text(data.skills.join(', '), 20, y, {
                maxWidth: pageWidth - 40
            });
        }
    }
    return doc;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_cv-generator_ts_be220260._.js.map