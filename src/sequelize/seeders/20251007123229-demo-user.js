"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        id: 1,
        full_name: "test_account",
        email: "test@gmail.com",
        role: "user",
        password:
          "$2b$10$MeafNR7Eh9Hrc1/MRIBGSO7Tc53wN/V/jXg9UrEyp/CgNzPji5yyW",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
