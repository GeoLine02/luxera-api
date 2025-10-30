import User from "./user";
import Products from "./products";
import SubCategories from "./subcategories";
import Categories from "./categories";
import ProductImages from "./productimages";
import Shop from "./shop";

// DON'T call associate() here!
export function initAssociations() {
  // Pass all models to each associate function
  const models = { User, Products, SubCategories, Categories,ProductImages,Shop };
  
  User.associate?.(models);
  Products.associate?.(models);
  SubCategories.associate?.(models);
  Categories.associate?.(models);
ProductImages.associate?.(models);
    Shop.associate?.(models);


}

// DON'T call it immediately - remove this line!
// initAssociations();

// Export models
export { User, Products, SubCategories, Categories };