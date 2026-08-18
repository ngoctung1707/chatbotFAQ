/**
 * MỤC 6.2 — báo cáo lần chạy gần nhất của job cập nhật dữ liệu.
 *
 * Không ai thức lúc 2h sáng. Đây là thứ để sáng chủ nhật liếc một cái là biết
 * đêm qua ổn không: chạy lúc mấy giờ, bảo trì bao lâu, kiểm bao nhiêu nguồn,
 * thêm/sửa/xoá bao nhiêu chunk, có selector nào vỡ, có route nào chờ duyệt.
 *
 * Chỉ ĐỌC file mà job ghi ra. Cố ý không tự tính lại gì: nếu route này tính
 * khác job thì con số hiển thị sẽ mâu thuẫn với thứ thật sự đã xảy ra.
 */
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { INDEX_DIR } from '@/lib/chatbot/config'
import { readMaintenance } from '@/lib/chatbot/maintenance'

export const runtime = 'nodejs'
// Báo cáo đổi sau mỗi lần job chạy; bản cache sẽ đóng băng ở thời điểm build.
export const dynamic = 'force-dynamic'

const DATA_DIR = path.join(INDEX_DIR, '..')
const PLAN = path.join(DATA_DIR, 'crawl-plan.json')
const PENDING = path.join(DATA_DIR, 'pending-routes.json')

async function readJson<T>(p: string): Promise<T | null> {
  if (!existsSync(p)) return null
  try {
    return JSON.parse(await readFile(p, 'utf-8')) as T
  } catch {
    return null
  }
}

interface Plan {
  started_at?: string
  finished_at?: string
  change_rate?: number
  aborted?: string
  totals?: Record<string, number>
  sources?: { source_id: string; state: string; added?: number; changed?: number; removed?: number }[]
  errors?: { source_id: string; message: string }[]
  broken?: { source_id: string; lang: string; error: string }[]
  gone?: { source_id: string; url: string }[]
}

export async function GET() {
  const plan = await readJson<Plan>(PLAN)
  const pending = await readJson<{ routes?: unknown[] }>(PENDING)

  if (!plan) {
    return NextResponse.json({
      ok: false,
      reason: 'chua co lan chay nao — data/crawl-plan.json khong ton tai',
      maintenance: readMaintenance(),
    })
  }

  const durationSec =
    plan.started_at && plan.finished_at
      ? Math.round((Date.parse(plan.finished_at) - Date.parse(plan.started_at)) / 1000)
      : null

  const sources = plan.sources ?? []
  // Ba con số đáng nhìn nhất, gom sẵn để trang admin không phải tự suy diễn.
  const summary = {
    total: sources.length,
    ok: sources.filter((s) => s.state === 'ok').length,
    skipped: sources.filter((s) => s.state === 'skipped').length,
    failed: sources.filter((s) => ['unknown', 'error', 'broken'].includes(s.state)).length,
  }

  return NextResponse.json({
    ok: !plan.aborted && !(plan.errors?.length || plan.broken?.length),
    aborted: plan.aborted ?? null,
    started_at: plan.started_at ?? null,
    finished_at: plan.finished_at ?? null,
    duration_sec: durationSec,
    change_rate: plan.change_rate ?? null,
    totals: plan.totals ?? {},
    sources: summary,
    // Ba danh sách này là thứ cần người xử lý, nên trả nguyên vẹn.
    broken: plan.broken ?? [],
    errors: plan.errors ?? [],
    gone: plan.gone ?? [],
    pending_routes: pending?.routes?.length ?? 0,
    maintenance: readMaintenance(),
  })
}
