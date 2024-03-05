import { Model, ModelAttributes } from "sequelize";

export interface ProductModelInterface extends Model<any, ModelAttributes> {
  name: string;
  modelURL: string;
  categoryID: string;
  description: string;
  dimensions: string;
}

export interface CategoryModelInterface extends Model<any, ModelAttributes> {
  name: string;
  description: string;
  image: string;
}
