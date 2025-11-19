import User from "./user";
import Products from "./products";
import SubCategories from "./subcategories";
import Categories from "./categories";
import ProductImages from "./productimages";
import Shop from "./shop";
import ProductVariants from "./productvariants";
import  Carts  from "./carts";
export  type TypeModels = {
  User: typeof User;
  Products: typeof Products;
  SubCategories: typeof SubCategories;
  Categories: typeof Categories;
  ProductImages: typeof ProductImages;
  Shop: typeof Shop;
  ProductVariants: typeof ProductVariants;
  Carts: typeof Carts;
};


export function initAssociations() {
  // Pass all models to each associate function
  const models : TypeModels = {
    User,
    Products,
    SubCategories,
    Categories,
    ProductImages,
    Shop,
    ProductVariants,
    Carts
  };

  User.associate?.(models);
  Shop.associate?.(models);
  Products.associate?.(models);
   Categories.associate?.(models);
  SubCategories.associate?.(models);
 
  ProductImages.associate?.(models);
  ProductVariants.associate?.(models);
  Carts.associate?.(models);
}

export { User, Products, SubCategories, Categories, Shop };
