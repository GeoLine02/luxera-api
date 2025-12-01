"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("ProductImages", "variant_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "ProductVariants",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("ProductImages", "variant_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
