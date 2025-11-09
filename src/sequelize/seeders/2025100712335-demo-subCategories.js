"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SubCategories", [
      {
        subCategoryName: "Smartphones",
        subCategoryImage: "smartphones.jpg",
        categoryId: 1, // Make sure this category exists
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subCategoryName: "Laptops",
        subCategoryImage: "laptops.jpg",
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subCategoryName: "Sofas",
        subCategoryImage: "sofas.jpg",
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subCategoryName: "Chairs",
        subCategoryImage: "chairs.jpg",
        categoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subCategoryName: "T-Shirts",
        subCategoryImage: "tshirts.jpg",
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        subCategoryName: "Jeans",
        subCategoryImage: "jeans.jpg",
        categoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SubCategories", null, {});
  },
};
