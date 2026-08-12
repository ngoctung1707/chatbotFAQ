export type Role = 'student' | 'teacher' | 'business'

/**
 * Gốc URL của toàn bộ site cyber-clinic — mọi route con nằm dưới đây:
 * /about, /learning-materials/[slug], /video/[slug].
 *
 * Dời từ layout/Header.tsx sang đây (Header vẫn re-export nên không chỗ gọi nào
 * phải sửa): widget chat toàn site cần đúng chuỗi này để biết chỗ nào phải tự
 * ẩn đi (xem components/chatbot/SiteChatbot.tsx), mà Header là 'use client' và
 * import ba file PNG logo — import nó chỉ để lấy một chuỗi sẽ kéo cả ba logo
 * vào bundle của MỌI trang.
 */
export const BASE_PATH = '/research/r&d-funding-projects/cyber-clinic'

export const LINK_FORM_STUDENT = 'https://forms.gle/wivCjyLMojVZ8SGX7'

export const LINK_FORM_TEACHER = 'https://forms.gle/DwsffL5q2k2fgcG6A'

export const LINK_FORM_BUSINESS = 'https://forms.gle/2KbJ3KqjNrzH7L3h6'
