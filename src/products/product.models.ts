import {
  CategoryModelInterface,
  LikedProductModelInterface,
  ProductImagesModelInterface,
  ProductModelInterface,
} from "../../lib/interfaces/products/product-model-interface";
import {DataTypes} from "sequelize";
import {sequelize} from "../../database/config";
import {getFileURL} from "./utils";
import {UserModel} from "@users/user.models";

// Define CategoryModel model
export const CategoryModel = sequelize.define<CategoryModelInterface>("Category", {
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

// Define ProductModel model
export const ProductModel = sequelize.define<ProductModelInterface>("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CategoryModel,
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

// Define ProductImagesModel model
export const ProductImagesModel = sequelize.define<ProductImagesModelInterface>("ProductImages", {
  image: {
    type: DataTypes.STRING,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ProductModel,
      key: 'id'
    }
  }
});

ProductModel.belongsTo(CategoryModel, {foreignKey: 'categoryId'});

ProductModel.hasMany(ProductImagesModel, { as: 'images', foreignKey: 'productId' });
ProductImagesModel.belongsTo(ProductModel, {foreignKey: 'productId'});

export const LikedProductModel = sequelize.define<LikedProductModelInterface>("LikedProduct", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ProductModel,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'productId']
    }
  ]
});

LikedProductModel.belongsTo(ProductModel, {foreignKey: 'productId'});
LikedProductModel.belongsTo(UserModel, {foreignKey: 'userId'});

export class ProductService {
  filterableFields = ["name", "categoryID"];

  async findById(id: number) {
    const product = await ProductModel.findByPk(id, {include: [{
        model: ProductImagesModel,
        attributes: ['image'],
        as: 'images'
      }],});
    if (product){
      const imageURLs = product.images.map((image: ProductImagesModelInterface) => {
        return getFileURL(image.image);
      });
      return {
        ...product.toJSON(),
        imageURLs: imageURLs

      }
    }
    throw Error("No ProductModel Found")
  }

  async findAll(){
    return ProductModel.findAll()
  }

  async findByCategory(categoryId: number) {
    const products = await ProductModel.findAll({ where: { categoryId: categoryId }, include: [{
        model: ProductImagesModel,
        attributes: ['image'],
        as: 'images',
        limit: 1
      }],
      order: [['id', 'ASC']],
    });

    return products.map((product) => ({
      ...product.toJSON(), // Convert the category object to JSON format
      imageURL: product.images.length ? getFileURL(product.images[0].image) : '', // Add the image URL
    }));
  }
}

export class CategoryService {
  async findAll() {
    const categories = await CategoryModel.findAll();

    return categories.map((category) => ({
      ...category.toJSON(), // Convert the category object to JSON format
      imageURL: getFileURL(category.image), // Add the image URL
    }));
  }

  async findById(id) {
    return CategoryModel.findByPk(id);
  }
}


export class LikedProductService {
  async saveLikeProduct(data: any): Promise<LikedProductModelInterface> {
    try {
      return await LikedProductModel.create(data);
    } catch (error) {
      throw error;
    }
  }

  async removeLikeProduct(data: { userId: string, productId: string }): Promise<boolean> {
    try {
      await LikedProductModel.destroy({ where: data} );
      return true
    } catch (error) {
      throw error;
    }
  }

  async likedProductByUser(userId: string): Promise<LikedProductModelInterface[]> {
    try {
      const likedProducts = await LikedProductModel.findAll({ where: { userId: userId } });
      return likedProducts.map((likedProduct: any) => likedProduct.toJSON()) as LikedProductModelInterface[];
    } catch (error) {
      throw error;
    }
  }
}