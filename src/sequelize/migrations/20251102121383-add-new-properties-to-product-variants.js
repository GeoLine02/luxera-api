"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to ProductVariants
    await queryInterface.addColumn("ProductVariants", "variant_price", {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("ProductVariants", "variant_quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
    await queryInterface.addColumn("ProductVariants", "variant_discount", {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn("ProductVariants", "variant_price");
    await queryInterface.removeColumn("ProductVariants", "variant_quantity");
    await queryInterface.removeColumn("ProductVariants", "variant_discount");
   
  },
};
