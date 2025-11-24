'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id:543535425455245459487295
        
        ,
        full_name: 'John Doe',
        email:"johndoe@gmail.com",
        password: 'password123',
        role:"user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Users', null, {});
  }
};
