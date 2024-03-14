import {CategoryService, ProductService} from "./product.models";

const categoryService = new CategoryService();
const productService = new ProductService();
// const productImgService = new ProductImageService();
export const getCategories = async (_request, response) => {
  try {
    const categories = await categoryService.findAll();
    console.log(categories, 'categories>>>>>>>>>>>')
    return response.status(200).json(categories);
  } catch (err) {
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

export const getProductByCategory = async (request, response) => {
  try {
    const { categoryId } = request.query;
    const products = await productService.findByCategory(categoryId);
    console.log(products)
    return response.status(200).json(products);
  } catch (err) {
    return response
      .status(400)
      .json({ status: "Failed", message: err.message });
  }
};

