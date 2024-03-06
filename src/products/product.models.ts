import {
  CategoryModelInterface,
  ProductModelInterface,
} from "../../lib/interfaces/products/product-model-interface";
import { DataTypes } from "sequelize";
import { sequelize } from "../../database/config";
import { getFileURL } from "./utils";

export const Product = sequelize.define<ProductModelInterface>("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelURL: {
    type: DataTypes.STRING,
  },
  categoryID: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  dimensions: {
    type: DataTypes.STRING,
  },
});

export const Category = sequelize.define<CategoryModelInterface>("Category", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
});

export class ProductService {
  filterableFields = ["name", "categoryID"];

  findById(id) {
    return Product.findByPk(id);
  }

  findByCategory(categoryID) {
    return Product.findAll({ where: { categoryID: categoryID } });
  }
}

export class CategoryService {
  async findAll() {
    const categories = await Category.findAll();

    return categories.map((category) => ({
      ...category.toJSON(), // Convert the category object to JSON format
      imageURL: getFileURL(category.image), // Add the image URL
    }));
  }

  findById(id) {
    return Category.findByPk(id);
  }
}
