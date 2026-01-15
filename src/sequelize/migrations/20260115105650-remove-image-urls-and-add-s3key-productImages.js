"use strict";

const { tr } = require("zod/locales");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductImages", "image");
    await queryInterface.addColumn("ProductImages", "s3_key", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("ProductImages", "image", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("ProductImages", "s3_key");
  },
};
