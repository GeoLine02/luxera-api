"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Remove column
    await queryInterface.removeColumn("Users", "role");

    // 2️⃣ Drop enum type completely
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_role";'
    );

    // 3️⃣ Recreate column with NEW enum definition
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.ENUM("user", "admin", "seller"),
      allowNull: false,
      defaultValue: "user",
    });
  },

  async down(queryInterface, Sequelize) {
    // 1️⃣ Remove column
    await queryInterface.removeColumn("Users", "role");

    // 2️⃣ Drop enum type again
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_role";'
    );

    // 3️⃣ Restore old enum
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.ENUM("user", "admin", "shopOwner"),
      allowNull: false,
      defaultValue: "user",
    });
  },
};
