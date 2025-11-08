"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_name: {
        type: Sequelize.STRING,
      },
      product_price: {
        type: Sequelize.INTEGER,
      },
      product_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      product_rating: {
        type: Sequelize.INTEGER,
      },
      product_image: {
        type: Sequelize.STRING,
      },
      product_status: {
        type: Sequelize.STRING,
      },
      product_owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      product_subcategory_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "SubCategories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
