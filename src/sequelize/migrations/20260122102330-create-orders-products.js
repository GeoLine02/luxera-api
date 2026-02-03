"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderProducts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.UUID,
        references: {
          model: "Orders",
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Products",
        },
        allowNull: false,
      },
      shop_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Shops",
        },
        allowNull: false,
      },
      variant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "ProductVariants",
        },
        allowNull: false,
      },
      product_tax: {
        type: Sequelize.DECIMAL(7, 4),
      },
      product_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      product_price: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false,
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
    await queryInterface.dropTable("OrderProducts");
  },
};
