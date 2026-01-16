"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductVariants", "image_s3_key");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductVariants", "image_s3_key", {
      type: Sequelize.STRING,
      allowNull: true, // allow null during revert
    });
  },
};
