"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Cities", [
      {
        city_name: "Tbilisi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        city_name: "Rustavi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        city_name: "Kutaisi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        city_name: "Batumi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Cities", null, {});
  },
};
