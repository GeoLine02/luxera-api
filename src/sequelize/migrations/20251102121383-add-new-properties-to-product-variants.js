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

    await queryInterface.addColumn("ProductVariants", "variantQuantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn("ProductVariants", "variantDiscount", {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.renameColumn(
      "ProductVariants",
      "product_variant",
      "variantName"
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert changes
    await queryInterface.removeColumn("ProductVariants", "variantPrice");
    await queryInterface.removeColumn("ProductVariants", "variantQuantity");
    await queryInterface.removeColumn("ProductVariants", "variantDiscount");

    await queryInterface.renameColumn(
      "ProductVariants",
      "variantName",
      "product_variant"
    );
  },
};
