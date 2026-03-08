import { Query } from 'mongoose';

const EXCLUDE_FIELDS = [
  "searchTerm", "sortBy", "sortOrder", "fields", "page", "limit", "dateRange"
] as const;

type ExcludeFieldsType = typeof EXCLUDE_FIELDS[number];

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;
  private baseConditions: Record<string, any> = {};  // Base conditions
  private filterConditions: Record<string, any> = {};  // Dynamic filters

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // Base conditions set করো (isDeleted: false)
  setBaseConditions(conditions: Record<string, any>): this {
    this.baseConditions = conditions;
    console.log("🏗️  Base Conditions:", conditions);
    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm?.trim();
    console.log("🔍 Search Term:", searchTerm);
    
    if (searchTerm) {
      this.filterConditions.$or = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" }
      }));
      console.log("🔍 $or Added");
    }
    return this;
  }

  filter(): this {
    const filterObj: Record<string, any> = { ...this.query };
    EXCLUDE_FIELDS.forEach((field: ExcludeFieldsType) => delete filterObj[field]);
    
    console.log("🧩 Raw Filter:", filterObj);
    Object.assign(this.filterConditions, filterObj);
    console.log("🧩 Filter Conditions:", this.filterConditions);
    return this;
  }

  dateRange(): this {
    const now = new Date();
    const range = this.query.dateRange as "weekly" | "monthly" | "yearly";

    if (range) {
      let startDate: Date;
      switch (range) {
        case "weekly": 
          startDate = new Date(now); 
          startDate.setDate(now.getDate() - 7); 
          break;
        case "monthly": 
          startDate = new Date(now); 
          startDate.setMonth(now.getMonth() - 1); 
          break;
        case "yearly": 
          startDate = new Date(now); 
          startDate.setFullYear(now.getFullYear() - 1); 
          break;
        default: 
          return this;
      }
      this.filterConditions.createdAt = { $gte: startDate, $lte: new Date() };
      console.log("📅 Date Filter Added");
    }
    return this;
  }

  // 🔥 Fixed: Single find() call
  applyAllFilters(): this {
    const finalConditions = { 
      ...this.baseConditions, 
      ...this.filterConditions 
    };
    console.log("🔥 Final MongoDB Query:", JSON.stringify(finalConditions, null, 2));
    
    this.modelQuery = this.modelQuery.find(finalConditions);
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log(`📄 Page: ${page}, Skip: ${skip}, Limit: ${limit}`);
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  sort(): this {
    const sortBy = this.query.sortBy || "createdAt";
    const sortOrder = this.query.sortOrder === "asc" ? 1 : -1;
    
    console.log(`🔄 Sort: ${sortBy} (${sortOrder === 1 ? "ASC" : "DESC"})`);
    this.modelQuery = this.modelQuery.sort({ [sortBy]: sortOrder });
    return this;
  }

  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "-__v";
    console.log("📋 Select Fields:", fields);
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async build() {
    console.log("🚀 Executing...");
    return await this.modelQuery.exec();
  }

  async getMeta() {
    // Fixed count: exact same conditions
    const countQuery = this.modelQuery.model.find({ 
      ...this.baseConditions, 
      ...this.filterConditions 
    });
    const total = await countQuery.countDocuments();
    
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}
