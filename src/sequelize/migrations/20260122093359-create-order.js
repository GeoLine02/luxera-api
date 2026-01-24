"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },

      customer_street_address: {
        type: Sequelize.STRING,
      },
      customer_city: {
        type: Sequelize.STRING,
      },
      customer_postcode: {
        type: Sequelize.STRING,
      },
      customer_state: {
        type: Sequelize.STRING,
      },
      customer_country: {
        type: Sequelize.STRING,
      },
      customer_telephone: {
        type: Sequelize.STRING,
      },
      customer_email: {
        type: Sequelize.STRING,
      },
      payment_method: {
        type: Sequelize.STRING,
      },
      date_purchased: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM(
          "order_cancelled",
          "order_delivered",
          "order_in_transit",
          "order_payment_due",
          "order_pickup_available",
          "order_problem",
          "order_processing",
          "order_returned",
          "order_pending_payment",
          "order_paid",
        ),
      },
      currency: {
        type: Sequelize.CHAR(3),
        allowNull: false,
      },
      shipping_module: {
        type: Sequelize.STRING,
      },
      shipping_tax: {
        type: Sequelize.DECIMAL(7, 2),
      },
      shipping_tax_rate: {
        type: Sequelize.DECIMAL(7, 2),
      },
      gateway_order_id: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Orders");
  },
};
