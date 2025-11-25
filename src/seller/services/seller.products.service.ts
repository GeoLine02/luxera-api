
import { Op } from "sequelize";
import sequelize from "../../db";
import Categories from "../../sequelize/models/categories";
import ProductImages from "../../sequelize/models/productimages";
import Products from "../../sequelize/models/products";
import ProductVariants from "../../sequelize/models/productvariants";
import SubCategories from "../../sequelize/models/subcategories";
import { CreateProductPayload,  ProductUpdatePayload } from "../../types/products";
import { Request,Response } from "express";
import { th } from "zod/v4/locales";
export async function CreateProductService(
  data:CreateProductPayload,
  req: Request,
  res:Response

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
      variantImagesMap = {},
      
      userId,
    } = data;

    // Validate category & subcategory
    const category = await Categories.findByPk(productCategoryId);
  
    const subCategory = await SubCategories.findOne({
      where: { id: subCategoryId, category_id: productCategoryId },
    });

    if (!category || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or subcategory",
      });
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


    const images = productPreviewImages.map((image) => ({
      image: `${baseUrl}${image.filename}`,
      product_id: createdProduct.id,
    }));
    await ProductImages.bulkCreate(images);

    if (variantsMetadata && variantsMetadata.length > 0) {
      const variantsToCreate = variantsMetadata.map((variant) => ({
        variant_name: variant.variantName,
        variant_price: variant.variantPrice,
        variant_quantity: variant.variantQuantity,
        variant_discount: variant.variantDiscount,
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
              product_id: createdVariant.product_id,
              variant_id: createdVariant.id, // Use the actual variant ID from database
            });
          });
        }
      });

      if (allVariantImages.length > 0) {
        await ProductImages.bulkCreate(allVariantImages);
        console.log(`Inserted ${allVariantImages.length} variant images`);
      }
       return {
      product: createdProduct,
      images,
      variants: {
        data:createdVariants,
        allVariantImages,
      },

    };
    }
  return {
    product: createdProduct,
    images,
    variants: {
      data: [],
      allVariantImages: [],
    },
  };

   
  } catch (error) {
    console.error("CreateProductService error:", error);
    throw new Error("Unable to create product");
  }
}

export async function UpdateProductService(
  data: ProductUpdatePayload, 
  req: Request,
  res:Response  
  
) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    const productPreviewImageUrls = data.productPreviewImages.map(
      (file) => `${baseUrl}${file.filename}`
    );
    const {
productCategoryId,
subCategoryId,
productDescription,
productPrice,
productStatus,
productName,
productId,
productPreviewImages,
userId,
variantsMetadata,
variantImagesMap = {},
    } = data

    const fieldsToUpdate = {
      product_name: productName,
      product_description: productDescription,
      product_price: productPrice,
      product_status: productStatus,
      product_category_id: productCategoryId,
      sub_category_id: subCategoryId,
      product_image: `${baseUrl}${productPreviewImages[0].filename}`,
      user_id: userId,
      
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });

    // ✅ Update product info
    const [updatedCount, updatedRows] = await Products.update(fieldsToUpdate, {
      where: { id:productId },
      returning: true,
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Replace product preview images (not variant images)
    if (productPreviewImageUrls.length > 0) {

      await ProductImages.destroy({ 
        where: { 
          product_id: productId,
        } 
      })
     const imagesToInsert = productPreviewImageUrls.map((url)=>({
      image: url,
      product_id: productId,
     }))
      // Insert new preview images
      await ProductImages.bulkCreate(
        imagesToInsert,
      );
    }

 // ✅ Return updated product with all images
    const updatedProduct = updatedRows[0];
    const updatedImages = await ProductImages.findAll({
      where: { product_id: productId },
    });

   if(variantsMetadata && variantsMetadata.length > 0){
    
    // Delete all existing variants for this product

    await ProductVariants.destroy({
      where: {
        product_id: productId,
      },
    })
      // And recreate all variants 
  const newVariants = await ProductVariants.bulkCreate(
    variantsMetadata.map((variant) => ({
      variant_name: variant.variantName,
        variant_price: variant.variantPrice,
        variant_quantity: variant.variantQuantity,
        variant_discount: variant.variantDiscount,
        product_id: productId
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
          product_id: productId,
          variant_id: newVariant.id
        });
      });
    });
      if (allVariantImages.length > 0) {
      await ProductImages.bulkCreate(allVariantImages);
    }
return {
      product: updatedProduct,
      images: updatedImages,
      variants:{
        data:newVariants,
        allVariantImages
      }
    };
  }
   }

    return {
      product: updatedProduct,
      images: updatedImages,
      variants:{
        data:[],
        allVariantImages:[]
      }
    };

  } catch (error) {
    console.error(error);
    throw new Error("Unable to update product");
  }
}

export async function DeleteProductService(productId: string,res:Response) {
  try {
    const deletedProduct = await Products.destroy({ where: { id: productId } });
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return deletedProduct;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete product");
  }
}
export async function GetSellerProductsService(req:Request){
    try{
        sequelize.authenticate()

        const shop = req.shop
        const sellerProducts = await Products.findAll({
    where: {
        shop_id: shop!.id
    },

    attributes: ['id', 'product_name', 'product_price', 'product_status', 'product_image'],
    include: [
        {
            model: ProductImages,
            as: "images",
            attributes: ["id", "image"],
            where: {
                variant_id: null
            },
           
        },
        {
            model: ProductVariants,
            as: "variants",
            attributes: ["id", "variant_name", "variant_price", "variant_quantity", "variant_discount"],
            required: false,
            include: [  
                {
                    model: ProductImages,
                    required:false,
                    as: "images",  
                    attributes: ["id", "image"]
                }
            ]
        }
    ]
});     
return sellerProducts
  
    }catch(error){
    console.log("GetSellerProductsService error:", error);
    throw new Error("Unable to fetch seller products");
    }
}
