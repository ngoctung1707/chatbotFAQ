#!/usr/bin/env bash
# Job cap nhat du lieu hang tuan — noi ca ba pha cua muc 4.
#
#   bash scripts/crawl/run-weekly.sh
#   bash scripts/crawl/run-weekly.sh --dry-run
#
# Trinh tu, va vi sao no nhu vay:
#
#   PHA A  crawl + diff          app CHAY BINH THUONG, khong nap model
#   -- neu khong co gi doi thi DUNG O DAY, khong bao tri phut nao (muc 4.4)
#   cap giay phep + restart      app boot lai KHONG preload model (~400MB)
#   cho app xac nhan nha RAM     thay vi tin rang lenh restart da tra ve
#   PHA B  embed phan da doi     pha duy nhat can model
#   PHA C  IDF + ghi store       khong can model
#   cong QA                      truot thi khoi phuc store cu
#   thu hoi giay phep + restart  app boot lai, nap model va store MOI
#
# Diem mau chot cua muc 4.5: KHONG dung container. Service `app` phuc vu toan
# bo website, dung no la ca fintech.hust.edu.vn offline chu khong rieng chatbot.
#
# ─── GIAY PHEP CO HAN, KHONG PHAI CO TON TAI ─────────────────────────────────
#
# Ban dau day la mot file rong: co file = dang bao tri. Nhung file rong khong
# noi duoc "job con song hay da chet", nen healthcheck phai hoi kernel bang
# `kill -0 $PID` — va cau hoi do TRA LOI SAI khi cron chay khac user: kernel bao
# EPERM, script hieu thanh "da chet", roi go co va restart app ngay giua luc pha
# B dang embed. Hai ban model trong RAM, dung luc RAM cang nhat.
#
# Gio file mang mot HAN DUNG, va job phai gia hạn deu. Ngung gia hạn (chet,
# reboot, bi kill -9) thi han tu het va app tu tro lai phuc vu — khong can ai
# can thiep, khong can quyen gi.
set -uo pipefail

DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="--dry-run"

FLAG="data/maintenance.flag"
LOCK="data/.weekly.lock"
COMPOSE="docker compose"
HEALTH_URL="${HEALTH_URL:-http://localhost:3003/api/health}"

# Han 5 phut, gia hạn moi 60 giay — chiu duoc 5 nhip tre lien tiep. Gia hạn dien
# ra dung luc may cang nhat (dang embed, RAM sat tran) nen bien do nay la co y.
# Hai huong sai lech nhau rat xa: han qua ngan -> app tuong job chet -> nap model
# -> co the OOM giua dot cap nhat; han qua dai -> chatbot nghi them vai phut luc
# 2h sang chu nhat. Phan van thi nghieng ve han dai hon.
LEASE_SEC="${LEASE_SEC:-300}"
RENEW_SEC="${RENEW_SEC:-60}"

# MUC 5.4 — watchdog. Qua nguong nay thi kill, thu hoi giay phep, bat lai app
# voi store cu. Kho cu mot tuan vo hai; chatbot ket o che do bao tri mot ngay
# ruoi thi khong.
TIMEOUT_MIN="${TIMEOUT_MIN:-15}"

RENEW_PID=""

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

restart_app() {
  if [ -n "$DRY_RUN" ]; then log "(dry-run) bo qua restart app"; return 0; fi
  $COMPOSE restart app || log "CANH BAO: restart app that bai"
}

# MUC 6.1 — MAY CHU DANG CHAY UTC. In ca hai moc gio o dong dau log, va canh bao
# neu gio Viet Nam khong nam trong khung 1h-4h sang. Day la cach duy nhat phat
# hien "lich chay nham 9h sang chu nhat" ma khong phai cho ai do bao lai.
TZ_VN="Asia/Ho_Chi_Minh"
VN_HOUR=$(TZ="$TZ_VN" date '+%-H')
log "bat dau — UTC $(date -u '+%F %H:%M:%S') | VN $(TZ="$TZ_VN" date '+%F %H:%M:%S')"
if [ "$VN_HOUR" -lt 1 ] || [ "$VN_HOUR" -gt 4 ]; then
  log "CANH BAO: dang chay luc ${VN_HOUR}h gio Viet Nam, ngoai khung 1h-4h sang."
  log "  Kiem tra Timezone= trong systemd timer, hoac CRON_TZ trong crontab."
fi

# Ghi giay phep NGUYEN TU: ghi file tam roi doi ten. Ghi de truc tiep se cat file
# ve rong truoc khi noi dung moi kip vao, va app doc dung khoanh khac do se thay
# file rong.
write_lease() {
  local now expires
  now=$(date -Iseconds)
  expires=$(date -Iseconds -d "+${LEASE_SEC} seconds" 2>/dev/null \
    || date -Iseconds -v "+${LEASE_SEC}S" 2>/dev/null)
  printf '{"message":"Chatbot dang cap nhat du lieu, ban quay lai sau it phut nhe.","since":"%s","expires_at":"%s"}\n' \
    "${LEASE_SINCE:-$now}" "$expires" > "$FLAG.tmp"
  mv -f "$FLAG.tmp" "$FLAG"
}

