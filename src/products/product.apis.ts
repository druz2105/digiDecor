import {
  CategoryService,
  LikedProductModel,
  LikedProductService,
  ProductService,
} from "./product.models";

const categoryService = new CategoryService();
const productService = new ProductService();
const likedProductService = new LikedProductService();
// const productImgService = new ProductImageService();
export const getCategories = async (_request, response) => {
  try {
    const categories = await categoryService.findAll();
    console.log(categories, "categories>>>>>>>>>>>");
    return response.status(200).json(categories);
  } catch (err) {
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

export const getAllProduct = async (request, response) => {
  try {
    const { categoryId } = request.query;
    if (categoryId) {
      console.log(categoryId, "categoryId:::>>>>>>>>>>>>>>>>>>>>>>>");
      const products = await productService.findByCategory(categoryId);
      return response.status(200).json(products);
    } else {
      const products = await productService.findAll();
      return response.status(200).json(products);
    }
  } catch (err) {
    console.log(err.message);
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

export const getProductById = async (request, response) => {
  try {
    const { id } = request.params;
    const product = await productService.findById(id);
    const likedImages = await LikedProductModel.findOne({
      where: {
        productId: id,
        userId: request.user.id,
      },
    });
    return response
      .status(200)
      .json({ ...product, likedProduct: !!likedImages });
  } catch (err) {
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

export const saveLikeProduct = async (request, response) => {
  try {
    console.log(request.user, "request.user>>>>>>>>>>>>.");
    const { id } = request.user;
    const { productId } = request.body;
    const likedProduct = await likedProductService.saveLikeProduct({
      userId: id,
      productId: productId,
    });
    await likedProduct.save();
    return response
      .status(201)
      .json({ message: "Product Is added to like product list" });
  } catch (err) {
    console.log(err.message);
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

export const removeLikeProduct = async (request, response) => {
  try {
    const { id } = request.user;
    const { productId } = request.body;
    const productRemove = await likedProductService.removeLikeProduct({
      userId: id,
      productId: productId,
    });
    return response.status(201).json({
      message: productRemove
        ? "Product Is Removed."
        : "Error while removing product",
    });
  } catch (err) {
    console.log(err.message);
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};
