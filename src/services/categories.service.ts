import sequelize from "../db";
import Categories from "../sequelize/models/categories";
import SubCategories from "../sequelize/models/subcategories";

export async function GetAllCategoriesService() {
  try {
    sequelize.authenticate();

    const categories = await Categories.findAll({
      include: {
        model: SubCategories,
        as: "subCategories",
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch categories");
  }
}


export async function GetAllSubCategoriesService() {
  try {
    sequelize.authenticate();

    const subCategories = SubCategories.findAll();

    return subCategories;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to fetch subCategories");
  }
}
