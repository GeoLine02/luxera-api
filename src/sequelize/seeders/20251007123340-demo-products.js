"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "Products",
      [
        {
          product_name: "Product 1",
          product_price: 100,
          product_rating: 5,
          product_image: "https://example.com/product1.jpg",
          product_owner_id: 1,
          product_subcategory_id: 1,
          product_status: "basic",
          createdAt: new Date(),
          updatedAt: new Date(),
   shop_id:1
        },
        {
          product_name: "Product 2",
          product_price: 200,
          product_rating: 4,
          product_image: "https://example.com/product2.jpg",
          product_owner_id: 1,
         product_subcategory_id: 2,
          product_status: "vip",
          createdAt: new Date(),
          updatedAt: new Date(),
   shop_id:1
        },
        {
          product_name: "Product 3",
          product_price: 150,
          product_rating: 3,
          product_image: "https://example.com/product3.jpg",
          product_owner_id: 1,
         product_subcategory_id: 3,
          product_status: "basic",
          createdAt: new Date(),
          updatedAt: new Date(),
 shop_id:1
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Products", {}, {});
  },
};
