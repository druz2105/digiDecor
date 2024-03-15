import {Model, ModelAttributes} from "sequelize";

export interface ProductModelInterface extends Model<any, ModelAttributes> {
  name: string;
  modelURL: string;
  categoryID: string;
  description: string;
  dimensions: string;
  [key: string]: any
}

export interface CategoryModelInterface extends Model<any, ModelAttributes> {
  name: string;
  description: string;
  image: string;
}

export interface ProductImagesModelInterface extends Model<any, ModelAttributes> {
  productId: string;
  image: string;
}

export interface LikedProductModelInterface extends Model<any, ModelAttributes> {
  productId: string;
  userId: string;
}
