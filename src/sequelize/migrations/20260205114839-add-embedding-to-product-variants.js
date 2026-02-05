// migrations/add-embedding-to-product-variants.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Install pgvector extension
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS vector",
    );
    // Add proper vector column
    await queryInterface.sequelize.query(
      'ALTER TABLE "ProductVariants" ADD COLUMN embedding vector(728)',
    );

    // Create index
    await queryInterface.sequelize.query(
      'CREATE INDEX product_variants_embedding_idx ON "ProductVariants" USING ivfflat (embedding vector_cosine_ops)',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS product_variants_embedding_idx",
    );
    await queryInterface.removeColumn("ProductVariants", "embedding");
  },
};
