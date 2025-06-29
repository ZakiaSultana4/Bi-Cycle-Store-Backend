/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            }) as FilterQuery<T>
        ),
      });
    }

    return this;
  }
filter() {
  const queryObj = { ...this.query };

  const excludeFields = [
    "searchTerm",
    "sort",
    "limit",
    "page",
    "fields",
    "minPrice",
    "maxPrice",
  ];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Initialize final filter object that will be passed to find()
  const finalFilter: Record<string, any> = { ...queryObj };


  // Validate riderType and add if valid
  if (queryObj.riderType) {
    const validRiderTypes = ["Men", "Women", "Kids"];
    if (validRiderTypes.includes(queryObj.riderType as string)) {
      finalFilter.riderType = queryObj.riderType;
    } else {
      // Invalid riderType, remove it
      delete finalFilter.riderType;
    }
  }

  // Numeric filtering (price)
  if (this.query.minPrice || this.query.maxPrice) {
    finalFilter.price = {};
    if (this.query.minPrice) finalFilter.price.$gte = Number(this.query.minPrice);
    if (this.query.maxPrice) finalFilter.price.$lte = Number(this.query.maxPrice);
  }

  this.modelQuery = this.modelQuery.find(finalFilter as FilterQuery<T>);

  return this;
}


  

  sort() {
    const sort =
      (this.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    // console.log(this.query?.page,this.query?.limit)
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;