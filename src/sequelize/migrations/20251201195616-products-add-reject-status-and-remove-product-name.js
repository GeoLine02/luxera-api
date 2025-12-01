"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "product_name");

    await queryInterface.changeColumn("Products", "product_status", {
      type: Sequelize.ENUM("pending", "active", "vip", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "product_name", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Products", "product_status", {
      type: Sequelize.ENUM("pending", "active", "vip"),
      allowNull: false,
    });
  },
};
