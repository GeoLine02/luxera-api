'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("ProductVariants","variantPrice","variant_price")
  },
  async down (queryInterface, Sequelize) {
   await queryInterface.renameColumn("ProductVariants","variant_price","variantPrice")
  }
};