start_renewer() {
  LEASE_SINCE=$(date -Iseconds)
  export LEASE_SINCE
  write_lease
  # Vong lap gia hạn chay nen. Co y dat trong shell chu KHONG de embed.ts tu gia
  # hạn sau moi N chunk: neu embed treo ma van giu model, ta muon bao tri TIEP
  # TUC. Thu can chung minh la "tien trinh con song va con giu RAM", khong phai
  # "no con lam duoc viec".
  ( while :; do sleep "$RENEW_SEC"; write_lease || exit 0; done ) &
  RENEW_PID=$!
  log "cap giay phep — han ${LEASE_SEC}s, gia hạn moi ${RENEW_SEC}s (renewer pid $RENEW_PID)"
}

stop_renewer() {
  [ -n "$RENEW_PID" ] && kill "$RENEW_PID" 2>/dev/null
  RENEW_PID=""
}

# Cho app xac nhan DA NHA RAM, thay vi tin rang `docker compose restart` tra ve
# la xong. Lenh do tra ve khong co nghia tien trinh cu da chet han — ma tien
# trinh cu thi dang giu ~2GB.
wait_model_unloaded() {
  if [ -n "$DRY_RUN" ]; then return 0; fi
  local i=0
  while [ $i -lt 60 ]; do
    if curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null | grep -q '"model_loaded":false'; then
      log "app da nha model (sau ${i}s)"
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  log "CANH BAO: sau 60s app van chua bao model_loaded=false — chay tiep, nhung RAM co the cham tran."
  return 0
}

# Bay EXIT: du script chet o dau, giay phep PHAI duoc thu hoi va app phai duoc
# bat lai. Kich ban xau nhat ma no chan lai la job chet luc 2h15 roi chatbot ket
# o che do bao tri toi sang thu Hai.
#
# `kill -- -$$` giet CA NHOM tien trinh, khong chi chinh no. Neu script chet ma
# tien trinh tsx con van dang embed, giay phep se het han va app se nap lai model
# trong khi ban cu van con — dung cai ta dang tranh.
cleanup() {
  local code=$?
  stop_renewer
  if [ -f "$FLAG" ]; then
    log "thu hoi giay phep (thoat voi ma $code)"
    rm -f "$FLAG" "$FLAG.tmp"
    restart_app
  fi
  rm -f "$LOCK"
  kill -- -$$ 2>/dev/null
  exit $code
}
trap cleanup EXIT INT TERM

# Chong chay chong: mot lan chay treo khong duoc phep de lan sau chay de len.
if [ -e "$LOCK" ]; then
  log "DA CO mot lan chay khac dang giu $LOCK — thoat."
  trap - EXIT
  exit 1
fi
echo $$ > "$LOCK"

log "PHA A — crawl va diff (app van phuc vu binh thuong)"
node scripts/crawl/index.mjs $DRY_RUN
A_STATUS=$?
if [ $A_STATUS -ne 0 ]; then
  log "pha A bao loi hoac selector vo — KHONG vao bao tri, giu nguyen chi muc."
  exit $A_STATUS
fi

# Muc 4.4 — con so quyet dinh co phai bao tri hay khong.
TO_EMBED=$(npx tsx scripts/crawl/cache-report.ts 2>/dev/null | awk '/PHAI EMBED/ {print $3}')
TO_EMBED=${TO_EMBED:-0}
log "can embed: $TO_EMBED chunk"

if [ "$TO_EMBED" -eq 0 ]; then
  log "khong co gi doi — BO QUA hoan toan pha B va C."
  log "tuan nay chatbot khong tat phut nao."
  exit 0
fi

if [ -n "$DRY_RUN" ]; then
  log "(dry-run) dung truoc khi vao bao tri"
  exit 0
fi

start_renewer
restart_app
wait_model_unloaded

# `timeout` bao trum ca hai pha nang. Khong dat rieng tung pha vi thu can chan
# la TONG thoi gian bao tri, chu khong phai pha nao cham.
log "PHA B — embed $TO_EMBED chunk (pha duy nhat can model, tran $TIMEOUT_MIN phut)"
timeout "${TIMEOUT_MIN}m" npx tsx scripts/crawl/embed.ts
case $? in
  0) ;;
  124) log "WATCHDOG: pha B qua $TIMEOUT_MIN phut — bi kill. Giu store cu."; exit 1 ;;
  *)  log "pha B THAT BAI — giu store cu."; exit 1 ;;
esac

log "PHA C — dung lai IDF va ghi store (khong can model)"
npx tsx scripts/crawl/build-store.ts || { log "pha C THAT BAI — giu store cu."; exit 1; }

# MUC 5.3 — cong chan cuoi cung. Store moi da nam o vi tri phuc vu, nhung app
# van chua nap lai no (chua restart), nen van con quay dau duoc.
#
# CHATBOT_REWRITE=0: cong nay chi do TRUY HOI. De rewrite bat thi moi cau goi
# LLM, ket qua khong tat dinh va moc so sanh mat y nghia.
log "cong chat luong truy hoi"
if ! CHATBOT_REWRITE=0 npx tsx scripts/crawl/qa-gate.ts; then
  log "QA GATE TRUOT — khoi phuc store cu va giu nguyen."
  PREV=$(ls -1t data/faiss_index_js/store.*.json 2>/dev/null | sed -n 2p)
  if [ -n "$PREV" ]; then
    cp "$PREV" data/faiss_index_js/store.json
    log "da khoi phuc tu $PREV"
  else
    log "CANH BAO: khong tim thay ban truoc de khoi phuc."
  fi
  exit 1
fi

log "sao luu state va cache"
bash scripts/crawl/backup-state.sh || log "CANH BAO: sao luu that bai"

log "xong — bay EXIT se thu hoi giay phep va restart app voi store moi"
