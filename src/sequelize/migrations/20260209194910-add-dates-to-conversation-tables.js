"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ConversationMessageImages", "created_at", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("ConversationMessageImages", "updated_at", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn(
      "ConversationMessageProductCards",
      "created_at",
      {
        type: Sequelize.DATE,
      },
    );
    await queryInterface.addColumn(
      "ConversationMessageProductCards",
      "updated_at",
      {
        type: Sequelize.DATE,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "ConversationMessageImages",
      "created_at",
    );
    await queryInterface.removeColumn(
      "ConversationMessageImages",
      "updated_at",
    );
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "created_at",
    );
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "updated_at",
    );
  },
};
