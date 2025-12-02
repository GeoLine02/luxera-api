"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
  },
};
