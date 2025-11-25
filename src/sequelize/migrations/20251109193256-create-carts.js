'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Carts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        
        allowNull: false,
        references:{
          model:"Users",
          key:"id"

        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:"Products",
          key:"id"

        },

        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      product_quantity:{
        allowNull:false,
        type:Sequelize.INTEGER

      },
      product_variant_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references:{
          model:"ProductVariants",
          key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"SET NULL"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Carts');
  }
};