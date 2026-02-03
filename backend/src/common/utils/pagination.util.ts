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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderBy?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  include?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select?: any;
}

export async function paginate<T>(
  prismaModel: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: (args: any) => Promise<T[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count: (args: { where?: any }) => Promise<number>;
  },
  args: FindManyArgs,
  pagination: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = pagination;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { where, orderBy, include, select } = args;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [data, total] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    prismaModel.findMany({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      skip: (page - 1) * limit,
      take: limit,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(orderBy && { orderBy }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(include && { include }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(select && { select }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
