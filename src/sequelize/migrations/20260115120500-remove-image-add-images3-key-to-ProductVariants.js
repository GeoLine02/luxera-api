"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductVariants", "image");
    await queryInterface.addColumn("ProductVariants", "image_s3_key", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductVariants", "image", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("ProductVariants", "image_s3_key");
  },
};
