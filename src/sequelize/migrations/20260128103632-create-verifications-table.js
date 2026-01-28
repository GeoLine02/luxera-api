"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Verifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      max_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Verifications");
  },
};
