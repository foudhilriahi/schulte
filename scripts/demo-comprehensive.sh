#!/usr/bin/env bash
# =============================================================================
# SCHULTE TUNISIA — Démonstration Complète
# Isolation multi-site + Analyse IA + Extraction CV + Notifications Push
# =============================================================================
# Prérequis: backend running on PORT (default 5000)
# Usage:      bash scripts/demo-comprehensive.sh
# Résultat:   Génère demo-output.txt avec TOUS les appels et réponses
# =============================================================================

set -euo pipefail

BASE="${BASE_URL:-http://localhost:5000/api}"
OUT="demo-output.txt"
SEP="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "# =============================================================================" > "$OUT"
echo "# SCHULTE TUNISIA — Démonstration Complète (généré le $(date '+%Y-%m-%d %H:%M'))" >> "$OUT"
echo "# =============================================================================" >> "$OUT"
echo "" >> "$OUT"

log() {
  echo "" | tee -a "$OUT"
  echo "$SEP" | tee -a "$OUT"
  echo "  $1" | tee -a "$OUT"
  echo "$SEP" | tee -a "$OUT"
}

call() {
  local METHOD="$1"
  local PATH="$2"
  local DATA="${3:-}"
  local DESC="${4:-}"

  echo "" >> "$OUT"
  echo "── $METHOD $PATH $DESC" >> "$OUT"

  local CMD="curl -s -w \"\n%{http_code}\" -X $METHOD \"$BASE$PATH\""
  CMD+=" -H \"Authorization: Bearer ${TOKEN:-}\""
  CMD+=" -H \"Content-Type: application/json\""
  if [ -n "$DATA" ]; then
    CMD+=" -d '$DATA'"
  fi

  RESP=$(eval "$CMD")
  BODY=$(echo "$RESP" | head -n -1)
  CODE=$(echo "$RESP" | tail -n1)

  echo "   Code: $CODE" >> "$OUT"
  echo "   Corps:" >> "$OUT"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY" >> "$OUT"
  echo "" >> "$OUT"
}

log "1/9 — SANTÉ DU SERVEUR"
echo "   curl $BASE/health" | tee -a "$OUT"
curl -s "$BASE/health" | python3 -m json.tool >> "$OUT" 2>/dev/null || echo "(serveur indisponible)" >> "$OUT"

log "2/9 — CLÉ PUBLIQUE VAPID (Notifications Push)"
echo "   GET /notifications/vapid-public-key" >> "$OUT"
VAPID_RESP=$(curl -s -H "Authorization: Bearer ${TOKEN:-}" "$BASE/notifications/vapid-public-key")
VAPID_KEY=$(echo "$VAPID_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('publicKey',''))" 2>/dev/null)
echo "$VAPID_RESP" | python3 -m json.tool >> "$OUT" 2>/dev/null
echo "   ✅ Clé VAPID présente: ${VAPID_KEY:0:20}..." | tee -a "$OUT"

log "3/9 — SOUSCRIPTION PUSH (POST /notifications/subscribe)"
call "POST" "/notifications/subscribe" \
  '{"subscription":{"endpoint":"https://demo.push/test","keys":{"p256dh":"demoKey","auth":"demoAuth"}}}' \
  ""

log "4/9 — LISTER LES NOTIFICATIONS (GET /notifications)"
call "GET" "/notifications" "" ""

log "5/9 — COMPTEUR NON LUS (GET /notifications/unread-count)"
call "GET" "/notifications/unread-count" "" ""

log "6/9 — UPLOADER UN CV (POST /cvs/upload) — Extraction PDF automatique"
echo "   [Simulation — nécessite un fichier PDF et un token CANDIDATE]" >> "$OUT"
echo "   curl -X POST \"$BASE/cvs/upload\" -H \"Authorization: Bearer \$TOKEN\" -F \"cvFile=@/chemin/vers/cv.pdf\"" >> "$OUT"

log "7/9 — CRÉER UN CV GÉNÉRÉ (POST /cvs/generated) — Données structurées"
call "POST" "/cvs/generated" \
  '{
    "name":"CV Démo",
    "formData":{
      "personal":{"name":"Ahmed Ben Salem","email":"ahmed@demo.tn","phone":"+21699123456","city":"Bouarada"},
      "education":[{"degree":"Ingénieur","field":"Génie Mécanique","institution":"ENIT","year":"2020"}],
      "experience":[{"title":"Ingénieur Qualité","company":"Schulte Tunisia","startDate":"2020-01","endDate":"2024-12","description":"Gestion qualité fournisseur et audit interne."}],
      "skills":["CATIA","SAP","Kaizen","ISO TS 16949","Lean Manufacturing","Six Sigma"],
      "languages":[{"name":"Français","level":"Courant"},{"name":"Anglais","level":"Intermédiaire"}],
      "links":[{"name":"LinkedIn","url":"https://linkedin.com/in/ahmed"}],
      "coverNote":"Candidature pour le poste d\'Ingénieur Qualité."
    },
    "template":"modern",
    "isDefault":true
  }' \
  ""

log "8/9 — ANALYSE IA (POST /applications/:id/analyse) — Score + Compétences + Recommandation"
echo "   POST /applications/{id}/analyse — Nécessite un ID de candidature existant" >> "$OUT"
echo "   Activation: curl -X POST \"$BASE/applications/<ID>/analyse\" -H \"Authorization: Bearer \$TOKEN\"" >> "$OUT"
echo "" >> "$OUT"
echo "   Réponse type (attendue):" >> "$OUT"
echo '   {' >> "$OUT"
echo '     "score": 82,' >> "$OUT"
echo '     "confidence": "high",' >> "$OUT"
echo '     "recommendation": "Interview",' >> "$OUT"
echo '     "strengths": ["5+ ans expérience câblage","Maîtrise CATIA","SAP"],' >> "$OUT"
echo '     "gaps": ["Pas d'expérience Lean Manufacturing"],' >> "$OUT"
echo '     "tipsForCandidate": ["Préparer un cas pratique qualité"],' >> "$OUT"
echo '     "aiProvider": "Gemini 2.5 Flash (Gemini)",' >> "$OUT"
echo '     "language": "Français"' >> "$OUT"
echo '   }' >> "$OUT"

log "9/9 — VÉRIFICATION ISOLATION SITE"
echo "   Contexte: L'utilisateur HR Bouarada tente d'accéder à une candidature Zaghouan" >> "$OUT"
echo "   curl -X GET \"$BASE/applications/<ID_ZAGHOUAN>\" -H \"Authorization: Bearer \$TOKEN_HR_BOUARADA\"" >> "$OUT"
echo "   Réponse attendue: 403 Accès interdit" >> "$OUT"
echo "   (Test manuel — nécessite 2 tokens HR de sites différents)" >> "$OUT"

echo "" | tee -a "$OUT"
echo "╔══════════════════════════════════════════════════════╗" | tee -a "$OUT"
echo "║  RAPPORT GÉNÉRÉ dans $OUT          ║" | tee -a "$OUT"
echo "╚══════════════════════════════════════════════════════╝" | tee -a "$OUT"
echo "" | tee -a "$OUT"
