"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationMessageImages", {
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
      image_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ProductImages",
          key: "id",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ConversationMessageImages");
  },
};
