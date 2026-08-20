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
#
# ─── HAI CHO TUNG SAI, GHI LAI DE KHONG SAI LAI ──────────────────────────────
#
# (a) Vai tro 3 tung do tuoi bao tri bang mtime cua file giay phep, va vi the
#     KHONG BAO GIO chay duoc. `write_lease` gia hạn bang cach `mv -f` mot file
#     tam de len — moi 60 giay mot inode moi, mtime luon duoc dat lai ve hien
#     tai, nen tuoi do duoc khong bao gio qua 1 phut trong khi nguong la 20.
#     Chinh co che gia hạn — thu duoc thiet ke de "job treo thi bao tri van tiep
#     tuc" — da xoa mat dau vet ma canh bao nay can doc.
#
#     So dung la `since` trong /api/health: run-weekly.sh dat LEASE_SINCE mot lan
#     o start_renewer roi giu nguyen qua moi lan gia hạn, nen no dung bang thoi
#     diem bat dau bao tri. Script nay von da doc `expires_in_sec` tu chinh
#     response do roi.
#
#     mtime VAN dung o nhanh don file het han o cuoi: luc do khong con ai gia hạn
#     nua nen mtime dung bang thoi diem gia hạn cuoi cung.
#
# (b) Mot lan curl hong tung du de restart app. Cua so nguy hiem la doan cuoi cua
#     job hang tuan: `cleanup` xoa giay phep RỒI moi `docker compose restart app`,
#     nen suot qua trinh boot + preload BGE-M3 thi health im lang VA khong con
#     flag — dung ca hai dieu kien cua nhanh restart ben duoi. No se giet dung
#     tien trinh moi dang nap model, tao ra lan restart thu hai lien tiep: chinh
#     xac kich ban ma bkfintech-index.service da bo `ExecStopPost restart` de
#     tranh. Lo do duoc bit o service file nhung van con nguyen o duong cron nay.
#
#     Nen phai hong HAI lan cach nhau $RETRY_SEC giay moi ket luan. Ca hai lan
#     nam trong cung mot lan chay cron, khong can luu trang thai giua cac lan —
#     giu dung tinh chat khong-trang-thai von co cua script.
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
# Doi bao lau roi hoi lai truoc khi ket luan app chet — xem (b) o tren. Phai du
# cho mot chu ky `docker compose restart app` HOAN TAT, ke ca phan preload
# BGE-M3, chu khong chi du cho container len. Dat rong tay vi hai huong sai lech
# nhau rat xa: doi lau thi app chet that duoc cuu cham them mot nhip, con doi
# ngan thi chinh script nay lam ca site chop them mot lan moi chu nhat.
RETRY_SEC="${RETRY_SEC:-90}"
# Chi dung trong cau canh bao, phai khop voi TIMEOUT_MIN cua run-weekly.sh. Ban
# truoc viet `${TIMEOUT_MIN:-15}` — mot bien KHONG he ton tai trong script nay,
# nen no luon in ra 15 ke ca sau khi ben kia da doi.
JOB_TIMEOUT_MIN="${JOB_TIMEOUT_MIN:-15}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

probe() { curl -fsS --max-time 10 "$URL" 2>/dev/null || echo ""; }

BODY=$(probe)

if [ -z "$BODY" ]; then
  # Khong phan hoi. Neu dang bao tri thi day co the la khoanh khac app restart
  # giua chu ky — khong restart de tranh dam vao job.
  if [ -f "$FLAG" ]; then
    log "health khong phan hoi nhung dang co giay phep bao tri — bo qua lan nay"
    exit 0
  fi

  log "health khong phan hoi va khong co giay phep — doi ${RETRY_SEC}s roi hoi lai"
  sleep "$RETRY_SEC"

  # Hoi lai CA HAI thu chu khong rieng curl: trong luc doi, job hang tuan co the
  # vua bat dau va vua cap giay phep.
  if [ -f "$FLAG" ]; then
    log "trong luc doi da xuat hien giay phep bao tri — bo qua lan nay"
    exit 0
  fi

  BODY=$(probe)
  if [ -z "$BODY" ]; then
    log "van khong phan hoi sau ${RETRY_SEC}s — restart app"
    docker compose restart app
    exit 1
  fi
  log "lan hoi lai da co phan hoi (nhieu kha nang vua boot xong) — khong restart"
fi

ACTIVE=$(printf '%s' "$BODY" | grep -o '"active":[a-z]*' | head -1 | cut -d: -f2)

if [ "$ACTIVE" = "true" ]; then
  # Con bao nhieu giay nua het han — app tinh san, khong phai doan tu mtime.
  LEFT=$(printf '%s' "$BODY" | grep -o '"expires_in_sec":-\?[0-9]*' | head -1 | cut -d: -f2)

  # Bao tri bat dau tu bao gio — xem (a) o dau file: PHAI doc `since`, khong duoc
  # stat mtime. Khong dung `cut -d: -f2` nhu hai dong tren vi gia tri la chuoi
  # ISO8601, ban than no da co dau hai cham ben trong.
  SINCE=$(printf '%s' "$BODY" | grep -o '"since":"[^"]*"' | head -1 | sed 's/^"since":"//; s/"$//')
  AGE_MIN=""
  if [ -n "$SINCE" ]; then
    SINCE_EPOCH=$(date -d "$SINCE" +%s 2>/dev/null || echo "")
    [ -n "$SINCE_EPOCH" ] && AGE_MIN=$(( ( $(date +%s) - SINCE_EPOCH ) / 60 ))
  fi

  # `since` la null khi app phai suy giay phep tu mtime (file hong, hoac doc
  # trung luc dang ghi) va khi gap loi he thong tep. Ca hai deu khong cho biet
  # bao tri bat dau tu bao gio. Noi thang la chua do duoc, thay vi im lang bo qua
  # — mot canh bao khong bao gio chay chinh la thu vua phai sua o day.
  if [ -z "$AGE_MIN" ]; then
    log "dang bao tri, giay phep con ${LEFT:-?}s — khong doc duoc 'since' nen chua kiem tra duoc job treo"
    exit 0
  fi

  if [ "$AGE_MIN" -ge "$STUCK_MIN" ]; then
    log "CANH BAO: bao tri da $AGE_MIN phut va giay phep VAN duoc gia hạn (con ${LEFT:-?}s)."
    log "  Nghia la job TREO chu khong chet, va watchdog $JOB_TIMEOUT_MIN phut cung da hong."
    log "  KHONG tu restart: job van dang giu model trong RAM. Can nguoi vao xem."
    exit 1
  fi
  log "dang bao tri $AGE_MIN phut, giay phep con ${LEFT:-?}s — binh thuong"
  exit 0
fi

# Khong bao tri. Neu file giay phep con nam do va da het han tu lau thi don di —
# no khong con hieu luc, chi gay hieu nham khi ai do nhin thu muc data/.
#
# Day la cho mtime VAN dung: khong con ai gia hạn nua, nen mtime dung bang thoi
# diem gia hạn cuoi cung.
if [ -f "$FLAG" ]; then
  AGE_MIN=$(( ( $(date +%s) - $(stat -c %Y "$FLAG" 2>/dev/null || echo 0) ) / 60 ))
  if [ "$AGE_MIN" -ge "$STALE_MIN" ]; then
    log "don file giay phep da het han $AGE_MIN phut truoc"
    rm -f "$FLAG" "$FLAG.tmp"
  fi
fi

log "ok"
