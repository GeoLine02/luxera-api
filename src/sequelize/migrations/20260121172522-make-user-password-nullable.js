"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make password nullable
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Optional: Add provider column
    await queryInterface.addColumn("Users", "provider", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "local", // local or google
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert provider column
    await queryInterface.removeColumn("Users", "provider");

    // Make password NOT NULL again
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
