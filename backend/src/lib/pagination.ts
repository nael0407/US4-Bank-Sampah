export function buildPagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function skipFor(page: number, limit: number) {
  return (page - 1) * limit;
}
