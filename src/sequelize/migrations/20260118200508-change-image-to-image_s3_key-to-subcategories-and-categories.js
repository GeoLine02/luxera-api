"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename sub_category_image → subcategory_image_s3_key in SubCategories table
    await queryInterface.renameColumn(
      "SubCategories",
      "sub_category_image",
      "subcategory_image_s3_key",
    );

    // Rename category_image → category_image_s3_key in Categories table
    await queryInterface.renameColumn(
      "Categories",
      "category_image",
      "category_image_s3_key",
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes (rename back to original names)
    await queryInterface.renameColumn(
      "SubCategories",
      "subcategory_image_s3_key",
      "sub_category_image",
    );
    await queryInterface.renameColumn(
      "Categories",
      "category_image_s3_key",
      "category_image",
    );
  },
};
