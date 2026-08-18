#!/usr/bin/env bash
# Thu thap so do RAM that tren may chu vien — muc 0.3 cua ke hoach cap nhat du
# lieu hang tuan.
#
# Vi sao can: con so ~2,2GB do tren may dev Windows khong dung de quy hoach
# duoc. Dev mode (Turbopack + HMR + bien dich admin Payload) thoi phong khoang
# 500MB–1GB, con may chu lai lech NGUOC lai: nhieu core hon => ONNX Runtime tao
# nhieu arena hon, va MongoDB chay cung may tu lay ~50% RAM host lam cache
# WiredTiger va khong tra lai. Hai chieu trieu tieu nhau bao nhieu thi khong
# doan duoc, nen phai do tai cho.
#
#   bash scripts/measure-server-ram.sh | tee ram-report.txt
#
# Khong can root. Moi buoc deu tu bo qua neu thieu lenh, de mot loi khong lam
# hong ca lan do.
set -u

line() { printf '\n===== %s =====\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

# Container id, thu ca docker compose v2 lan v1 lan ten tho.
cid() {
  local n="$1" id=""
  id=$(docker compose ps -q "$n" 2>/dev/null | head -1)
  [ -z "$id" ] && id=$(docker-compose ps -q "$n" 2>/dev/null | head -1)
  [ -z "$id" ] && id=$(docker ps -q --filter "name=$n" 2>/dev/null | head -1)
  printf '%s' "$id"
}

line "Thoi diem do"
date

line "Phan cung va bo nho"
have nproc && echo "So core: $(nproc)"
if have free; then free -h; else grep -E 'MemTotal|MemAvailable' /proc/meminfo; fi

line "Dung luong dia noi dat volume"
df -h /home/hust/bkfintech 2>/dev/null || df -h /

if ! have docker; then
  line "docker khong co trong PATH — bo qua phan container"
  exit 0
fi

line "docker stats (mot lan chup, khong stream)"
docker stats --no-stream \
  --format 'table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}'

line "RSS that cua tien trinh node trong container app"
APP=$(cid app)
if [ -n "$APP" ]; then
  docker exec "$APP" sh -c 'grep -E "VmRSS|VmPeak|VmHWM" /proc/1/status' \
    2>/dev/null || echo "khong doc duoc /proc/1/status"
else
  echo "khong tim thay container app"
fi

line "Cache WiredTiger that cua MongoDB"
DB=$(cid db)
if [ -n "$DB" ]; then
  docker exec "$DB" mongo --quiet --eval '
    var c = db.serverStatus().wiredTiger.cache;
    print("dang dung (MB): " + Math.round(c["bytes currently in the cache"]/1048576));
    print("toi da   (MB): " + Math.round(c["maximum bytes configured"]/1048576));
  ' 2>/dev/null || echo "khong goi duoc mongo shell (mongo 4.4 dung lenh 'mongo')"
else
  echo "khong tim thay container db"
fi

line "Hai so con lai phai do tay"
cat <<'NOTE'
1) RAM dinh + thoi luong cua job embed:

     /usr/bin/time -v npm run build-index

   Doc hai dong: "Maximum resident set size (kbytes)" -> dat MemoryMax (muc 6.5)
   va "Elapsed (wall clock) time" -> uoc luong cua so bao tri (muc 4.2).

   CHAN: image runner KHONG chua scripts/ lan tsx. Dockerfile chi copy
   .next/standalone + .next/static + public, nen lenh tren KHONG chay duoc bang
   `docker compose exec app`. Phai chay tren host co node + node_modules day du,
   hoac dung mot image indexer rieng (xem muc 4.5).

2) RAM luc dang phuc vu cau hoi:
   gui mot request toi /api/chat roi chay lai script nay trong luc no dang tra
   loi. Activation luc suy luan cong them khoang 50-150MB so voi luc ranh.
NOTE
