#!/usr/bin/env bash
# MUC 5.5 — cron kiem tra suc khoe, chay moi 5 phut.
#
#   */5 * * * * cd /path/to/app && bash scripts/crawl/healthcheck.sh >> data/healthcheck.log 2>&1
#
# ─── VAI TRO DA THU HEP SAU KHI CHUYEN SANG GIAY PHEP ────────────────────────
#
# Ban truoc, script nay la CO CHE CUU HO: no phai phat hien co bao tri bi ket va
# tu go. De lam vay no hoi kernel `kill -0 $PID` — va cau hoi do tra loi sai khi
# cron chay khac user voi job, dan toi go co ngay giua luc pha B dang embed.
#
# Gio giay phep tu het han neu khong ai gia hạn, nen app tu tro lai phuc vu sau
# toi da 5 phut ma KHONG can script nay lam gi. Vai tro con lai chi la:
#
#   1. Bat truong hop app chet that (khong bao tri ma health khong phan hoi)
#   2. Don file giay phep da het han tu lau, de `ls data/` khong gay hieu nham
#   3. Canh bao khi giay phep duoc gia hạn lien tuc qua lau — nghia la job TREO
#      chu khong chet, tuc watchdog 15 phut cung da hong
#
# Khong con dong `kill -0` nao. Khong con quyet dinh nao dua tren PID.
set -uo pipefail

URL="${HEALTH_URL:-http://localhost:3003/api/health}"
FLAG="data/maintenance.flag"
# Bao tri keo dai qua nguong nay nghia la job treo va watchdog 15 phut cung
# khong cat duoc. Chi CANH BAO, khong tu can thiep: gia hạn van dien ra nghia la
# tien trinh van song va van giu ~2GB model. Restart app luc nay se tao ban thu
# hai — dung cai ta tranh.
STUCK_MIN="${STUCK_MIN:-20}"
# File giay phep het han bao lau thi don di.
STALE_MIN="${STALE_MIN:-60}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

BODY=$(curl -fsS --max-time 10 "$URL" 2>/dev/null || echo "")

if [ -z "$BODY" ]; then
  # Khong phan hoi. Neu dang bao tri thi day co the la khoanh khac app restart
  # giua chu ky — khong restart de tranh dam vao job.
  if [ -f "$FLAG" ]; then
    log "health khong phan hoi nhung dang co giay phep bao tri — bo qua lan nay"
    exit 0
  fi
  log "KHONG bao tri ma $URL khong phan hoi — restart app"
  docker compose restart app
  exit 1
fi

ACTIVE=$(printf '%s' "$BODY" | grep -o '"active":[a-z]*' | head -1 | cut -d: -f2)

if [ "$ACTIVE" = "true" ]; then
  # Con bao nhieu giay nua het han — app tinh san, khong phai doan tu mtime.
  LEFT=$(printf '%s' "$BODY" | grep -o '"expires_in_sec":-\?[0-9]*' | head -1 | cut -d: -f2)
  AGE_MIN=0
  [ -f "$FLAG" ] && AGE_MIN=$(( ( $(date +%s) - $(stat -c %Y "$FLAG" 2>/dev/null || echo 0) ) / 60 ))

  if [ "$AGE_MIN" -ge "$STUCK_MIN" ]; then
    log "CANH BAO: bao tri da $AGE_MIN phut va giay phep VAN duoc gia hạn (con ${LEFT:-?}s)."
    log "  Nghia la job TREO chu khong chet, va watchdog ${TIMEOUT_MIN:-15} phut cung da hong."
    log "  KHONG tu restart: job van dang giu model trong RAM. Can nguoi vao xem."
    exit 1
  fi
  log "dang bao tri, giay phep con ${LEFT:-?}s — binh thuong"
  exit 0
fi

# Khong bao tri. Neu file giay phep con nam do va da het han tu lau thi don di —
# no khong con hieu luc, chi gay hieu nham khi ai do nhin thu muc data/.
if [ -f "$FLAG" ]; then
  AGE_MIN=$(( ( $(date +%s) - $(stat -c %Y "$FLAG" 2>/dev/null || echo 0) ) / 60 ))
  if [ "$AGE_MIN" -ge "$STALE_MIN" ]; then
    log "don file giay phep da het han $AGE_MIN phut truoc"
    rm -f "$FLAG" "$FLAG.tmp"
  fi
fi

log "ok"
