import express from "express";
import {getAllProduct, getCategories, getProductById, removeLikeProduct, saveLikeProduct} from "./product.apis";
import {jwtDecoder} from "@www/custom.middelewares";

export const productRouter = express.Router();

productRouter.use(jwtDecoder);
productRouter.route("/categories").get(getCategories);
productRouter.route("/product/get/all").get(getAllProduct);
productRouter.route("/product/:id").get(getProductById);
productRouter.route("/product/like").post(saveLikeProduct);
productRouter.route("/product/unlike").post(removeLikeProduct);
