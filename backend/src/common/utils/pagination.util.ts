export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FindManyArgs {
  where?: any;
  orderBy?: any;
  include?: any;
  select?: any;
}

export async function paginate<T>(
  prismaModel: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: { where?: any }) => Promise<number>;
  },
  args: FindManyArgs,
  pagination: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = pagination;
  const { where, orderBy, include, select } = args;

  const [data, total] = await Promise.all([
    prismaModel.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      ...(orderBy && { orderBy }),
      ...(include && { include }),
      ...(select && { select }),
    }),
    prismaModel.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
