import User from "./user";
import Products from "./products";
import SubCategories from "./subcategories";
import Categories from "./categories";
import ProductImages from "./productimages";
import Shop from "./shop";
import ProductVariants from "./productvariants";
import Carts from "./carts";
import Notifications from "./notifications";
import Cities from "./cities";
import Orders from "./orders";
import OrderTotals from "./orderTotals";
import OrderProducts from "./orderProducts";
import { Conversation } from "./conversation";
import { ConversationMessage } from "./conversationMessage";
import { ConversationMessageImage } from "./conversationMessageImages";
import { ConversationMessageProductCard } from "./conversationMessageProductCards";

export type TypeModels = {
  User: typeof User;
  Products: typeof Products;
  SubCategories: typeof SubCategories;
  Categories: typeof Categories;
  ProductImages: typeof ProductImages;
  Shop: typeof Shop;
  ProductVariants: typeof ProductVariants;
  Carts: typeof Carts;
  Notifications: typeof Notifications;
  Cities: typeof Cities;
  Orders: typeof Orders;
  OrderTotals: typeof OrderTotals;
  OrderProducts: typeof OrderProducts;
  Conversation: typeof Conversation;
  ConversationMessage: typeof ConversationMessage;
  ConversationMessageImage: typeof ConversationMessageImage;
  ConversationMessageProductCard: typeof ConversationMessageProductCard;
};

export function initAssociations() {
  // Pass all models to each associate function
  const models: TypeModels = {
    User,
    Products,
    SubCategories,
    Categories,
    ProductImages,
    Shop,
    ProductVariants,
    Carts,
    Notifications,
    Cities,
    Orders,
    OrderTotals,
    OrderProducts,
    Conversation,
    ConversationMessage,
    ConversationMessageImage,
    ConversationMessageProductCard,
  };

  User.associate?.(models);
  Shop.associate?.(models);
  Products.associate?.(models);
  Categories.associate?.(models);
  SubCategories.associate?.(models);
  ProductImages.associate?.(models);
  ProductVariants.associate?.(models);
  Carts.associate?.(models);
  Notifications.associate?.(models);
  Cities.associate?.(models);
  Orders.associate?.(models);
  OrderTotals.associate?.(models);
  OrderProducts.associate?.(models);
  Conversation.associate?.(models);
  ConversationMessage.associate?.(models);
  ConversationMessageImage.associate?.(models);
  ConversationMessageProductCard.associate?.(models);
}

export { User, Products, SubCategories, Categories, Shop, Cities };
