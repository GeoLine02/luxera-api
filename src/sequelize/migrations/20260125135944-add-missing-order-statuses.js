"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Orders_status" ADD VALUE 'order_pending_payment'`,
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Orders_status" ADD VALUE 'order_paid'`,
    );
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't allow removing enum values easily
    // Just document that this is irreversible
  },
};
