"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Step 2: Create HNSW index for vector similarity search
      // This index is used for <-> (distance) operator in Postgres
      // Step 3: Create B-tree index for price range filtering
      // Used for BETWEEN, <, > operators
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_variant_price 
         ON "ProductVariants" (variant_price);`,
        { transaction },
      );
      // Step 4: Create index for category filtering
      // Used for WHERE category_name = $1
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_category_name 
         ON "Categories" (category_name);`,
        { transaction },
      );
      // Step 5: Create index for subcategory filtering
      // Used for WHERE sub_category_name = $1
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_subcategory_name 
         ON "SubCategories" (sub_category_name);`,
        { transaction },
      );

      // Step 6: Optional - Create composite index for common query pattern
      // If you frequently query product + variant together

      // Step 7: Optional - Create index for image lookups
      // Used for LEFT JOIN on images with is_primary filter
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_image_variant_primary 
         ON "ProductImages" (variant_id, is_primary);`,
        { transaction },
      );

      await transaction.commit();
      console.log("✅ All search indexes created successfully");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Migration failed:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop indexes in reverse order (optional, but good practice)
      const indexes = [
        "idx_image_variant_primary",
        "idx_subcategory_name",
        "idx_category_name",
        "idx_variant_price",
      ];

      for (const indexName of indexes) {
        await queryInterface.sequelize.query(
          `DROP INDEX IF EXISTS ${indexName};`,
          { transaction },
        );
      }

      // Note: NOT dropping pgvector extension as it might be used elsewhere
      // Uncomment below only if you're sure pgvector is not used elsewhere
      // await queryInterface.sequelize.query(
      //   'DROP EXTENSION IF EXISTS vector;',
      //   { transaction }
      // );

      await transaction.commit();
      console.log("✅ All search indexes dropped successfully");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Rollback failed:", error);
      throw error;
    }
  },
};
