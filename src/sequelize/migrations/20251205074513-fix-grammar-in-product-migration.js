"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "Products",
      "sells_per_day",
      "sales_per_day"
    );
    await queryInterface.renameColumn(
      "Products",
      "sells_per_month",
      "sales_per_month"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "Products",
      "sales_per_day",
      "sells_per_day"
    );
    await queryInterface.renameColumn(
      "Products",
      "sales_per_month",
      "sells_per_month"
    );
  },
};
