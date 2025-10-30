'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  await queryInterface.renameColumn('Products', 'product_category_id', 'product_subcategory_id');
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Products', 'product_subcategory_id', 'product_category_id');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }

}