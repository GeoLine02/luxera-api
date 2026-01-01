"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Categories", "category_name_ka", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("SubCategories", "sub_category_name_ka", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "category_name_ka");

    await queryInterface.removeColumn("SubCategories", "sub_category_name_ka");
  },
};
