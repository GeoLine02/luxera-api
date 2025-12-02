import z from "zod";
 const AddcartItemSchema = z.object({
      productId: 
          z
            .int("Product ID must be an integer")
            .positive("Product ID must be a positive number"),
        
        userId: 
          z
            .int("User ID must be an integer")
            .positive("User ID must be a positive int"),
        
        variantId:
          z
            .int("Variant ID must be an integer")
            .positive("Variant ID must be a positive number").optional().nullable()
 })

 const DeleteCartItemSchema =  z.object({
       productId: z.int("Product ID must be an integer").positive("Product ID must be a positive number"),    
        userId: z.int("User ID must be an integer").positive("User ID must be a positive int"),
        removeCompletely:z.boolean("Remove completely must be a boolean").optional()
})
export  {AddcartItemSchema,DeleteCartItemSchema};