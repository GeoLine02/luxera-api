import Products from "../../sequelize/models/products";

export async function DeleteProductService(productId: string) {
  try {
    const deletedProduct = await Products.destroy({ where: { id: productId } });

    if (deletedProduct) {
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete product");
  }
}
