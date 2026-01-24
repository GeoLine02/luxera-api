"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "google_id", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("Users", "image", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add index on google_id for faster lookups
    await queryInterface.addIndex("Users", ["google_id"], {
      name: "users_google_id_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Users", "users_google_id_idx");
    await queryInterface.removeColumn("Users", "google_id");
    await queryInterface.removeColumn("Users", "image");
  },
};
