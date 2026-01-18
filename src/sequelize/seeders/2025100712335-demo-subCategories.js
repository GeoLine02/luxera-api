"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SubCategories", [
      {
        sub_category_name: "Smartphones",
        sub_category_name_ka: "სმარტფონები",
        subcategory_image_s3_key: "smartphones.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Laptops",
        sub_category_name_ka: "ლეპტოპები",
        subcategory_image_s3_key: "laptops.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Sofas",
        sub_category_name_ka: "მდივნები",
        subcategory_image_s3_key: "sofas.jpg",
        category_id: 986,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Chairs",
        sub_category_name_ka: "სკამები",
        subcategory_image_s3_key: "chairs.jpg",
        category_id: 986,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "T-Shirts",
        sub_category_name_ka: "მაისურები",
        subcategory_image_s3_key: "tshirts.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Jeans",
        sub_category_name_ka: "ჯინსები",
        subcategory_image_s3_key: "jeans.jpg",
        category_id: 984,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // 🔽 New subcategories
      {
        sub_category_name: "Tablets",
        sub_category_name_ka: "ტაბლეტები",
        subcategory_image_s3_key: "tablets.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Headphones",
        sub_category_name_ka: "ყურსასმენები",
        subcategory_image_s3_key: "headphones.jpg",
        category_id: 983,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        sub_category_name: "Beds",
        sub_category_name_ka: "საწოლები",
        subcategory_image_s3_key: "beds.jpg",
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
