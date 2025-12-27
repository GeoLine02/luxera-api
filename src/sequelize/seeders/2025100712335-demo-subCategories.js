"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SubCategories", [
      {
        sub_category_name: "Smartphones",
        sub_category_image: "smartphones.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Laptops",
        sub_category_image: "laptops.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Sofas",
        sub_category_image: "sofas.jpg",
        category_id: 986,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Chairs",
        sub_category_image: "chairs.jpg",
        category_id: 986,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "T-Shirts",
        sub_category_image: "tshirts.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Jeans",
        sub_category_image: "jeans.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // 🔽 New subcategories
      {
        sub_category_name: "Tablets",
        sub_category_image: "tablets.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Headphones",
        sub_category_image: "headphones.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Beds",
        sub_category_image: "beds.jpg",
        category_id: 986,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SubCategories", null, {});
  },
};
