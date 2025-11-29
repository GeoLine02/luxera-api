'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
// Step 1: Drop the existing default
    await queryInterface.changeColumn('Products', 'product_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: null // Remove default temporarily
    });

    // Step 2: Change to ENUM type
    await queryInterface.changeColumn('Products', 'product_status', {
      type: Sequelize.ENUM('pending', 'active', 'vip'),
      allowNull: false
    });

    // Step 3: Add the new default
    await queryInterface.changeColumn('Products', 'product_status', {
      type: Sequelize.ENUM('pending', 'active', 'vip'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.changeColumn("Products","product_status",{
    type: Sequelize.STRING,
    allowNull:false,
   })
  }
};
