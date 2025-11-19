"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("SubCategories", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Categories", // name of the table you're referencing
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("SubCategories", "category_id");
  },
};
