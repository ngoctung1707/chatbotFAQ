#!/usr/bin/env bash
# MUC 5.7 — sao luu hai file quyet dinh do dai cua so bao tri hang tuan.
#
#   bash scripts/crawl/backup-state.sh
#
# embeddings.cache.jsonl va crawl_state.json khong phai du lieu "co thi tot".
# Mat cache thi lan chay sau phai embed lai toan bo kho: cua so bao tri nhay tu
# GIAY len PHUT. Mat state thi crawler coi moi thu la moi va keo theo dung hau
# qua do. Ca hai deu KHONG tai tao duoc tu website — chung la lich su, khong
# phai anh chup hien tai.
#
# store.json thi khong can sao o day: pha C da giu 3 ban co dau thoi gian.
set -uo pipefail

DEST="${BACKUP_DIR:-data/backups}"
KEEP="${KEEP_BACKUPS:-8}"
STAMP=$(date '+%Y%m%d-%H%M%S')

mkdir -p "$DEST"
n=0
for f in data/embeddings.cache.jsonl data/crawl_state.json data/qa-baseline.json data/normalize-baseline.json; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  cp "$f" "$DEST/${base}.${STAMP}"
  n=$((n+1))
done
echo "da sao luu $n file vao $DEST (moc $STAMP)"

# Don ban cu, giu $KEEP moc gan nhat cho MOI file.
for base in embeddings.cache.jsonl crawl_state.json qa-baseline.json normalize-baseline.json; do
  ls -1t "$DEST/$base".* 2>/dev/null | tail -n +$((KEEP+1)) | while read -r old; do rm -f "$old"; done
done

du -sh "$DEST" 2>/dev/null | awk '{print "  thu muc sao luu:", $1}'
