
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductWithInventory } from "@/hooks/useProducts";
import { useInventorySync } from "@/hooks/useInventorySync";

const editProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  size: z.string().min(1, "Size is required"),
  base_price: z.number().min(0, "Price must be positive"),
  pack_size: z.number().optional(),
  trademark: z.string().optional(),
  description: z.string().optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  product: ProductWithInventory;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditProductModal = ({ product, isOpen, onClose, onSuccess }: EditProductModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { refreshInventoryData } = useInventorySync();

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: product.name,
      sku: product.sku,
      size: product.size,
      base_price: product.base_price,
      pack_size: product.pack_size || undefined,
      trademark: product.trademark || "",
      description: product.description || "",
    },
  });

  const onSubmit = async (data: EditProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Updating product:', product.id, data);

      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          sku: data.sku,
          size: data.size,
          base_price: data.base_price,
          pack_size: data.pack_size || null,
          trademark: data.trademark || null,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      console.log('Product updated successfully');

      toast({
        title: "Product Updated",
        description: `${data.name} has been successfully updated.`,
      });

      refreshInventoryData();
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();

    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Product
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (KD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder="0.000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pack_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pack Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter pack size" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trademark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trademark</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trademark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
