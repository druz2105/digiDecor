import {
  CategoryModelInterface,
  ProductImagesModelInterface,
  ProductModelInterface,
} from "../../lib/interfaces/products/product-model-interface";
import {DataTypes} from "sequelize";
import {sequelize} from "../../database/config";
import {getFileURL} from "./utils";

// Define Category model
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

// Define Product model
export const Product = sequelize.define<ProductModelInterface>("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  modelURL: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  dimensions: {
    type: DataTypes.STRING,
  },
});

// Define ProductImages model
export const ProductImages = sequelize.define<ProductImagesModelInterface>("ProductImages", {
  image: {
    type: DataTypes.STRING,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  }
});

Product.belongsTo(Category, {foreignKey: 'categoryId'});

Product.hasMany(ProductImages, { foreignKey: 'productId' });
ProductImages.belongsTo(Product, {foreignKey: 'productId'});

export class ProductService {
  filterableFields = ["name", "categoryID"];

  async findById(id) {
    return Product.findByPk(id);
  }

  async findAll(){
    return Product.findAll()
  }

  async findByCategory(categoryId: number) {
    const products = await Product.findAll({ where: { categoryId: categoryId }, include: [{
        model: ProductImages,
        attributes: ['image'],
        limit: 1
      }],
    });

    return products.map((product) => ({
      ...product.toJSON(), // Convert the category object to JSON format
      imageURL: getFileURL(product.ProductImages[0].image), // Add the image URL
    }));
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

  async findById(id) {
    return Category.findByPk(id);
  }
}

export class ProductImageService {
  async findByProductId(productId: number) {
    await ProductImages.findAll({ where: { productId: productId } });
    return {}
  }

}

