"use strict";

const { on } = require("events");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "ConversationMessageProductCards",
      "variant_id",
      {
        type: Sequelize.INTEGER,
        references: {
          model: "ProductVariants",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
    );
    await queryInterface.addColumn(
      "ConversationMessageProductCards",
      "product_id",
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Products",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
    );
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "title",
    );
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "description",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "variant_id",
    );
    await queryInterface.removeColumn(
      "ConversationMessageProductCards",
      "product_id",
    );
    await queryInterface.addColumn("ConversationMessageProductCards", "title", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn(
      "ConversationMessageProductCards",
      "description",
      {
        type: Sequelize.TEXT,
      },
    );
  },
};
