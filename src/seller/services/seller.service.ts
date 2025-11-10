import { Op } from "sequelize";
import sequelize from "../../db";
import Categories from "../../sequelize/models/categories";
import ProductImages from "../../sequelize/models/productimages";
import Products from "../../sequelize/models/products";
import ProductVariants from "../../sequelize/models/productvariants";
import SubCategories from "../../sequelize/models/subcategories";
import { ProductPayload, ProductUpdatePayload } from "../../types/products";
import { Request } from "express";
export async function CreateProductService(
  data: ProductPayload,
  req: Request,
  variantImagesMap: Record<string, Express.Multer.File[]> = {}
) {
  try {
    const shop = req.shop;
    
    const {
      productName,
      productDescription,
      productCategoryId,
      subCategoryId,
      productPrice,
      productQuantity,
      productPreviewImages,
      productDiscount,
      variantsMetadata,
      userId,
    } = data;

    // Validate category & subcategory
    const category = await Categories.findByPk(productCategoryId);
    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, categoryId: productCategoryId },
    });

    if (!category || !subCategory) {
      throw new Error("Invalid category or subcategory");
    }

    // Base URL for images
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
 console.log(productPreviewImages)
    // 1️⃣ Create the main product
    const createdProduct = await Products.create({
      product_name: productName,
      product_description: productDescription,
      product_price: productPrice || 0,
      product_quantity: productQuantity || 0,
      product_discount: productDiscount || 0,
      product_rating: 0,
      product_status: "active",
      product_subcategory_id: subCategory.id,
      product_owner_id: userId,
      product_image: `${baseUrl}${productPreviewImages[0].filename}`,
      shop_id: shop!.id,
    });

    if (!createdProduct) {
      throw new Error("Failed to create product");
    }
  
    const images = productPreviewImages.map((image) => ({
      image: `${baseUrl}${image.filename}`,
      productId: createdProduct.id,
    }));
    await ProductImages.bulkCreate(images);

    if (variantsMetadata && variantsMetadata.length > 0) {
      const variantsToCreate = variantsMetadata.map((variant) => ({
        variantName: variant.variantName,
        variantPrice: variant.variantPrice,
        variantQuantity: variant.variantQuantity,
        variantDiscount: variant.variantDiscount,
        product_id: createdProduct.id,
      }));

      const createdVariants = await ProductVariants.bulkCreate(
        variantsToCreate,
        {
          returning: true, // Important: Get the created variants with their IDs
        }
      );

      // 4️⃣ Insert variant images into ProductImages table
      const allVariantImages: any[] = [];

      createdVariants.forEach((createdVariant, index) => {
        const variantMeta = variantsMetadata[index];
        const variantImages = variantImagesMap[variantMeta.index] || [];

        if (variantImages.length > 0) {
          variantImages.forEach((image) => {
            allVariantImages.push({
              image: `${baseUrl}${image.filename}`,
              productId: createdProduct.id,
              variant_id: createdVariant.id, // Use the actual variant ID from database
            });
          });
        }
      });

      if (allVariantImages.length > 0) {
        await ProductImages.bulkCreate(allVariantImages);
        console.log(`Inserted ${allVariantImages.length} variant images`);
      }
    }


    return createdProduct;
  } catch (error) {
    console.error("CreateProductService error:", error);
    throw new Error("Unable to create product");
  }
}

export async function UpdateProductService(
  data: ProductUpdatePayload, 
  req: Request,  
  variantImagesMap: Record<string, Express.Multer.File[]> = {}
) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    const productPreviewImageUrls = data.productPreviewImages.map(
      (file) => `${baseUrl}${file.filename}`
    );

    const fieldsToUpdate = {
      product_name: data.productName,
      product_description: data.productDescription,
      product_price: data.productPrice,
      product_status: data.productStatus,
      product_category_id: data.productCategoryId,
      sub_category_id: data.subCategoryId,
      product_image: `${baseUrl}${data.productPreviewImages[0].filename}`,
      user_id: data.userId,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });

    // ✅ Update product info
    const [updatedCount, updatedRows] = await Products.update(fieldsToUpdate, {
      where: { id: data.productId },
      returning: true,
    });

    if (updatedCount === 0) {
      throw new Error("Product not found");
    }

    // ✅ Replace product preview images (not variant images)
    if (productPreviewImageUrls.length > 0) {

      await ProductImages.destroy({ 
        where: { 
          productId: data.productId,
        } 
      })
     const imagesToInsert = productPreviewImageUrls.map((url)=>({
      image: url,
      productId: data.productId,
     }))
      // Insert new preview images
      await ProductImages.bulkCreate(
        imagesToInsert,
      );
    }

   const variantsMetadata = data.variantsMetadata
   if(variantsMetadata && variantsMetadata.length > 0){
    
    // Delete all existing variants for this product

    await ProductVariants.destroy({
      where: {
        product_id: data.productId,
      },
    })
   }

   // And recreate all variants 
  const newVariants = await ProductVariants.bulkCreate(
    variantsMetadata.map((variant) => ({
      variantName: variant.variantName,
      variantPrice: variant.variantPrice,
      variantQuantity: variant.variantQuantity,
      variantDiscount: variant.variantDiscount,
      product_id: data.productId
    })),
    { returning: true }
  );
  // Now lets handle variant Images. variant images and productImages are same relations
  if(Object.keys(variantImagesMap).length>0){

// Recreate variant images. First build variantImages
const allVariantImages:any[] = []
 newVariants.forEach((newVariant, index) => {
      const variantMeta = variantsMetadata[index];
      const variantImages = variantImagesMap[variantMeta.index] || [];

      variantImages.forEach((image) => {
        allVariantImages.push({
          image: `${baseUrl}${image.filename}`,
          productId: data.productId,
          variant_id: newVariant.id
        });
      });
    });
      if (allVariantImages.length > 0) {
      await ProductImages.bulkCreate(allVariantImages);
    }

  }


    // ✅ Return updated product with all images
    const updatedProduct = updatedRows[0];
    const updatedImages = await ProductImages.findAll({
      where: { productId: data.productId },
    });

    return {
      message: "Product updated successfully",
      product: updatedProduct,
      images: updatedImages,
    };

  } catch (error) {
    console.error(error);
    throw new Error("Unable to update product");
  }
}

export async function DeleteProductService(productId: string) {
  try {
    const deletedProduct = await Products.destroy({ where: { id: productId } });

    if (deletedProduct) {
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete product");
  }
}
