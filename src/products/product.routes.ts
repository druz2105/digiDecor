import express from "express";
import { getCategories, getProductByCategory } from "./product.apis";

export const productRouter = express.Router();

productRouter.route("/categories").get(getCategories);
productRouter.route("/product/getby/category").get(getProductByCategory);
