"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "primary_variant_id");
    await queryInterface.removeColumn("Products", "product_name");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "primary_variant_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ProductVariants",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Products", "product_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
