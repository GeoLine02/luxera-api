"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid 
          WHERE t.typname = 'enum_Products_product_status' AND e.enumlabel = 'featured') THEN
          ALTER TYPE "enum_Products_product_status" ADD VALUE 'featured';
        END IF;
      END$$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Products", "product_status", {
      type: Sequelize.STRING,
    });
  },
};
