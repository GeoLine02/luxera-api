"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Products_product_status"
      ADD VALUE IF NOT EXISTS 'inactive';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Products_product_status"
      ADD VALUE IF NOT EXISTS 'out of stock';
    `);
  },

  async down(queryInterface, Sequelize) {},
};
