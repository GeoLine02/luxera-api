"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Conversations", "createdAt", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("Conversations", "updatedAt", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("ConversationMessages", "createdAt", {
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn("ConversationMessages", "updatedAt", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Conversations", "createdAt");
    await queryInterface.removeColumn("Conversations", "updatedAt");
    await queryInterface.removeColumn("ConversationMessages", "createdAt");
    await queryInterface.removeColumn("ConversationMessages", "updatedAt");
  },
};
