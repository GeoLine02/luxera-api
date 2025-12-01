"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("ProductVariants", "variant_discount", {
      type: Sequelize.FLOAT, // or DECIMAL if you prefer precise decimals
      allowNull: false,
      defaultValue: 0, // optional, if you want a default
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("ProductVariants", "variant_discount", {
      type: Sequelize.INTEGER, // change back to the original type
      allowNull: false,
      defaultValue: 0,
    });
  },
};
