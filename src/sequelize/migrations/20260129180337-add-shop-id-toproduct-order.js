"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("OrderProducts", "shop_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Shops",
        key: "id",
      },
      onUpdate: "CASCADE", // recommended: if shop.id changes → update references
      onDelete: "RESTRICT", // or 'CASCADE' / 'SET NULL' — choose based on your rules
      // RESTRICT = prevent deleting shop if it has order products
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("OrderProducts", "shop_id");
  },
};
