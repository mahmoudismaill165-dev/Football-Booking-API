import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateFieldData {
  name: string;
  description?: string;
  address: string;
  pricePerHour: number;
  ownerId: number;
}

export async function createField(data: CreateFieldData) {
  const field = await db.orm.public.Field.create({
    name: data.name,
    description: data.description,
    address: data.address,
    pricePerHour: data.pricePerHour,
    ownerId: data.ownerId,
  });

  return field;
}

export async function getAllFields(
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  page: number = 1,
  limit: number = 10,
  sort?: string
) {
  const offset = (page - 1) * limit;

  let query = db.orm.public.Field;

  /*
   * SEARCH
   */
  if (search) {
    const byName = await db.orm.public.Field
      .where((field) =>
        field.name.ilike(`%${search}%`)
      )
      .all();

    const byAddress = await db.orm.public.Field
      .where((field) =>
        field.address.ilike(`%${search}%`)
      )
      .all();

    const fieldIds = new Set<number>();

    for (const field of byName) {
      fieldIds.add(field.id);
    }

    for (const field of byAddress) {
      fieldIds.add(field.id);
    }

    const ids = Array.from(fieldIds);

    if (ids.length === 0) {
      return {
        fields: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    query = query.where((field) =>
      field.id.in(ids)
    );
  }

  /*
   * MIN PRICE
   */
  if (minPrice !== undefined) {
    query = query.where((field) =>
      field.pricePerHour.gte(minPrice)
    );
  }

  /*
   * MAX PRICE
   */
  if (maxPrice !== undefined) {
    query = query.where((field) =>
      field.pricePerHour.lte(maxPrice)
    );
  }

  /*
   * SORTING
   */
  if (sort === "priceAsc") {
    query = query.orderBy((field) =>
      field.pricePerHour.asc()
    );
  } else if (sort === "priceDesc") {
    query = query.orderBy((field) =>
      field.pricePerHour.desc()
    );
  }

  /*
   * TOTAL
   */
  const allFields = await query.all();

  const total = allFields.length;
  /*
   * PAGINATION
   */
  const fields = await query
    .offset(offset)
    .limit(limit)
    .all();

  const totalPages = Math.ceil(
    total / limit
  );

  return {
    fields,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getFieldById(id: number) {
  const field = await db.orm.public.Field
    .where({ id })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  return field;
}