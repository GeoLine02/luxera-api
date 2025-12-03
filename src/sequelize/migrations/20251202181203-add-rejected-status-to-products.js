"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
    -- Step 1: Create temp enum with target values (idempotent)
    DO $$ 
    BEGIN
      DROP TYPE IF EXISTS "enum_Products_product_status_new" CASCADE;
      CREATE TYPE "enum_Products_product_status_new" AS ENUM ('pending', 'active', 'vip', 'rejected');
    END $$;

    -- Step 2: Drop default before type change
    ALTER TABLE "Products" 
    ALTER COLUMN product_status DROP DEFAULT;

    -- Step 3: Alter column to new type (cast data)
    ALTER TABLE "Products" 
    ALTER COLUMN product_status 
    TYPE "enum_Products_product_status_new" 
    USING (product_status::text::"enum_Products_product_status_new");

    -- Step 4: Re-add default
    ALTER TABLE "Products" 
    ALTER COLUMN product_status 
    SET DEFAULT 'pending'::"enum_Products_product_status_new";

    -- Step 5: Replace old enum with new one
    DROP TYPE "enum_Products_product_status" CASCADE;
    ALTER TYPE "enum_Products_product_status_new" 
    RENAME TO "enum_Products_product_status";
  `,
      { raw: true }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
    -- Step 1: Create temp enum with original values (idempotent)
    DO $$ 
    BEGIN
      DROP TYPE IF EXISTS "enum_Products_product_status_revert" CASCADE;
      CREATE TYPE "enum_Products_product_status_revert" AS ENUM ('pending', 'active', 'vip', 'rejected', 'featured');
    END $$;

    -- Step 2: Drop default before type change
    ALTER TABLE "Products" 
    ALTER COLUMN product_status DROP DEFAULT;

    -- Step 3: Alter column to temp enum (cast data)
    ALTER TABLE "Products" 
    ALTER COLUMN product_status 
    TYPE "enum_Products_product_status_revert" 
    USING (product_status::text::"enum_Products_product_status_revert");

    -- Step 4: Re-add default
    ALTER TABLE "Products" 
    ALTER COLUMN product_status 
    SET DEFAULT 'pending'::"enum_Products_product_status_revert";

    -- Step 5: Replace current enum with reverted one
    DROP TYPE "enum_Products_product_status" CASCADE;
    ALTER TYPE "enum_Products_product_status_revert" 
    RENAME TO "enum_Products_product_status";
  `,
      { raw: true }
    );
  },
};
