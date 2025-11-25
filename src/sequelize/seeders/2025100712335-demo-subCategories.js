"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SubCategories", [
      {
        sub_category_name: "Smartphones",
        sub_category_image: "smartphones.jpg",
        category_id: 1, // Make sure this category exists
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Laptops",
        sub_category_image: "laptops.jpg",
        category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      {
        sub_category_name: "Sofas",
        sub_category_image: "sofas.jpg",
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Chairs",
        sub_category_image: "chairs.jpg",
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "T-Shirts",
        sub_category_image: "tshirts.jpg",
        category_id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Jeans",
        sub_category_image: "jeans.jpg",
        category_id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SubCategories", null, {});
  },
};
