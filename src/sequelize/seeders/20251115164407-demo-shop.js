'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 await queryInterface.bulkInsert('Shops', [
  {
    id:794,
    shop_name: 'Demo Shop',
    password:"shop123",
    owner_id:1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
 ])
  },
  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
