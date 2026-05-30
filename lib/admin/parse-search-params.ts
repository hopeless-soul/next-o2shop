export function parsePagination(params: Record<string, string>) {
  return {
    page: Math.max(1, Number(params.page ?? '1')),
    limit: Math.min(100, Math.max(1, Number(params.limit ?? '20'))),
  }
}
