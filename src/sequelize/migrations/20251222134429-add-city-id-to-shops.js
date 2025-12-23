"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // city_id column
    await queryInterface.addColumn("Shops", "city_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Cities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // custom_city_name column
    await queryInterface.addColumn("Shops", "custom_city_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Shops", "custom_city_name");
    await queryInterface.removeColumn("Shops", "city_id");
  },
};
