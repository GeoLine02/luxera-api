"use strict";

const { title } = require("node:process");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationMessageProductCards", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      conversation_message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ConversationMessages",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      link: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ConversationMessageProductCards");
  },
};
