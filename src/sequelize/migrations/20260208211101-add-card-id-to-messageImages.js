"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ConversationMessageImages", "card_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "ConversationMessageProductCards",
        key: "id",
      },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ConversationMessageImages", "card_id");
  },
};
