"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "product_discount");
    await queryInterface.removeColumn("Products", "product_quantity");
    await queryInterface.removeColumn("Products", "product_price");
    await queryInterface.removeColumn("Products", "product_image");
    await queryInterface.addColumn("Products", "primary_variant_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ProductVariants",
        key: "id",
      },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "primary_variant_id");
    await queryInterface.addColumn("Products", "product_price", {
      type: Sequelize.DECIMAL,
      allowNull: false,
    });
    await queryInterface.addColumn("Products", "product_image", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("Products", "product_quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn("Products", "product_discount", {
      type: Sequelize.DECIMAL,
      allowNull: false,
    });
  },
};
