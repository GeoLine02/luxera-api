"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to ProductVariants
    await queryInterface.addColumn("ProductVariants", "variantPrice", {
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

    await queryInterface.renameColumn(
      "ProductVariants",
      "product_variant",
      "variant_name"
    );
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn("ProductVariants", "variantPrice");

    await queryInterface.removeColumn("ProductVariants", "variant_quantity");
    await queryInterface.removeColumn("ProductVariants", "variant_discount");

    await queryInterface.renameColumn(
      "ProductVariants",
      "variant_name",
      "product_variant"
    );
  },
};
